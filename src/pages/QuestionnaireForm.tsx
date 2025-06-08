import React, { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
import { DragDropContext, DropResult } from "react-beautiful-dnd";
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
import axios from "axios";

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
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [formTitle, setFormTitle] = useState("بدون عنوان");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [conditionQuestion, setConditionQuestion] = useState<Question | null>(
    null
  );
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [pendingQuestionData, setPendingQuestionData] = useState<{
    type: string;
    insertIndex?: number;
    parentId?: string;
  } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت سوالات");
      }

      const data = await response.json();
      console.log("Questions API Response:", data);

      if (data.info.status === 200) {
        console.log("Questions data:", data.data);
        setQuestions(data.data as ApiQuestion[]);
      } else {
        throw new Error(data.info.message);
      }
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

        // Determine the style based on textType for text questions
        let style;
        console.log("Checking style for type:", questionType);

        if (questionType === "text_question") {
          if (textType === "short") {
            style = "short";
            console.log("Matched short text style");
          } else if (textType === "long") {
            style = "long";
            console.log("Matched long text style");
          } else if (textType === "email") {
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
          attachment_type: questionData.hasMedia
            ? questionData.mediaType
            : null,
          related_group: questionData.parentId || null,
          attachment: questionData.attachment,
          description: questionData.description,
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
          toast.success("سوال با موفقیت ایجاد شد");
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
            // Fetch updated questions from server
            await fetchQuestions();
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
          attachment_type: updates.hasMedia ? updates.mediaType : null,
          related_group: updates.parentId || null,
          attachment: updates.attachment,
          description: updates.description,
        };

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
            // Only allow one media type at a time
            if (updates.hasMedia) {
              apiData.attachment_type = updates.mediaType;
            }
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
          toast.success("سوال با موفقیت بروزرسانی شد");
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
    [accessToken, questionnaire?.id, questions, setQuestions, fetchQuestions]
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

    // Handle other question types
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
        type: questionType, // Keep the original type for display
        label: "",
        title: "",
        isRequired: false,
        order: questions.length + 1,
        parentId: parentId,
        textType:
          questionType === "text_question_long" || questionType === "متنی بلند"
            ? "long"
            : questionType === "text_question_email" || questionType === "ایمیل"
            ? "email"
            : "short",
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
        newQuestion.ratingStyle = "like";
        newQuestion.rawOptions = Array.from({ length: 5 }, (_, i) => ({
          priority: 1,
          score: 0,
          type: "integer",
          value: String(i + 1),
          option_kind: "usual",
        }));
      }

      // Set as new question and open modal
      setSelectedQuestion(newQuestion);
      setIsNewQuestion(true);
      setPendingQuestionData({ type: finalType, insertIndex, parentId });
      setIsModalOpen(true);
    },
    [questions.length]
  );

  const handleQuestionSave = useCallback(
    async (questionData: Question) => {
      try {
        let result;
        if (isNewQuestion && pendingQuestionData) {
          // Create new question
          const apiData = {
            ...questionData,
            type: mapQuestionType(pendingQuestionData.type), // Map the type for API
          };
          result = await createQuestion(apiData);

          if (result) {
            // Close modal and reset states
            setIsModalOpen(false);
            setSelectedQuestion(null);
            setIsNewQuestion(false);
            setPendingQuestionData(null);

            // Refresh questions list
            await fetchQuestions();

            toast.success("سوال با موفقیت ایجاد شد");
          }
        } else {
          // Update existing question - don't send type field
          const { type, ...updateData } = questionData;
          result = await updateQuestion(questionData.id, updateData);

          if (result) {
            // Close modal and reset states
            setIsModalOpen(false);
            setSelectedQuestion(null);
            setIsNewQuestion(false);
            setPendingQuestionData(null);

            // Refresh questions list
            await fetchQuestions();

            toast.success("سوال با موفقیت بروزرسانی شد");
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
      isNewQuestion,
      pendingQuestionData,
      createQuestion,
      updateQuestion,
      fetchQuestions,
    ]
  );

  const handleQuestionCancel = useCallback(() => {
    // Don't add question if cancelled
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
  }, []);

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
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
      );
    },
    []
  );

  const moveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log("Moving question from", dragIndex, "to", hoverIndex);
    setQuestions((prev) => {
      // Get only main list questions (not in groups)
      const mainQuestions = prev.filter((q) => !q.related_group);
      const [removed] = mainQuestions.splice(dragIndex, 1);
      mainQuestions.splice(hoverIndex, 0, removed);

      // Update order for main questions
      const updatedMainQuestions = mainQuestions.map((q, index) => ({
        ...q,
        order: index,
      }));

      // Combine with group questions
      const groupQuestions = prev.filter((q) => q.related_group);
      return [...updatedMainQuestions, ...groupQuestions];
    });
  }, []);

  const moveToGroup = useCallback((questionId: string, groupId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, related_group: groupId } : q
      )
    );
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
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
      hasMedia: question.attachment_type === "image",
      mediaType: "image",
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
      description: question.description,
      hasDescription: !!question.description,
      imageOptions:
        question.type === "select_multi_image" ||
        question.type === "select_single_image"
          ? question.options?.map((opt) => ({
              text: opt.label,
              imageUrl: opt.value,
            }))
          : [],
      isMultiImage: question.type === "select_multi_image",
    };

    console.log("Final mapped question:", mappedQuestion);
    setSelectedQuestion(mappedQuestion);
    setIsModalOpen(true);
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

  const closeQuestionSettings = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
  }, []);

  const openConditionModal = useCallback((question: Question) => {
    setConditionQuestion(question);
    setIsConditionModalOpen(true);
  }, []);

  const closeConditionModal = useCallback(() => {
    setIsConditionModalOpen(false);
    setConditionQuestion(null);
  }, []);

  // Update FormBuilder component to show question title
  const renderQuestionTitle = (question: ApiQuestion) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-900 font-medium">{question.title}</span>
        {question.is_required && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;

    console.log("Drag End Result:", {
      source,
      destination,
      type,
      draggableId,
    });

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle adding new question from sidebar
    if (type === "QUESTION_TYPE" && source.droppableId === "questionTypes") {
      // Get the question type from draggableId
      const questionType = draggableId;

      // Add the question at the destination index
      addQuestion(questionType, destination.index);
      return;
    }

    // Handle moving questions between groups and main list
    if (type === "QUESTION_TYPE") {
      const questionId = draggableId;
      const sourceGroupId =
        source.droppableId === "formQuestions" ? null : source.droppableId;
      const destGroupId =
        destination.droppableId === "formQuestions"
          ? null
          : destination.droppableId;

      console.log("Moving question:", {
        questionId,
        sourceGroupId,
        destGroupId,
        sourceDroppableId: source.droppableId,
        destDroppableId: destination.droppableId,
      });

      // If moving to/from a group
      if (sourceGroupId !== destGroupId) {
        // Find the question to update
        const questionToUpdate = questions.find(
          (q) => String(q.id) === String(questionId)
        );
        console.log("Question to update:", {
          id: questionToUpdate?.id,
          title: questionToUpdate?.title,
          type: questionToUpdate?.type,
          related_group: questionToUpdate?.related_group,
        });

        if (questionToUpdate) {
          // Create a new question object with only related_group
          const updatedQuestion: Partial<Question> = {
            parentId: destGroupId || undefined,
          };

          console.log("Updated question object:", updatedQuestion);

          // Update the question in the API
          updateQuestion(questionId, updatedQuestion)
            .then(() => {
              console.log("API update successful");
              // After successful API update, update local state
              moveToGroup(questionId, destGroupId || undefined);
            })
            .catch((error) => {
              console.error("Error updating question group:", error);
              toast.error("خطا در انتقال سوال به گروه");
            });
        } else {
          console.error("Question not found:", questionId);
          toast.error("سوال مورد نظر یافت نشد");
        }
        return;
      }

      // If reordering within the same container
      if (source.droppableId === destination.droppableId) {
        if (sourceGroupId) {
          // Reordering within a group
          const group = questions.find((q) => q.id === sourceGroupId);
          if (group) {
            const children = questions.filter(
              (q) => q.related_group === sourceGroupId
            );
            const [removed] = children.splice(source.index, 1);
            children.splice(destination.index, 0, removed);

            // Create a new array with reordered questions
            const reorderedQuestions = questions.map((q) => {
              if (q.related_group === sourceGroupId) {
                const newIndex = children.findIndex(
                  (child) => child.id === q.id
                );
                return { ...q, order: newIndex };
              }
              return q;
            });

            // Update the questions state immediately
            setQuestions(reorderedQuestions);

            // Update order in API for group children
            if (questionnaire?.id) {
              const reorderData = children.map((q, index) => ({
                id: parseInt(q.id),
                order: index + 1,
              }));

              fetch(
                `${BASE_URL}/api/v1/questionnaire/${questionnaire.id}/questions/reorder/`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify(reorderData),
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("خطا در مرتب‌سازی سوالات");
                  }
                  return response.json();
                })
                .then(() => {
                  toast.success("ترتیب سوالات با موفقیت بروزرسانی شد");
                  // Fetch updated questions after reordering
                  fetchQuestions();
                })
                .catch((error) => {
                  console.error("Error reordering questions:", error);
                  toast.error(error.message || "خطا در مرتب‌سازی سوالات");
                  // Refresh questions to restore original order
                  fetchQuestions();
                });
            }
          }
        } else {
          console.log("هوووووسسسسسس");
          // Reordering in main list
          moveQuestion(source.index, destination.index);
          const mainQuestions = questions.filter((q) => !q.related_group);
          const [removed] = mainQuestions.splice(source.index, 1);
          mainQuestions.splice(destination.index, 0, removed);

          // Create a new array with reordered questions
          const reorderedQuestions = questions.map((q) => {
            if (!q.related_group) {
              const newIndex = mainQuestions.findIndex((mq) => mq.id === q.id);
              return { ...q, order: newIndex };
            }
            return q;
          });

          // Update order in API
          if (questionnaire?.id) {
            const reorderData = mainQuestions.map((q, index) => ({
              id: parseInt(q.id),
              order: index + 1,
            }));

            fetch(
              `${BASE_URL}/api/v1/questionnaire/${questionnaire.id}/questions/reorder/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(reorderData),
              }
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error("خطا در مرتب‌سازی سوالات");
                }
                return response.json();
              })
              .then(() => {
                toast.success("ترتیب سوالات با موفقیت بروزرسانی شد");
                // Fetch updated questions after reordering
                fetchQuestions();
              })
              .catch((error) => {
                console.error("Error reordering questions:", error);
                toast.error(error.message || "خطا در مرتب‌سازی سوالات");
                // Refresh questions to restore original order
                fetchQuestions();
              });
          }
        }
      }
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "text_question_short":
        return <Type className="w-4 h-4" />;
      case "text_question_long":
        return <AlignLeft className="w-4 h-4" />;
      case "text_question_email":
        return <Mail className="w-4 h-4" />;
      case "number_descriptive":
        return <Hash className="w-4 h-4" />;
      case "single_select":
      case "multi_select":
        return <List className="w-4 h-4" />;
      case "combobox":
        return <ChevronDown className="w-4 h-4" />;
      case "range_slider":
        return <SlidersHorizontal className="w-4 h-4" />;
      case "matrix":
        return <Table className="w-4 h-4" />;
      case "prioritize":
        return <ArrowUpDown className="w-4 h-4" />;
      case "select_single_image":
      case "select_multi_image":
        return <Image className="w-4 h-4" />;
      case "grading":
        return <Star className="w-4 h-4" />;
      case "question_group":
        return <Folder className="w-4 h-4" />;
      case "statement":
        return <Info className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn'] overflow-x-hidden"
      dir="rtl"
    >
      <FormHeader
        formTitle={questionnaire?.title || "پرسشنامه جدید"}
        setFormTitle={setFormTitle}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 h-[calc(100vh-80px)] mt-20">
          <QuestionSidebar onAddQuestion={addQuestion} />

          <div className="flex-1 mr-96">
            <FormBuilder
              questions={questions}
              onRemoveQuestion={removeQuestion}
              onUpdateQuestion={updateQuestionInList}
              onMoveQuestion={moveQuestion}
              onQuestionClick={openQuestionSettings}
              onAddQuestion={addQuestion}
              onDuplicateQuestion={duplicateQuestion}
              onConditionClick={(question: ApiQuestion) => {
                const mappedQuestion: Question = {
                  id: question.id,
                  type: question.type,
                  label: question.title,
                  title: question.title,
                  isRequired: question.is_required,
                  order: question.order,
                  parentId: question.related_group,
                };
                openConditionModal(mappedQuestion);
              }}
              onMoveToGroup={moveToGroup}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              renderQuestionTitle={renderQuestionTitle}
            />
          </div>
        </div>
      </DragDropContext>

      <QuestionSettingsModal
        isOpen={isModalOpen}
        onClose={closeQuestionSettings}
        question={selectedQuestion}
        onSave={handleQuestionSave}
        onCancel={handleQuestionCancel}
        isNewQuestion={isNewQuestion}
      />

      <ConditionalLogicModal
        isOpen={isConditionModalOpen}
        onClose={closeConditionModal}
        question={conditionQuestion}
        questions={questions}
        onUpdateQuestion={updateQuestionInList}
      />
    </div>
  );
};

export default Index;
