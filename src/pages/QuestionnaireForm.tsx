import React, { useState, useCallback, useEffect } from "react";
import FormBuilder from "../components/FormBuilder";
import QuestionSidebar from "../components/QuestionSidebar";
import FormHeader from "../components/FormHeader";
import QuestionSettingsModal from "../components/QuestionSettingsModal";
import ConditionalLogicModal from "../components/ConditionalLogicModal";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { v4 as uuidv4 } from "uuid";
import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  List,
  ChevronDown,
  SlidersHorizontal,
  Table,
  ArrowUpDown,
  Image,
  Star,
  Folder,
  Info,
  HelpCircle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface ApiQuestion {
  id: string;
  type: string;
  text: string;
  title: string;
  is_required: boolean;
  order: number;
  style?: string;
  attachment_type?: string;
  attachment?: string;
  related_group?: string;
  limit?: number;
  min_value?: number;
  max_value?: number;
  options?: Array<{
    id?: number;
    question?: number;
    depend_questionnaire?: string;
    priority: number;
    score: number;
    value: string;
    type: string;
    label?: string;
    option_kind: string;
    text?: string;
    is_other?: boolean;
    is_none?: boolean;
    is_all?: boolean;
    image_url?: string;
  }>;
  is_other?: boolean;
  is_none?: boolean;
  is_all?: boolean;
  randomize_options?: boolean;
  is_multiple_select?: boolean;
  min_selectable_choices?: number;
  max_selectable_choices?: number;
  rows?: Array<{
    id?: number;
    value: string;
    order: number;
  }>;
  columns?: Array<{
    id?: number;
    value: string;
    order: number;
  }>;
  shuffle_rows?: boolean;
  shuffle_columns?: boolean;
  count?: number;
  shape?: string;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: {
    left: string;
    center: string;
    right: string;
  };
  left_label?: string;
  middle_label?: string;
  right_label?: string;
  description?: string;
  step?: number;
  multiselectquestion?: {
    min_selection_count: string | null;
    max_selection_count: string | null;
  };
  mappings?: Array<{
    id: number;
    conditions: Array<{
      id: number;
      comparison_type: string;
      target_text: string;
      operator: string;
      target_question: number;
      target_option: number | null;
    }>;
    the_end: boolean;
    question: number;
    next_question: number;
  }>;
  conditions?: Array<{
    id: string;
    sourceOption: string;
    targetQuestionId: string;
  }>;
}

export interface QuestionOption {
  id?: number;
  question?: number;
  depend_questionnaire?: string | null;
  priority: number;
  score: number;
  value: string;
  type: string;
  label?: string | null;
  option_kind: string;
  is_other?: boolean;
  is_none?: boolean;
  is_all?: boolean;
  image_url?: string;
  text?: string;
}

export interface Question {
  id: string;
  type: string;
  title: string;
  label: string;
  isRequired: boolean;
  required?: boolean;
  order: number;
  attachmentType?: string;
  attachment?: string;
  attachment_type?: string;
  textType?: "short" | "long" | "email";
  maxChars?: number;
  minChars?: number;
  minNumber?: number;
  maxNumber?: number;
  options?: string[];
  optionValues?: string[];
  rawOptions?: QuestionOption[];
  hasOther?: boolean;
  hasNone?: boolean;
  hasAll?: boolean;
  otherOptionText?: string;
  randomizeOptions?: boolean;
  isMultiSelect?: boolean;
  minSelectableChoices?: number;
  maxSelectableChoices?: number;
  rows?: string[];
  columns?: string[];
  shuffleRows?: boolean;
  shuffleColumns?: boolean;
  ratingMax?: number;
  ratingStyle?: "star" | "heart" | "thumbs";
  hasMedia?: boolean;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  parentId?: string;
  children?: string[];
  conditions?: Array<{
    id: string;
    sourceOption: string;
    targetQuestionId: string;
  }>;
  mappings?: Array<{
    id: number;
    conditions: Array<{
      id: number;
      comparison_type: string;
      target_text: string;
      operator: string;
      target_question: number;
      target_option: number | null;
    }>;
    the_end: boolean;
    question: number;
    next_question: number;
  }>;
  description?: string;
  hasDescription?: boolean;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: {
    left: string;
    center: string;
    right: string;
  };
  imageOptions?: Array<{
    text: string;
    imageUrl?: string;
  }>;
  isMultiImage?: boolean;
  isSingleImage?: boolean;
  isPrioritize?: boolean;
  isCombobox?: boolean;
  isGrading?: boolean;
  isNumber?: boolean;
  isStatement?: boolean;
  isYesNo?: boolean;
  isWebsite?: boolean;
  isRangeSlider?: boolean;
  isEmail?: boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultValue?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  maxLength?: number;
}

interface Category {
  id: string;
  name: string;
}

interface QuestionnaireCompleted {
  answer_count: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  status: string;
  created: number;
  questionnaire_completed: QuestionnaireCompleted;
}

interface QuestionnaireResponse {
  data: Questionnaire;
  info: {
    status: number;
    message: string;
  };
}

