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
    label: string;
    option_kind: string;
    text: string;
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
    id: number;
    value: string;
    order: number;
  }>;
  columns?: Array<{
    id: number;
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
}

export interface QuestionOption {
  id?: number;
  question?: number;
  depend_questionnaire?: string | null;
  priority: number;
  score: number;
  value: string;
  type: string;
  label: string | null;
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
  textType?: "short" | "long";
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

        console.log("Creating new question with data:", {
          questionData,
          pendingQuestionData,
          isNewQuestion,
          selectedType: pendingQuestionData?.type,
        });

        // Get the correct type from pendingQuestionData if it's a new question
        const questionType =
          isNewQuestion && pendingQuestionData
            ? pendingQuestionData.type
            : questionData.type;

        console.log("Selected question type:", questionType);
        console.log("Mapped API type:", mapQuestionType(questionType));

        if (!questionType) {
          throw new Error("Question type is required");
        }

        const apiData = {
          is_required: questionData.required || false,
          order: questions.length + 1,
          type: mapQuestionType(questionType),
          style: getQuestionStyle(questionType),
          title: questionData.label || "",
          attachment_type: questionData.hasMedia
            ? questionData.mediaType
            : null,
          related_group: questionData.parentId || null,
        };

        console.log("Sending to API:", apiData);

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

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.info?.message || "خطا در ایجاد سوال");
        }

        const data = await response.json();
        console.log("API Response:", data);
        if (data.info.status === 200) {
          toast.success("سوال با موفقیت ایجاد شد");
          return data.data;
        } else {
          throw new Error(data.info.message);
        }
      } catch (error) {
        console.error("Error creating question:", error);
        toast.error(
          error instanceof Error ? error.message : "خطا در ایجاد سوال"
        );
        throw error;
      }
    },
    [id, accessToken, questions.length, isNewQuestion, pendingQuestionData]
  );

  const updateQuestion = useCallback(
    async (id: string, updates: Partial<Question>) => {
      try {
        if (!accessToken || !questionnaire?.id) {
          throw new Error("Missing access token or questionnaire ID");
        }

        // Base API data
        const apiData: any = {
          id: id,
          is_required: updates.required || false,
          title: updates.label || "",
          attachment_type: updates.hasMedia ? updates.mediaType : null,
          related_group: updates.parentId || null,
        };

        // Handle different question types
        switch (updates.type) {
          case "چندگزینه‌ای":
          case "اولویت‌دهی":
          case "اولویت دهی":
            apiData.type =
              updates.type === "اولویت‌دهی" || updates.type === "اولویت دهی"
                ? "prioritize"
                : updates.isMultiSelect
                ? "multi_select"
                : "single_select";
            apiData.options =
              updates.options?.map((text, index) => ({
                text,
                value: updates.optionValues?.[index] || "",
                priority: index + 1,
                score: 0,
                type: "option",
                label: text,
                option_kind: "normal",
              })) || [];
            apiData.has_other = updates.hasOther || false;
            apiData.has_none = updates.hasNone || false;
            apiData.has_all = updates.hasAll || false;
            apiData.is_multi_select = updates.isMultiSelect || false;
            apiData.randomize_options = updates.randomizeOptions || false;
            break;

          case "چند‌گزینه‌ای تصویری":
            apiData.type = "select_multi_image";
            apiData.options =
              updates.imageOptions?.map((opt, index) => ({
                text: opt.text,
                value: opt.imageUrl,
                priority: index + 1,
                score: {
                  source: "0.0",
                  parsedValue: 0,
                },
                type: "image",
                label: opt.text,
                option_kind: "usual",
              })) || [];
            apiData.is_multi_select = updates.isMultiImage || false;
            break;

          case "متنی کوتاه":
          case "متنی بلند":
            apiData.type = "text_question";
            apiData.style = updates.textType === "long" ? "long" : "short";
            apiData.limit = updates.maxChars || 200;
            break;

          case "عددی":
            apiData.type = "number_descriptive";
            apiData.min_value = updates.minNumber || 0;
            apiData.max_value = updates.maxNumber || 5000;
            apiData.step = updates.step || 1;
            break;

          case "متن بدون پاسخ":
            apiData.type = "statement";
            // Only allow one media type at a time
            if (updates.hasMedia) {
              apiData.attachment_type = updates.mediaType;
            }
            break;

          case "طیفی":
            apiData.type = "range_slider";
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

          default:
            apiData.type = mapQuestionType(updates.type || "");
        }

        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${questionnaire.id}/questions/update/`,
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
    [accessToken, questionnaire?.id]
  );

  // Helper function to map question types to API types
  const mapQuestionType = (type: string): string => {
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
      case "متنی کوتاه":
      case "متنی بلند":
      case "ایمیل":
        return "text_question";
      case "عددی":
        return "number_descriptive";
      case "گروه سوال":
        return "question_group";
      case "متن بدون پاسخ":
        return "statement";
      case "چند‌گزینه‌ای تصویری":
      case "انتخاب تصویر (تک جواب)":
      case "انتخاب تصویر (چند جواب)":
        return "select_multi_image";
      case "بله/خیر":
        return "yes_no";
      case "وب سایت":
        return "website";
      case "طیفی":
        return "range_slider";
      default:
        return "text_question";
    }
  };

  // Helper function to get question style
  const getQuestionStyle = (type: string): string | undefined => {
    switch (type) {
      case "متنی کوتاه":
        return "short";
      case "متنی بلند":
        return "long";
      case "ایمیل":
        return "email";
      default:
        return undefined;
    }
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

      const newQuestion: ApiQuestion = {
        id: uuidv4(),
        type: questionType,
        text: "",
        title: "",
        is_required: false,
        order: questions.length + 1,
        style: getQuestionStyle(questionType),
        attachment_type: questionType === "image" ? "image" : undefined,
        related_group: parentId,
      };

      if (questionType === "چندگزینه‌ای") {
        newQuestion.options = ["گزینه ۱", "گزینه ۲"];
        newQuestion.is_required = false;
        newQuestion.is_multiple_select = false;
        newQuestion.randomize_options = false;
      }

      // Set as new question and open modal
      setSelectedQuestion(newQuestion);
      setIsNewQuestion(true);
      setPendingQuestionData({ type: questionType, insertIndex, parentId });
      setIsModalOpen(true);
    },
    []
  );

  const handleQuestionSave = useCallback(
    async (questionData: Question) => {
      try {
        if (isNewQuestion && pendingQuestionData) {
          // Create new question
          await createQuestion(questionData);
        } else {
          // Update existing question
          await updateQuestion(questionData.id, questionData);
        }

        // Refresh questions list after save
        await fetchQuestions();

        setIsModalOpen(false);
        setSelectedQuestion(null);
        setIsNewQuestion(false);
        setPendingQuestionData(null);
      } catch (error) {
        console.error("Error saving question:", error);
        // Don't close modal if there was an error
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

  const removeQuestion = useCallback((id: string) => {
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
  }, []);

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
      const draggedItem = prev[dragIndex];
      const newItems = [...prev];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
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
    console.log("Scale labels from API:", question.scale_labels);
    console.log("Scale labels type:", typeof question.scale_labels);

    const mappedQuestion: Question = {
      id: question.id,
      type: mapApiQuestionType(question.type, question.style),
      label: question.text,
      title: question.title,
      isRequired: question.is_required,
      order: question.order,
      textType: question.style === "short" ? "short" : "long",
      hasMedia: question.attachment_type === "image",
      mediaType: "image",
      parentId: question.related_group,
      maxChars: question.limit,
      minChars: question.min_value,
      minNumber: question.min_value,
      maxNumber: question.max_value,
      options:
        question.type === "select_multi_image" ||
        question.type === "select_single_image"
          ? question.options?.map((opt) => opt.label) || []
          : question.options?.map((opt) => opt.value) || [],
      optionValues:
        question.type === "select_multi_image" ||
        question.type === "select_single_image"
          ? question.options?.map((opt) => opt.value) || []
          : question.options?.map((opt) => opt.value) || [],
      rawOptions: question.options || [],
      hasOther: question.is_other,
      hasNone: question.is_none,
      hasAll: question.is_all,
      randomizeOptions: question.randomize_options,
      isMultiSelect: question.is_multiple_select,
      minSelectableChoices: question.min_selectable_choices,
      maxSelectableChoices: question.max_selectable_choices,
      rows: question.rows?.map((row) => row.value) || [],
      columns: question.columns?.map((col) => col.value) || [],
      shuffleRows: question.shuffle_rows,
      shuffleColumns: question.shuffle_columns,
      ratingMax: question.count,
      ratingStyle: question.shape as "star" | "heart" | "thumbs",
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
      isMultiImage:
        question.type === "select_multi_image" && question.is_multiple_select,
    };

    // Set specific flags based on question type
    if (
      question.type === "select_single_image" ||
      question.type === "select_multi_image"
    ) {
      mappedQuestion.type = "چند‌گزینه‌ای تصویری";
      mappedQuestion.isMultiImage =
        question.type === "select_multi_image" && question.is_multiple_select;
    }

    console.log("Mapped question:", mappedQuestion);
    setSelectedQuestion(mappedQuestion);
    setIsModalOpen(true);
  };

  // Helper function to map API question types to our format
  const mapApiQuestionType = (type: string, style?: string): string => {
    if (type === "text_question") {
      switch (style) {
        case "short":
          return "متنی کوتاه";
        case "long":
          return "متنی بلند";
        case "email":
          return "ایمیل";
        default:
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
        return "چند‌گزینه‌ای تصویری";
      case "yes_no":
        return "بله/خیر";
      case "website":
        return "وب سایت";
      case "range_slider":
        return "طیفی";
      default:
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
    const { source, destination, type } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If it's a question type being dragged from the sidebar
    if (type === "QUESTION_TYPE") {
      // Add the question at the destination index
      addQuestion(result.draggableId, destination.index);
      return;
    }

    // If it's a question being reordered
    if (source.droppableId === destination.droppableId) {
      moveQuestion(source.index, destination.index);
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
            <div className="h-full overflow-y-auto">
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