const Index = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("بدون عنوان");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [selectedApiQuestion, setSelectedApiQuestion] =
    useState<ApiQuestion | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConditionalLogic, setShowConditionalLogic] = useState(false);
  const [isCreatingNewQuestion, setIsCreatingNewQuestion] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log("🔄 showConditionalLogic state changed:", showConditionalLogic);
    console.log("🔍 selectedApiQuestion state:", selectedApiQuestion?.id);
  }, [showConditionalLogic, selectedApiQuestion]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // SortableJS handles drag operations through the components directly

  useEffect(() => {
    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      navigate("/login");
      return;
    }

    if (id && id !== "new") {
      fetchQuestionnaire();
      fetchQuestions();
    }
  }, [id, accessToken]);

  const fetchQuestionnaire = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/sanjup/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پرسشنامه");
      }

      const data: QuestionnaireResponse = await response.json();
      if (data.info.status === 200) {
        setQuestionnaire(data.data);
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در دریافت اطلاعات پرسشنامه"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      console.log("🔄 Fetching questions and mappings...");

      // 1. دریافت سوالات
      const questionsResponse = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions-list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!questionsResponse.ok) {
        throw new Error("خطا در دریافت سوالات");
      }

      const questionsData = await questionsResponse.json();
      console.log("📋 Questions API Response:", questionsData);

      if (questionsData.info.status !== 200) {
        throw new Error(questionsData.info.message);
      }

      let questionsWithMappings = questionsData.data as ApiQuestion[];
      console.log("📋 Base questions count:", questionsWithMappings.length);

      // Debug: بررسی کامل تمام فیلدهای هر سوال
      console.log("🔍 Complete structure analysis of each question:");
      questionsWithMappings.forEach((question, index) => {
        console.log(
          `Question ${question.id} - All fields:`,
          Object.keys(question)
        );
        console.log(`Question ${question.id} - Full object:`, question);

        // بررسی فیلدهای مشکوک که ممکن است mappings باشند
        const suspiciousFields = Object.keys(question).filter(
          (key) =>
            key.toLowerCase().includes("map") ||
            key.toLowerCase().includes("condition") ||
            key.toLowerCase().includes("rule") ||
            key.toLowerCase().includes("logic") ||
            key.toLowerCase().includes("next") ||
            key.toLowerCase().includes("target")
        );

        if (suspiciousFields.length > 0) {
          console.log(
            `🎯 Question ${question.id} - Suspicious fields:`,
            suspiciousFields
          );
          suspiciousFields.forEach((field) => {
            console.log(`   ${field}:`, (question as any)[field]);
          });
        }
      });

      // 2. دریافت mappings از endpoint جداگانه - تست چندین endpoint (DISABLED FOR NOW)

      console.log("⏭️ Looking for mappings in existing questions data...");

      // Check if any questions already have mappings field
      let foundAnyMappings = false;
      questionsWithMappings.forEach((question) => {
        // Check for mappings field directly
        if ((question as any).mappings) {
          console.log(
            `✅ Found mappings field in question ${question.id}:`,
            (question as any).mappings
          );

          // If mappings exist, show their detailed structure
          if ((question as any).mappings.length > 0) {
            console.log(`🔍 Detailed mappings for question ${question.id}:`);
            (question as any).mappings.forEach(
              (mapping: any, index: number) => {
                console.log(`   Mapping ${index + 1}:`, mapping);
                if (mapping.conditions) {
                  console.log(`     Conditions:`, mapping.conditions);
                }
              }
            );
          }

          foundAnyMappings = true;
        }

        // Also check for other possible field names
        const possibleMappingFields = [
          "conditions",
          "conditional_logic",
          "rules",
          "next_questions",
          "mappings",
        ];
        possibleMappingFields.forEach((fieldName) => {
          const fieldValue = (question as any)[fieldName];
          if (
            fieldValue &&
            (Array.isArray(fieldValue)
              ? fieldValue.length > 0
              : Object.keys(fieldValue).length > 0)
          ) {
            console.log(
              `🔍 Found "${fieldName}" field in question ${question.id}:`,
              fieldValue
            );
            if (fieldName !== "mappings") foundAnyMappings = true;
          }
        });
      });

      if (!foundAnyMappings) {
        console.log("❌ No mapping fields found in any questions");
        console.log(
          "📋 Sample question structure:",
          questionsWithMappings[0]
            ? Object.keys(questionsWithMappings[0])
            : "No questions available"
        );
      }

      /*
      const mappingEndpoints = [
        `${BASE_URL}/api/v1/questionnaire/${id}/mappings`,
        `${BASE_URL}/api/v1/questionnaire/${id}/mapping`,
        `${BASE_URL}/api/v1/questionnaire/mapping/${id}`,
        `${BASE_URL}/api/v1/mapping/${id}`,
      ];

      let foundMappings = false;

      for (const endpoint of mappingEndpoints) {
        if (foundMappings) break;

        try {
          console.log(`🔍 Testing mappings endpoint: ${endpoint}`);
          const mappingsResponse = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          console.log(`📋 ${endpoint} status:`, mappingsResponse.status);

          if (mappingsResponse.ok) {
            const mappingsData = await mappingsResponse.json();
            console.log("📋 Mappings API Response:", mappingsData);

            if (mappingsData.info?.status === 200 && mappingsData.data) {
              console.log("✅ Found working mappings endpoint:", endpoint);
              console.log("✅ Combining questions with mappings...");

              // ترکیب mappings با questions
              questionsWithMappings = questionsWithMappings.map((question) => {
                const questionMappings = mappingsData.data.filter(
                  (mapping: any) =>
                    mapping.question?.toString() === question.id.toString()
                );

                if (questionMappings.length > 0) {
                  console.log(
                    `📋 Found ${questionMappings.length} mappings for question ${question.id}`
                  );
                  return {
                    ...question,
                    mappings: questionMappings,
                  };
                }

                return question;
              });

              console.log("✅ Questions combined with mappings successfully");
              foundMappings = true;
            } else {
              console.log("⚠️ Mappings response format invalid for:", endpoint);
            }
          } else {
            console.log(
              `⚠️ Endpoint ${endpoint} returned status:`,
              mappingsResponse.status
            );
          }
        } catch (mappingsError) {
          console.log(`⚠️ Failed to fetch from ${endpoint}:`, mappingsError);
        }
      }

      if (!foundMappings) {
        console.log(
          "📋 No working mappings endpoint found, using questions without mappings"
        );
      }
      */

      // 3. بررسی نهایی
      const finalQuestionsWithMappings = questionsWithMappings.filter(
        (q) => q.mappings && q.mappings.length > 0
      );

      if (finalQuestionsWithMappings.length > 0) {
        console.log(
          "🎉 Final questions with mappings:",
          finalQuestionsWithMappings.map((q) => ({
            id: q.id,
            type: q.type,
            title: q.title,
            mappingsCount: q.mappings?.length,
          }))
        );
      } else {
        console.log("📋 No questions have mappings in final result");
      }

      setQuestions(questionsWithMappings);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در دریافت سوالات"
      );
    }
  };

  const createQuestion = useCallback(
    async (questionData: Partial<Question>) => {
      try {
        if (!id || !accessToken) {
          throw new Error("Missing questionnaire ID or access token");
        }

        console.log("Full question data:", questionData);

        // Get the correct type from questionData
        const questionType = questionData.type;
        const textType = questionData.textType;
        const isMultiSelect = questionData.isMultiSelect;
        const isMultiImage = questionData.isMultiImage;

        console.log("Question type:", questionType);
        console.log("Text type:", textType);
        console.log("Is multi select:", isMultiSelect);
        console.log("Is multi select type:", typeof isMultiSelect);
        console.log("Is multi image:", isMultiImage);

        if (!questionType) {
          throw new Error("Question type is required");
        }

        // Determine the style based on question type for text questions
        let style;
        console.log("Checking style for type:", questionType);

        if (
          questionType === "text_question" ||
          questionType === "text_question_short" ||
          questionType === "text_question_long" ||
          questionType === "text_question_email"
        ) {
          if (questionType === "text_question_short" || textType === "short") {
            style = "short";
            console.log("Matched short text style");
          } else if (
            questionType === "text_question_long" ||
            textType === "long"
          ) {
            style = "long";
            console.log("Matched long text style");
          } else if (
            questionType === "text_question_email" ||
            textType === "email"
          ) {
            style = "email";
            console.log("Matched email style");
          }
        }

        console.log("Final style:", style);

        // Map the question type based on isMultiSelect for choice questions
        let mappedType = mapQuestionType(questionType);
        console.log("Initial mapped type:", mappedType);

        if (
          questionType === "single_select" ||
          questionType === "multi_select" ||
          questionType === "select_single_image" ||
          questionType === "select_multi_image"
        ) {
          console.log("This is a choice question");
          console.log("isMultiSelect value:", isMultiSelect);
          console.log("isMultiImage value:", isMultiImage);

          if (
            questionType === "select_single_image" ||
            questionType === "select_multi_image"
          ) {
            mappedType = isMultiImage
              ? "select_multi_image"
              : "select_single_image";
          } else {
            mappedType =
              isMultiSelect === true ? "multi_select" : "single_select";
          }

          console.log(
            "Final mapped type after multi-select check:",
            mappedType
          );
        }

        const apiData: any = {
          is_required: questionData.required || false,
          order: questions.length + 1,
          type: mappedType,
          style: style,
          title: questionData.label || "",
          attachment_type:
            (questionData as any).attachment_type ??
            (questionData.hasMedia ? questionData.mediaType : null),
          related_group: questionData.parentId || null,
          attachment:
            (questionData as any).attachment ??
            (questionData as any).mediaUrl ??
            undefined,
          caption: questionData.description,
        };

        // Add limit for text questions
        if (
          mappedType === "text_question" &&
          (style === "short" || style === "long")
        ) {
          apiData.limit = questionData.maxLength || 200;
        }

        // Add min and max values for number questions
        if (mappedType === "number_descriptive") {
          apiData.min_value = questionData.minNumber || 0;
          apiData.max_value = questionData.maxNumber || 5000;
        }

        // Add options based on question type
        if (
          mappedType === "single_select" ||
          mappedType === "multi_select" ||
          mappedType === "combobox"
        ) {
          const regularOptions =
            questionData.options?.map((text, index) => ({
              text,
              value: text,
              priority: index + 1,
              score: 0,
              type: "text",
              option_kind: "usual",
            })) || [];

          const otherOption = questionData.hasOther
            ? {
                text: questionData.otherOptionText || "سایر",
                value: questionData.otherOptionText || "سایر",
                priority: regularOptions.length + 1,
                score: 0,
                type: "text",
                option_kind: "etc",
              }
            : null;

          const noneOption = questionData.hasNone
            ? {
                text: "هیچکدام",
                value: "هیچکدام",
                priority: regularOptions.length + (otherOption ? 2 : 1),
                score: 0,
                type: "text",
                option_kind: "usual",
              }
            : null;

          const allOption = questionData.hasAll
            ? {
                text: "همه موارد",
                value: "همه موارد",
                priority:
                  regularOptions.length +
                  (otherOption ? 2 : 1) +
                  (noneOption ? 1 : 0),
                score: 0,
                type: "text",
                option_kind: "usual",
              }
            : null;

          apiData.options = [
            ...regularOptions,
            ...(otherOption ? [otherOption] : []),
            ...(noneOption ? [noneOption] : []),
            ...(allOption ? [allOption] : []),
          ];

          // Add multiselectquestion only for choice questions
          if (mappedType === "single_select" || mappedType === "multi_select") {
            apiData.multiselectquestion = {
              min_selection_count:
                questionData.minSelectableChoices?.toString() || null,
              max_selection_count:
                questionData.maxSelectableChoices?.toString() || null,
            };
          }
        } else if (mappedType === "range_slider") {
          // Generate options for range slider based on scaleMax
          const range = questionData.scaleMax || 5;
          apiData.options = Array.from({ length: range }, (_, i) => ({
            value: String(i + 1),
            priority: i + 1,
            type: "integer",
            option_kind: "usual",
          }));
          // Add labels for range slider
          apiData.right_label = questionData.scaleLabels?.right || "";
          apiData.left_label = questionData.scaleLabels?.left || "";
          apiData.middle_label = questionData.scaleLabels?.center || "";
        } else if (mappedType === "matrix") {
          // Add rows and columns for matrix question
          apiData.rows =
            questionData.rows?.map((row, index) => ({
              value: row,
              order: index + 1,
            })) || [];
          apiData.columns =
            questionData.columns?.map((col, index) => ({
              value: col,
              order: index + 1,
            })) || [];
          apiData.shuffle_rows = questionData.shuffleRows || false;
          apiData.shuffle_columns = questionData.shuffleColumns || false;
        } else if (mappedType === "prioritize") {
          // Add options for prioritize question
          apiData.options =
            questionData.options?.map((text, index) => ({
              text,
              value: text,
              priority: index + 1,
              score: 0,
              type: "text",
              option_kind: "usual",
            })) || [];
        } else if (mappedType === "grading") {
          // Add shape and options for grading question
          apiData.shape =
            questionData.ratingStyle === "thumbs"
              ? "like"
              : questionData.ratingStyle || "star";
          apiData.count = questionData.ratingMax?.toString() || "5";
          // Generate options based on count
          const count = parseInt(apiData.count);
          apiData.options = Array.from({ length: count }, (_, i) => ({
            priority: 1,
            score: 0,
            type: "integer",
            value: String(i + 1),
            option_kind: "usual",
          }));
        } else if (
          mappedType === "select_single_image" ||
          mappedType === "select_multi_image"
        ) {
          // Add options for image choice question
          apiData.options = [
            // Regular image options
            ...(questionData.imageOptions?.map((opt, index) => ({
              text: opt.text,
              value: opt.imageUrl,
              priority: index + 1,
              score: 0,
              type: "image",
              label: opt.text,
              option_kind: "usual",
            })) || []),
            // Add "other" option if enabled
            ...(questionData.hasOther
              ? [
                  {
                    text: questionData.otherOptionText || "سایر",
                    value: "",
                    priority: (questionData.imageOptions?.length || 0) + 1,
                    score: 0,
                    type: "text",
                    label: questionData.otherOptionText || "سایر",
                    option_kind: "etc",
                  },
                ]
              : []),
            // Add "none" option if enabled
            ...(questionData.hasNone
              ? [
                  {
                    text: "هیچکدام",
                    value: "",
                    priority:
                      (questionData.imageOptions?.length || 0) +
                      (questionData.hasOther ? 2 : 1),
                    score: 0,
                    type: "text",
                    label: "هیچکدام",
                    option_kind: "usual",
                  },
                ]
              : []),
            // Add "all" option if enabled
            ...(questionData.hasAll
              ? [
                  {
                    text: "همه موارد",
                    value: "",
                    priority:
                      (questionData.imageOptions?.length || 0) +
                      (questionData.hasOther ? 2 : 1) +
                      (questionData.hasNone ? 1 : 0),
                    score: 0,
                    type: "text",
                    label: "همه موارد",
                    option_kind: "usual",
                  },
                ]
              : []),
          ];
          apiData.is_multiple_select = questionData.isMultiImage || false;
        }

        console.log("Final API data being sent:", apiData);

        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/single-question-create/${id}/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(apiData),
          }
        );

        const data = await response.json();
        console.log("API Response:", data);

        // Check if the response is successful (status 200 or 201)
        if (response.ok || response.status === 201) {
          // Removed duplicate fetchQuestions to avoid double reload
          toast.success("سوال با موفقیت ایجاد شد");
          setShowSettings(false);
          setSelectedQuestion(null);
          setIsCreatingNewQuestion(false);
          setShowConditionalLogic(false);
          setExpandedGroups([]);
          return data.data || { message: "Created" };
        } else {
          throw new Error(data.info?.message || "خطا در ایجاد سوال");
        }
      } catch (error) {
        console.error("Error creating question:", error);
        toast.error(
          error instanceof Error ? error.message : "خطا در ایجاد سوال"
        );
        throw error;
      }
    },
    [id, accessToken, questions.length]
  );

  const updateQuestion = useCallback(
    async (id: string, updates: Partial<Question>) => {
      try {
        if (!accessToken || !questionnaire?.id) {
          throw new Error("Missing access token or questionnaire ID");
        }

        // If we're only updating parentId (moving to/from group)
        if (Object.keys(updates).length === 1 && "parentId" in updates) {
          const apiData = {
            id,
            related_group: updates.parentId || null,
          };

          console.log("Updating question group:", apiData);

          const response = await fetch(
            `${BASE_URL}/api/v1/questionnaire/${id}/questions/update/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(apiData),
            }
          );

          if (response.ok) {
            // Update local state
            setQuestions((prevQuestions) =>
              prevQuestions.map((q) =>
                String(q.id) === String(id)
                  ? { ...q, related_group: updates.parentId || null }
                  : q
              )
            );
            // Removed duplicate fetchQuestions to avoid double reload
            toast.success("سوال با موفقیت بروزرسانی شد");
            setShowSettings(false);
            setSelectedQuestion(null);
            setIsCreatingNewQuestion(false);
            setShowConditionalLogic(false);
            setExpandedGroups([]);
            return { message: "Updated" };
          } else {
            throw new Error("Failed to update question");
          }
        }

        // Original updateQuestion logic for other cases
        const apiData: any = {
          id: id,
          is_required: updates.required || false,
          title: updates.label || "",
          attachment_type:
            (updates as any).attachment_type ??
            (updates.hasMedia ? updates.mediaType : null),
          related_group: updates.parentId || null,
          attachment:
            (updates as any).attachment ?? (updates as any).mediaUrl ?? null,
          caption: updates.description,
        };

        console.log("🔍 updateQuestion - updates object:", updates);
        console.log(
          "🔍 updateQuestion - attachment value:",
          (updates as any).attachment
        );
        console.log(
          "🔍 updateQuestion - mediaUrl value:",
          (updates as any).mediaUrl
        );
        console.log("🔍 updateQuestion - hasMedia value:", updates.hasMedia);
        console.log("🔍 updateQuestion - final apiData:", apiData);

        // Get the existing question to determine its type
        const existingQuestion = questions.find(
          (q) => String(q.id) === String(id)
        );
        if (!existingQuestion) {
          console.error("Question not found:", {
            id,
            questions: questions.map((q) => ({ id: q.id, title: q.title })),
          });
          throw new Error("Question not found");
        }

        // Find existing "other" option if it exists
        const existingOtherOption = existingQuestion.options?.find(
          (opt) => opt.option_kind === "etc"
        );

        // Determine the new type based on isMultiSelect and isMultiImage
        let newType = existingQuestion.type;
        if (
          existingQuestion.type === "single_select" ||
          existingQuestion.type === "multi_select"
        ) {
          newType = updates.isMultiSelect ? "multi_select" : "single_select";
        } else if (
          existingQuestion.type === "select_single_image" ||
          existingQuestion.type === "select_multi_image"
        ) {
          newType = updates.isMultiImage
            ? "select_multi_image"
            : "select_single_image";
        }

        // Handle different question types based on existing question type
        switch (existingQuestion.type) {
          case "multi_select":
          case "single_select":
          case "combobox":
            // Find existing options
            const existingNoneOption = existingQuestion.options?.find(
              (opt) => opt.value === "هیچکدام"
            );
            const existingAllOption = existingQuestion.options?.find(
              (opt) => opt.value === "همه موارد"
            );

            const regularOptions =
              updates.options?.map((text, index) => {
                const existingOption = existingQuestion.options?.[index];
                return {
                  text,
                  value: text,
                  priority: index + 1,
                  score: 0,
                  type: "text",
                  option_kind: "usual",
                  ...(existingOption?.id ? { id: existingOption.id } : {}),
                };
              }) || [];

            const otherOption = updates.hasOther
              ? {
                  text: updates.otherOptionText || "سایر",
                  value: updates.otherOptionText || "سایر",
                  priority: regularOptions.length + 1,
                  score: 0,
                  type: "text",
                  option_kind: "etc",
                  ...(existingOtherOption?.id
                    ? { id: existingOtherOption.id }
                    : {}),
                }
              : null;

            const noneOption = updates.hasNone
              ? {
                  text: "هیچکدام",
                  value: "هیچکدام",
                  priority: regularOptions.length + (otherOption ? 2 : 1),
                  score: 0,
                  type: "text",
                  option_kind: "usual",
                  ...(existingNoneOption?.id
                    ? { id: existingNoneOption.id }
                    : {}),
                }
              : null;

            const allOption = updates.hasAll
              ? {
                  text: "همه موارد",
                  value: "همه موارد",
                  priority:
                    regularOptions.length +
                    (otherOption ? 2 : 1) +
                    (noneOption ? 1 : 0),
                  score: 0,
                  type: "text",
                  option_kind: "usual",
                  ...(existingAllOption?.id
                    ? { id: existingAllOption.id }
                    : {}),
                }
              : null;

            apiData.options = [
              ...regularOptions,
              ...(otherOption ? [otherOption] : []),
              ...(noneOption ? [noneOption] : []),
              ...(allOption ? [allOption] : []),
            ];
            apiData.type = newType;

            // Add multiselectquestion for multi-select questions
            if (newType === "multi_select") {
              apiData.multiselectquestion = {
                min_selection_count:
                  updates.minSelectableChoices?.toString() || "1",
                max_selection_count:
                  updates.maxSelectableChoices?.toString() || null,
              };
            }
            break;

          case "select_multi_image":
          case "select_single_image":
            apiData.options = [
              // Regular image options
              ...(updates.imageOptions?.map((opt, index) => {
                // Find existing option by index to preserve ID even if value changed
                const existingOption = existingQuestion.options?.[index];
                const optionData: any = {
                  text: opt.text,
                  value: opt.imageUrl,
                  priority: index + 1,
                  score: 0,
                  type: "image",
                  label: opt.text,
                  option_kind: "usual",
                };

                // Preserve existing option ID if it exists
                if (existingOption?.id) {
                  optionData.id = existingOption.id;
                }

                return optionData;
              }) || []),
              // Add "other" option if enabled
              ...(updates.hasOther
                ? [
                    {
                      text: updates.otherOptionText || "سایر",
                      value: "",
                      priority: (updates.imageOptions?.length || 0) + 1,
                      score: 0,
                      type: "text",
                      label: updates.otherOptionText || "سایر",
                      option_kind: "etc",
                      ...(existingOtherOption?.id
                        ? { id: existingOtherOption.id }
                        : {}),
                    },
                  ]
                : []),
              // Add "none" option if enabled
              ...(updates.hasNone
                ? [
                    {
                      text: "هیچکدام",
                      value: "",
                      priority:
                        (updates.imageOptions?.length || 0) +
                        (updates.hasOther ? 2 : 1),
                      score: 0,
                      type: "text",
                      label: "هیچکدام",
                      option_kind: "usual",
                    },
                  ]
                : []),
              // Add "all" option if enabled
              ...(updates.hasAll
                ? [
                    {
                      text: "همه موارد",
                      value: "",
                      priority:
                        (updates.imageOptions?.length || 0) +
                        (updates.hasOther ? 2 : 1) +
                        (updates.hasNone ? 1 : 0),
                      score: 0,
                      type: "text",
                      label: "همه موارد",
                      option_kind: "usual",
                    },
                  ]
                : []),
            ];
            apiData.type = newType;
            apiData.is_multiple_select = updates.isMultiImage || false;

            // Add multiselectquestion for image multi-select questions
            if (newType === "select_multi_image") {
              apiData.multiselectquestion = {
                min_selection_count:
                  updates.minSelectableChoices?.toString() || "1",
                max_selection_count:
                  updates.maxSelectableChoices?.toString() || null,
              };
            }
            break;

          case "text_question":
            apiData.style =
              updates.textType === "long"
                ? "long"
                : updates.textType === "email"
                ? "email"
                : "short";
            if (updates.textType === "short" || updates.textType === "long") {
              apiData.limit = updates.maxLength || 200;
            }
            break;

          case "number_descriptive":
            apiData.min_value = updates.minNumber || 0;
            apiData.max_value = updates.maxNumber || 5000;
            break;

          case "statement":
            // Statement questions can have media attachments
            // attachment and attachment_type are already set in the main apiData above
            break;

          case "range_slider":
            // Generate options for range slider
            const range = updates.scaleMax || 5;
            apiData.options = Array.from({ length: range }, (_, i) => ({
              value: String(i + 1),
              priority: 1,
              type: "integer",
              option_kind: "usual",
            }));
            apiData.left_label = updates.scaleLabels?.left || "کم";
            apiData.middle_label = updates.scaleLabels?.center || "متوسط";
            apiData.right_label = updates.scaleLabels?.right || "زیاد";
            break;

          case "matrix":
            apiData.rows =
              updates.rows?.map((row, index) => {
                // Find existing row by index to preserve ID even if value changed
                const existingRow = existingQuestion.rows?.[index];
                return {
                  id: existingRow?.id,
                  value: row,
                  order: index + 1,
                };
              }) || [];
            apiData.columns =
              updates.columns?.map((col, index) => {
                // Find existing column by index to preserve ID even if value changed
                const existingCol = existingQuestion.columns?.[index];
                return {
                  id: existingCol?.id,
                  value: col,
                  order: index + 1,
                };
              }) || [];
            apiData.shuffle_rows = updates.shuffleRows || false;
            apiData.shuffle_columns = updates.shuffleColumns || false;
            break;

          case "prioritize":
            // Map options with proper types and preserve existing IDs
            apiData.options =
              updates.options?.map((text, index) => {
                // Find existing option by index to preserve ID even if value changed
                const existingOption = existingQuestion.options?.[index];
                const optionData: any = {
                  text,
                  value: text,
                  priority: index + 1,
                  score: 0,
                  type: "text",
                  option_kind: "usual",
                };

                // Preserve existing option ID if it exists
                if (existingOption?.id) {
                  optionData.id = existingOption.id;
                }

                return optionData;
              }) || [];
            break;

          case "grading":
            apiData.count = updates.ratingMax?.toString() || "5";
            apiData.shape =
              updates.ratingStyle === "thumbs"
                ? "like"
                : updates.ratingStyle || "star";
            // Generate options based on count
            const count = parseInt(apiData.count);
            apiData.options = Array.from({ length: count }, (_, i) => ({
              priority: 1,
              score: 0,
              type: "integer",
              value: i + 1,
            }));
            break;
        }

        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${id}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(apiData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.info?.message || "خطا در بروزرسانی سوال");
        }

        const data = await response.json();
        if (data.info.status === 200) {
          // Removed duplicate fetchQuestions to avoid double reload
          toast.success("سوال با موفقیت بروزرسانی شد");
          setShowSettings(false);
          setSelectedQuestion(null);
          setIsCreatingNewQuestion(false);
          setShowConditionalLogic(false);
          setExpandedGroups([]);
          return data.data;
        } else {
          throw new Error(data.info.message);
        }
      } catch (error) {
        console.error("Error updating question:", error);
        toast.error(
          error instanceof Error ? error.message : "خطا در بروزرسانی سوال"
        );
        throw error;
      }
    },
    [accessToken, questionnaire?.id, questions, setQuestions]
  );

  // Helper function to map question types to API types
  const mapQuestionType = (type: string): string => {
    console.log("Mapping question type:", type);

    // Handle text questions first
    if (type === "text_question_short" || type === "متنی کوتاه") {
      console.log("Detected short text, returning text_question");
      return "text_question";
    }
    if (type === "text_question_long" || type === "متنی بلند") {
      console.log("Detected long text, returning text_question");
      return "text_question";
    }
    if (type === "text_question_email" || type === "ایمیل") {
      console.log("Detected email, returning text_question");
      return "text_question";
    }

    // Handle direct API types from sidebar
    if (type === "single_select") {
      return "single_select";
    }
    if (type === "multi_select") {
      return "multi_select";
    }
    if (type === "range_slider") {
      return "range_slider";
    }
    if (type === "question_group") {
      return "question_group";
    }
    if (type === "statement") {
      return "statement";
    }
    if (type === "number_descriptive") {
      return "number_descriptive";
    }
    if (type === "matrix") {
      return "matrix";
    }
    if (type === "prioritize") {
      return "prioritize";
    }
    if (type === "select_multi_image") {
      return "select_multi_image";
    }
    if (type === "combobox") {
      return "combobox";
    }
    if (type === "grading") {
      return "grading";
    }

    // Handle Persian labels (for backward compatibility)
    switch (type) {
      case "چندگزینه‌ای":
      case "چندگزینه‌ای (چند جواب)":
      case "چندگزینه‌ای (تک جواب)":
        return "single_select";

      case "ماتریسی":
        return "matrix";

      case "اولویت دهی":
      case "اولویت‌دهی":
        return "prioritize";

      case "لیست کشویی":
        return "combobox";

      case "درجه بندی":
        return "grading";

      case "گروه سوال":
        return "question_group";

      case "متن بدون پاسخ":
        return "statement";

      case "چند‌گزینه‌ای تصویری":
      case "انتخاب تصویر (تک جواب)":
      case "انتخاب تصویر (چند جواب)":
        return "select_single_image";

      case "طیفی":
        return "range_slider";

      default:
        console.log("Unknown question type:", type);
        return type; // Return the original type if not found
    }
  };

  // Helper function to get question style
  const getQuestionStyle = (type: string): string | undefined => {
    // Handle text questions first
    if (type === "text_question_short" || type === "متنی کوتاه") {
      return "short";
    }
    if (type === "text_question_long" || type === "متنی بلند") {
      return "long";
    }
    if (type === "text_question_email" || type === "ایمیل") {
      return "email";
    }
    return undefined;
  };

  const addQuestion = useCallback(
    (questionType: string, insertIndex?: number, parentId?: string) => {
      console.log(
        "Adding question:",
        questionType,
        "at index:",
        insertIndex,
        "parent:",
        parentId
      );

      // Map the question type to the correct format
      const mappedType = mapQuestionType(questionType);
      console.log("Mapped question type:", mappedType);

      // Set default type for image choice questions
      const finalType =
        questionType === "چند‌گزینه‌ای تصویری"
          ? "select_single_image"
          : mappedType;

      const newQuestion: Question = {
        id: uuidv4(),
        type: finalType, // Keep the original type for display
        label: "",
        title: "",
        isRequired: false,
        order:
          insertIndex !== undefined ? insertIndex + 1 : questions.length + 1,
        parentId: parentId,
        textType:
          questionType === "text_question_long" || questionType === "متنی بلند"
            ? "long"
            : questionType === "text_question_email" || questionType === "ایمیل"
            ? "email"
            : questionType === "text_question_short" ||
              questionType === "متنی کوتاه"
            ? "short"
            : undefined,
      };

      // Add default rows and columns for matrix questions
      if (mappedType === "matrix") {
        newQuestion.rows = ["سطر 1", "سطر 2", "سطر 3"];
        newQuestion.columns = ["ستون 1", "ستون 2", "ستون 3"];
        newQuestion.shuffleRows = false;
        newQuestion.shuffleColumns = false;
      }

      // Add default options for prioritize questions
      if (mappedType === "prioritize") {
        newQuestion.options = ["گزینه 1", "گزینه 2", "گزینه 3", "گزینه 4"];
        newQuestion.optionValues = ["گزینه 1", "گزینه 2", "گزینه 3", "گزینه 4"];
        newQuestion.rawOptions = [
          {
            text: "گزینه 1",
            value: "گزینه 1",
            priority: 1,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 2",
            value: "گزینه 2",
            priority: 2,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 3",
            value: "گزینه 3",
            priority: 3,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 4",
            value: "گزینه 4",
            priority: 4,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
        ];
        newQuestion.hasOther = false;
        newQuestion.hasNone = false;
        newQuestion.hasAll = false;
        newQuestion.otherOptionText = "سایر";
      }

      // Add default options for multi-choice questions
      if (mappedType === "single_select" || mappedType === "multi_select") {
        newQuestion.options = ["گزینه 1", "گزینه 2", "گزینه 3", "گزینه 4"];
        newQuestion.optionValues = ["گزینه 1", "گزینه 2", "گزینه 3", "گزینه 4"];
        newQuestion.rawOptions = [
          {
            text: "گزینه 1",
            value: "گزینه 1",
            priority: 1,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 2",
            value: "گزینه 2",
            priority: 2,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 3",
            value: "گزینه 3",
            priority: 3,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 4",
            value: "گزینه 4",
            priority: 4,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
        ];
        newQuestion.hasOther = false;
        newQuestion.hasNone = false;
        newQuestion.hasAll = false;
        newQuestion.otherOptionText = "سایر";
      }

      // Add default options for combobox questions
      if (mappedType === "combobox") {
        newQuestion.options = ["گزینه 1", "گزینه 2", "گزینه 3", "گزینه 4"];
        newQuestion.optionValues = ["گزینه 1", "گزینه 2", "گزینه 3", "گزینه 4"];
        newQuestion.rawOptions = [
          {
            text: "گزینه 1",
            value: "گزینه 1",
            priority: 1,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 2",
            value: "گزینه 2",
            priority: 2,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 3",
            value: "گزینه 3",
            priority: 3,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
          {
            text: "گزینه 4",
            value: "گزینه 4",
            priority: 4,
            score: 0,
            type: "text",
            option_kind: "usual",
          },
        ];
        newQuestion.hasOther = false;
        newQuestion.hasNone = false;
        newQuestion.hasAll = false;
        newQuestion.otherOptionText = "سایر";
      }

      // Add default options for image choice questions
      if (
        mappedType === "select_single_image" ||
        mappedType === "select_multi_image"
      ) {
        newQuestion.imageOptions = [
          { text: "تصویر 1", imageUrl: "" },
          { text: "تصویر 2", imageUrl: "" },
          { text: "تصویر 3", imageUrl: "" },
        ];
        newQuestion.isMultiImage = mappedType === "select_multi_image";
        newQuestion.hasOther = false;
        newQuestion.hasNone = false;
        newQuestion.hasAll = false;
      }

      // Add default options for grading questions
      if (mappedType === "grading") {
        newQuestion.ratingMax = 5;
        newQuestion.ratingStyle = "thumbs";
        newQuestion.rawOptions = Array.from({ length: 5 }, (_, i) => ({
          priority: 1,
          score: 0,
          type: "integer",
          value: String(i + 1),
          option_kind: "usual",
        }));
      }

      // Convert to ApiQuestion format and add to state first
      const apiQuestion: ApiQuestion = {
        id: newQuestion.id,
        type: mappedType, // Use the mapped type for API format
        text: newQuestion.title || "سوال جدید",
        title: newQuestion.title || "سوال جدید",
        is_required: newQuestion.isRequired,
        order: newQuestion.order,
        style: getQuestionStyle(questionType),
        related_group: parentId,
      };

      // Add default options for different question types in ApiQuestion format
      if (mappedType === "single_select" || mappedType === "multi_select") {
        apiQuestion.options = [
          {
            priority: 1,
            score: 0,
            value: "گزینه 1",
            type: "text",
            option_kind: "usual",
            text: "گزینه 1",
          },
          {
            priority: 2,
            score: 0,
            value: "گزینه 2",
            type: "text",
            option_kind: "usual",
            text: "گزینه 2",
          },
          {
            priority: 3,
            score: 0,
            value: "گزینه 3",
            type: "text",
            option_kind: "usual",
            text: "گزینه 3",
          },
          {
            priority: 4,
            score: 0,
            value: "گزینه 4",
            type: "text",
            option_kind: "usual",
            text: "گزینه 4",
          },
        ];
        apiQuestion.is_other = false;
        apiQuestion.is_none = false;
        apiQuestion.is_all = false;
        apiQuestion.is_multiple_select = mappedType === "multi_select";
      }

      if (mappedType === "prioritize") {
        apiQuestion.options = [
          {
            priority: 1,
            score: 0,
            value: "گزینه 1",
            type: "text",
            option_kind: "usual",
            text: "گزینه 1",
          },
          {
            priority: 2,
            score: 0,
            value: "گزینه 2",
            type: "text",
            option_kind: "usual",
            text: "گزینه 2",
          },
          {
            priority: 3,
            score: 0,
            value: "گزینه 3",
            type: "text",
            option_kind: "usual",
            text: "گزینه 3",
          },
          {
            priority: 4,
            score: 0,
            value: "گزینه 4",
            type: "text",
            option_kind: "usual",
            text: "گزینه 4",
          },
        ];
      }

      if (mappedType === "matrix") {
        apiQuestion.rows = [
          { value: "سطر 1", order: 1 },
          { value: "سطر 2", order: 2 },
          { value: "سطر 3", order: 3 },
        ];
        apiQuestion.columns = [
          { value: "ستون 1", order: 1 },
          { value: "ستون 2", order: 2 },
          { value: "ستون 3", order: 3 },
        ];
        apiQuestion.shuffle_rows = false;
        apiQuestion.shuffle_columns = false;
      }

      if (
        mappedType === "select_single_image" ||
        mappedType === "select_multi_image"
      ) {
        apiQuestion.options = [
          {
            priority: 1,
            score: 0,
            value: "تصویر 1",
            type: "text",
            option_kind: "usual",
            text: "تصویر 1",
            image_url: "",
          },
          {
            priority: 2,
            score: 0,
            value: "تصویر 2",
            type: "text",
            option_kind: "usual",
            text: "تصویر 2",
            image_url: "",
          },
          {
            priority: 3,
            score: 0,
            value: "تصویر 3",
            type: "text",
            option_kind: "usual",
            text: "تصویر 3",
            image_url: "",
          },
        ];
        apiQuestion.is_multiple_select = mappedType === "select_multi_image";
      }

      if (mappedType === "combobox") {
        apiQuestion.options = [
          {
            priority: 1,
            score: 0,
            value: "گزینه 1",
            type: "text",
            option_kind: "usual",
            text: "گزینه 1",
          },
          {
            priority: 2,
            score: 0,
            value: "گزینه 2",
            type: "text",
            option_kind: "usual",
            text: "گزینه 2",
          },
          {
            priority: 3,
            score: 0,
            value: "گزینه 3",
            type: "text",
            option_kind: "usual",
            text: "گزینه 3",
          },
          {
            priority: 4,
            score: 0,
            value: "گزینه 4",
            type: "text",
            option_kind: "usual",
            text: "گزینه 4",
          },
        ];
      }

      if (mappedType === "grading") {
        apiQuestion.options = Array.from({ length: 5 }, (_, i) => ({
          priority: 1,
          score: 0,
          type: "integer",
          value: String(i + 1),
          option_kind: "usual",
        }));
        apiQuestion.scale_max = 5;
        apiQuestion.shape = "thumbs";
      }

      const updatedQuestions = (() => {
        if (insertIndex !== undefined) {
          // Insert at specific index
          const newQuestions = [...questions];
          newQuestions.splice(insertIndex, 0, apiQuestion);

          // Update orders for all questions after the inserted one
          for (let i = insertIndex + 1; i < newQuestions.length; i++) {
            newQuestions[i] = { ...newQuestions[i], order: i + 1 };
          }

          return newQuestions;
        } else {
          // Add at the end
          return [...questions, apiQuestion];
        }
      })();

      // Update state immediately (optimistic update)
      setQuestions(updatedQuestions);

      // Don't call reorder API immediately - wait for question to be saved
      // The reorder will happen after the question is successfully created

      // Set as new question and open modal
      setSelectedQuestion(newQuestion);
      setIsCreatingNewQuestion(true);
      setShowSettings(true);
      setShowConditionalLogic(false);
      setExpandedGroups([]);
    },
    [questions, questionnaire?.id, accessToken, fetchQuestions]
  );

  const handleQuestionSave = useCallback(
    async (questionData: Question) => {
      // Ensure attachment populated if missing
      if (!questionData.attachment && questionData.mediaUrl) {
        questionData = { ...questionData, attachment: questionData.mediaUrl };
      }
      try {
        let result;

        // Decide based on isCreatingNewQuestion flag instead of id existence
        if (isCreatingNewQuestion) {
          // --- ایجاد سوال جدید ---
          const apiData = {
            ...questionData,
            type: mapQuestionType(selectedQuestion?.type || questionData.type),
          };
          result = await createQuestion(apiData);

          if (result) {
            // Update local state with server response
              const serverResponse = result;
              const updatedQuestions = questions.map((q) =>
              q.id === questionData.id ? { ...q, ...serverResponse } : q
              );
              setQuestions(updatedQuestions);
                    await fetchQuestions();
              toast.success("سوال با موفقیت ایجاد شد");
            setShowSettings(false);
            setSelectedQuestion(null);
            setIsCreatingNewQuestion(false);
            setShowConditionalLogic(false);
            setExpandedGroups([]);
            }
          } else {
          // --- ویرایش سوال موجود ---
          const { type, ...updateData } = questionData; // type not needed for update
            result = await updateQuestion(questionData.id, updateData);

            if (result) {
              setQuestions((prev) =>
                prev.map((q) =>
                  q.id === questionData.id ? { ...q, ...result } : q
                )
              );
            await fetchQuestions();
              toast.success("سوال با موفقیت بروزرسانی شد");
          setShowSettings(false);
          setSelectedQuestion(null);
          setIsCreatingNewQuestion(false);
          setShowConditionalLogic(false);
          setExpandedGroups([]);
          }
        }
      } catch (error) {
        console.error("Error saving question:", error);
        toast.error(
          error instanceof Error ? error.message : "خطا در ذخیره سوال"
        );
      }
    },
    [
      showSettings,
      selectedQuestion,
      createQuestion,
      updateQuestion,
      questions,
      questionnaire?.id,
      accessToken,
      fetchQuestions,
      isCreatingNewQuestion,
    ]
  );

  const handleQuestionCancel = useCallback(() => {
    // If this was a new question from drag-drop, remove it from state
    if (selectedQuestion && isCreatingNewQuestion) {
      console.log("🗑️ Removing new question on cancel:", selectedQuestion.id);
      const questionIdToRemove = selectedQuestion.id.toString();
      setQuestions((prev) => {
        const filteredQuestions = prev.filter(
          (q) => q.id.toString() !== questionIdToRemove
        );
        console.log("🗑️ Before filtering:", prev.length, "questions");
        console.log(
          "🗑️ After filtering:",
          filteredQuestions.length,
          "questions"
        );
        console.log("🗑️ Removed question ID:", questionIdToRemove);
        return filteredQuestions;
      });
      toast.success("سوال لغو شد و از لیست حذف شد");
    } else {
      console.log(
        "💾 Keeping existing question on cancel:",
        selectedQuestion?.id
      );
    }

    // Don't add question if cancelled
    setShowSettings(false);
    setSelectedQuestion(null);
    setIsCreatingNewQuestion(false);
    setShowConditionalLogic(false);
    setExpandedGroups([]);
  }, [selectedQuestion, isCreatingNewQuestion]);

  const duplicateQuestion = useCallback(
    (question: ApiQuestion) => {
      const duplicatedQuestion: ApiQuestion = {
        ...question,
        id: uuidv4(),
        text: question.text,
        title: question.title,
        is_required: question.is_required,
        order: question.order,
        style: question.style,
        attachment_type: question.attachment_type,
        related_group: question.related_group,
      };

      const questionIndex = questions.findIndex((q) => q.id === question.id);
      setQuestions((prev) => {
        const newQuestions = [...prev];
        newQuestions.splice(questionIndex + 1, 0, duplicatedQuestion);
        return newQuestions;
      });
    },
    [questions]
  );

  const removeQuestion = useCallback(
    async (id: string) => {
      try {
        if (!accessToken || !questionnaire?.id) {
          throw new Error("Missing access token or questionnaire ID");
        }

        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${questionnaire.id}/questions/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.info?.message || "خطا در حذف سوال");
        }

        // Remove from local state
        setQuestions((prev) => {
          // Also remove child questions if removing a group
          const questionToRemove = prev.find((q) => q.id === id);
          if (questionToRemove?.related_group) {
            return prev.filter((q) => q.id !== id && q.related_group !== id);
          }
          return prev.filter((q) => q.id !== id);
        });

        // Remove from expanded groups if it was a group
        setExpandedGroups((prev) => prev.filter((groupId) => groupId !== id));

        // Reorder remaining questions
        const reorderResponse = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${questionnaire.id}/questions/reorder/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(
              questions
                .filter(
                  (q) =>
                    q.id !== id && (!q.related_group || q.related_group !== id)
                )
                .map((q, index) => ({
                  id: parseInt(q.id),
                  order: index + 1,
                }))
            ),
          }
        );

        if (!reorderResponse.ok) {
          const errorData = await reorderResponse.json();
          throw new Error(errorData.info?.message || "خطا در مرتب‌سازی سوالات");
        }

        // Fetch updated questions list
        await fetchQuestions();

        toast.success("سوال با موفقیت حذف شد");
      } catch (error) {
        console.error("Error removing question:", error);
        toast.error(error instanceof Error ? error.message : "خطا در حذف سوال");
      }
    },
    [accessToken, questionnaire?.id, questions, fetchQuestions]
  );

  const updateQuestionInList = useCallback(
    (id: string, updates: Partial<ApiQuestion>) => {
      // Special case for reordering all questions
      if (id === "reorder" && (updates as any).questions) {
        console.log("📝 Updating questions order locally");
        setQuestions((updates as any).questions);
        return;
      }

      // Special case for reordering children within a group (removed - now handled by direct API call)

      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
      );
    },
    []
  );

  const moveQuestion = useCallback((activeId: string, overId: string) => {
    console.log("📍 Moving question from", activeId, "to", overId);
    // This is now handled by the FormBuilder handleSortUpdate
    // Just log for debugging
  }, []);

  const moveToGroup = useCallback(
    async (questionId: string, groupId: string) => {
      console.log(`🏃 Moving question ${questionId} to group ${groupId}`);

      // Optimistic update - update local state first
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, related_group: groupId || null } : q
        )
      );

      // Make API call to persist the change
      try {
        if (!accessToken || !questionnaire?.id) {
          throw new Error("Missing access token or questionnaire ID");
        }

        const apiData = {
          id: questionId,
          related_group: groupId || null, // اگر groupId خالی است، null قرار می‌دهیم
        };

        console.log("📡 Sending move to group API call:", apiData);

        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${questionId}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(apiData),
          }
        );

        if (response.ok) {
          console.log("✅ Move to group API call successful");
        } else {
          console.error("❌ Move to group API call failed");
          const errorText = await response.text();
          console.error("Error details:", errorText);

          // TODO: Rollback local state if needed
          // For now, we keep the optimistic update even if API fails
        }
      } catch (error) {
        console.error("❌ Error in move to group API call:", error);
      }
    },
    [accessToken, questionnaire?.id]
  );

  const toggleGroup = useCallback((groupId: string) => {
    console.log("🎮 toggleGroup called with groupId:", groupId);
    setExpandedGroups((prev) => {
      console.log("📋 Previous expanded groups:", prev);
      const isCurrentlyExpanded = prev.includes(groupId);
      console.log("🔍 Is currently expanded:", isCurrentlyExpanded);

      const newExpanded = isCurrentlyExpanded
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];

      console.log("✨ New expanded groups:", newExpanded);
      return newExpanded;
    });
  }, []);

  const openQuestionSettings = (question: ApiQuestion) => {
    console.log("Opening question settings:", question);
    console.log("Original API type:", question.type);
    console.log("Original API style:", question.style);

    // Map API type to English type
    const mapApiTypeToEnglish = (type: string, style?: string): string => {
      console.log("Mapping API type:", type, "with style:", style);

      if (type === "text_question") {
        if (style === "email") {
          console.log("Detected email style, returning text_question_email");
          return "text_question_email";
        } else if (style === "long") {
          console.log("Detected long style, returning text_question_long");
          return "text_question_long";
        } else {
          console.log("Detected short style, returning text_question_short");
          return "text_question_short";
        }
      }

      switch (type) {
        case "multi_select":
        case "single_select":
          return "single_select";
        case "matrix":
          return "matrix";
        case "prioritize":
          return "prioritize";
        case "combobox":
          return "combobox";
        case "grading":
          return "grading";
        case "number_descriptive":
          return "number_descriptive";
        case "question_group":
          return "question_group";
        case "statement":
          return "statement";
        case "select_multi_image":
        case "select_single_image":
          return "select_single_image";
        case "range_slider":
          return "range_slider";
        default:
          console.log("Unknown type:", type);
          return type;
      }
    };

    const englishType = mapApiTypeToEnglish(question.type, question.style);
    console.log("Mapped to English type:", englishType);

    // Find the other option text from rawOptions
    const otherOption = question.options?.find(
      (opt) => opt.option_kind === "etc"
    );
    console.log("Found other option:", otherOption);
    const otherOptionText = otherOption?.text || otherOption?.value || "سایر";
    console.log("Other option text:", otherOptionText);

    // Check for none and all options
    const hasNone =
      question.options?.some((opt) => opt.value === "هیچکدام") || false;
    const hasAll =
      question.options?.some((opt) => opt.value === "همه موارد") || false;

    // Map rating style from API shape to our component's rating style
    const mapRatingStyle = (shape?: string): "star" | "heart" | "thumbs" => {
      if (shape === "like") return "thumbs";
      if (shape === "heart") return "heart";
      return "star";
    };

    const mappedQuestion: Question = {
      id: question.id,
      type: englishType,
      label: question.text,
      title: question.title,
      isRequired: question.is_required,
      required: question.is_required,
      order: question.order,
      textType:
        question.style === "email"
          ? "email"
          : question.style === "long"
          ? "long"
          : "short",
      hasMedia: Boolean(question.attachment),
      mediaType:
        (question.attachment_type as "image" | "video" | undefined) ||
        (question.attachment ? "image" : undefined),
      mediaUrl: question.attachment,
      parentId: question.related_group,
      maxLength: question.limit || 200,
      minChars: question.min_value,
      minNumber: question.min_value,
      maxNumber: question.max_value,
      options:
        question.options
          ?.filter(
            (opt) =>
              opt.option_kind !== "etc" &&
              opt.value !== "هیچکدام" &&
              opt.value !== "همه موارد"
          )
          ?.map((opt) => opt.value) || [],
      optionValues:
        question.options
          ?.filter(
            (opt) =>
              opt.option_kind !== "etc" &&
              opt.value !== "هیچکدام" &&
              opt.value !== "همه موارد"
          )
          ?.map((opt) => opt.value) || [],
      rawOptions: question.options || [],
      hasOther:
        question.options?.some((opt) => opt.option_kind === "etc") || false,
      otherOptionText: otherOptionText,
      hasNone: hasNone,
      hasAll: hasAll,
      randomizeOptions: question.randomize_options,
      isMultiSelect: question.type === "multi_select",
      minSelectableChoices: question.multiselectquestion?.min_selection_count
        ? parseInt(question.multiselectquestion.min_selection_count)
        : question.type === "select_multi_image"
        ? 2
        : undefined,
      maxSelectableChoices: question.multiselectquestion?.max_selection_count
        ? parseInt(question.multiselectquestion.max_selection_count)
        : question.type === "select_multi_image"
        ? 4
        : undefined,
      rows: question.rows?.map((row) => row.value) || [],
      columns: question.columns?.map((col) => col.value) || [],
      shuffleRows: question.shuffle_rows,
      shuffleColumns: question.shuffle_columns,
      ratingMax: question.count,
      ratingStyle: mapRatingStyle(question.shape),
      scaleMin: question.scale_min,
      scaleMax: question.scale_max || question.options?.length || 5,
      scaleLabels: {
        left: question.scale_labels?.left || question.left_label || "",
        center: question.scale_labels?.center || question.middle_label || "",
        right: question.scale_labels?.right || question.right_label || "",
      },
      description: (question as any).caption ?? (question as any).description,
      hasDescription: Boolean(
        (question as any).caption ?? (question as any).description
      ),
      imageOptions:
        question.type === "select_multi_image" ||
        question.type === "select_single_image"
          ? question.options?.map((opt) => ({
              text: opt.label,
              imageUrl: opt.value,
            }))
          : [],
      isMultiImage: question.type === "select_multi_image",
      attachment: question.attachment,
      attachment_type: question.attachment_type,
    };

    console.log("Final mapped question:", mappedQuestion);
    setSelectedQuestion(mappedQuestion);

    // Only reset 'isCreatingNewQuestion' when this is an existing (server-side) question.
    // Server IDs are numeric, whereas freshly-added client questions use UUIDs that contain a dash.
    const idStr = question.id.toString();
    const isServerQuestion = /^\d+$/.test(idStr);
    if (isServerQuestion) {
      setIsCreatingNewQuestion(false);
    }

    // Finally, open the settings modal
    setShowSettings(true);
  };

  // Helper function to map API question types to our format
  const mapApiQuestionType = (type: string, style?: string): string => {
    console.log("Mapping API question type:", type, "with style:", style);

    if (type === "text_question") {
      if (style === "email") {
        console.log("Detected email style, returning ایمیل");
        return "ایمیل";
      } else if (style === "long") {
        console.log("Detected long style, returning متنی بلند");
        return "متنی بلند";
      } else {
        console.log("Detected short style, returning متنی کوتاه");
        return "متنی کوتاه";
      }
    }

    switch (type) {
      case "multi_select":
      case "single_select":
        return "چندگزینه‌ای";
      case "matrix":
        return "ماتریسی";
      case "prioritize":
        return "اولویت‌دهی";
      case "combobox":
        return "لیست کشویی";
      case "grading":
        return "درجه بندی";
      case "number_descriptive":
        return "عددی";
      case "question_group":
        return "گروه سوال";
      case "statement":
        return "متن بدون پاسخ";
      case "select_multi_image":
        return "انتخاب تصویر (چند جواب)";
      case "select_single_image":
        return "انتخاب تصویر (تک جواب)";
      case "range_slider":
        return "طیفی";
      default:
        console.log("Unknown type:", type);
        return "متنی کوتاه";
    }
  };

  const openConditionModal = useCallback((question: Question | ApiQuestion) => {
    console.log("🔄 openConditionModal called with:", question);
    console.log("🔍 Question id:", question.id);
    console.log("🔍 Question mappings:", (question as any).mappings);

    // ConditionalLogicModal با ApiQuestion کار می‌کند، بنابراین فقط mappings را اضافه می‌کنیم
    if ("is_required" in question) {
      // این ApiQuestion است - مستقیماً استفاده کن
      console.log("🔄 Setting selectedApiQuestion...");
      setSelectedApiQuestion(question as ApiQuestion);
      console.log("✅ Using ApiQuestion directly for ConditionalLogicModal");
    } else {
      // این Question است - نیاز به تبدیل به ApiQuestion داریم (اما این نباید اتفاق بیفتد)
      console.warn(
        "⚠️ Got Question instead of ApiQuestion - this shouldn't happen with current setup"
      );
      // TODO: تبدیل Question به ApiQuestion اگر لازم باشد
    }

    console.log("🔄 Setting showConditionalLogic to true...");
    setShowConditionalLogic(true);
    console.log("✅ Modal should open now");
  }, []);

  const closeConditionModal = useCallback(() => {
    setShowConditionalLogic(false);
    setSelectedApiQuestion(null);
  }, []);

  // Update FormBuilder component to show question title
  const renderQuestionTitle = (question: ApiQuestion) => {
    // Map the question type for display
    const displayType = mapApiQuestionType(question.type, question.style);

    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-900 dark:text-white font-medium">
          {question.title}
        </span>
        {question.is_required && (
          <span className="text-red-500 text-sm">*</span>
        )}
        {/* Show question type */}
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {displayType}
        </span>
      </div>
    );
  };

  // Navigate to the next step (audience selection)
  const handleNextStep = () => {
    if (id && id !== "new") {
      navigate(`/questionnaire/${id}/audience`);
    } else {
      toast.warning("ابتدا پرسشنامه را ذخیره کنید");
    }
  };

  const closeAfterSave = async () => {
    await fetchQuestions();
    setShowSettings(false);
    setSelectedQuestion(null);
    setIsCreatingNewQuestion(false);
    setShowConditionalLogic(false);
    setExpandedGroups([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <FormHeader
      formTitle={questionnaire?.title || "پرسشنامه جدید"}
      setFormTitle={setFormTitle}
      steps={
        id && id !== "new"
          ? [
              { id: 1, title: "طراحی نظرسنجی", path: `/questionnaire/${id}` },
              {
                id: 2,
                title: "انتخاب مخاطب",
                path: `/questionnaire/${id}/audience`,
              },
              {
                id: 3,
                title: "گزارش نتایج",
                path: `/questionnaire/${id}/results`,
              },
            ]
          : undefined
      }
    >
      <div
        className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col overflow-x-hidden min-h-[calc(100vh-64px)]"
        dir="rtl"
      >
        <div className="flex flex-1">
          <QuestionSidebar onAddQuestion={addQuestion} />

          <div className="flex-1 mr-96 relative">
            <FormBuilder
              questions={questions}
              onRemoveQuestion={removeQuestion}
              onUpdateQuestion={updateQuestionInList}
              onMoveQuestion={moveQuestion}
              onQuestionClick={openQuestionSettings}
              onAddQuestion={addQuestion}
              onDuplicateQuestion={duplicateQuestion}
              onConditionClick={(question: ApiQuestion) => {
                console.log(
                  "🎯 onConditionClick called with ApiQuestion:",
                  question.id
                );
                openConditionModal(question);
              }}
              onMoveToGroup={moveToGroup}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              renderQuestionTitle={renderQuestionTitle}
              questionnaireId={questionnaire?.id}
              accessToken={accessToken}
              fetchQuestions={fetchQuestions}
            />
          </div>
        </div>

        <QuestionSettingsModal
          isOpen={showSettings}
          onClose={handleQuestionCancel}
          question={selectedQuestion}
          onSave={handleQuestionSave}
          onCancel={handleQuestionCancel}
          isNewQuestion={isCreatingNewQuestion}
        />

        <ConditionalLogicModal
          isOpen={showConditionalLogic}
          onClose={closeConditionModal}
          question={selectedApiQuestion}
          questions={questions}
          onUpdateQuestion={updateQuestionInList}
        />

        {/* Next Step Button */}
        <div className="fixed bottom-6 left-6 z-30">
          <Button size="lg" onClick={handleNextStep} className="px-6 py-3">
            مرحله بعد
          </Button>
        </div>
      </div>
    </FormHeader>
  );
};

export default Index;
