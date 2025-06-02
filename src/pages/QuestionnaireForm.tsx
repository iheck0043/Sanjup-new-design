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

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface ApiQuestion {
  id: string;
  type: string;
  title: string;
  is_required: boolean;
  style?: string;
  attachment_type?: string;
  related_group?: string;
  parentId?: string;
  order: number;
  options?: string[];
  has_other?: boolean;
  has_none?: boolean;
  has_all?: boolean;
  is_multi_select?: boolean;
  randomize_options?: boolean;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: {
    left: string;
    center: string;
    right: string;
  };
  rating_max?: number;
  rating_style?: "star" | "heart" | "thumbs";
  min_chars?: number;
  max_chars?: number;
  rows?: string[];
  columns?: string[];
  is_multi_image?: boolean;
  is_single_image?: boolean;
  is_prioritize?: boolean;
  is_combobox?: boolean;
  is_grading?: boolean;
  is_number?: boolean;
  is_statement?: boolean;
  is_yes_no?: boolean;
  is_website?: boolean;
  is_range_slider?: boolean;
  is_email?: boolean;
  min_value?: number;
  max_value?: number;
  step?: number;
  default_value?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

export interface Question {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  hasOther?: boolean;
  hasNone?: boolean;
  hasAll?: boolean;
  isRequired?: boolean;
  isMultiSelect?: boolean;
  randomizeOptions?: boolean;
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
  ratingMax?: number;
  ratingStyle?: "star" | "heart" | "thumbs";
  textType?: "short" | "long";
  minChars?: number;
  maxChars?: number;
  minNumber?: number;
  maxNumber?: number;
  rows?: string[];
  columns?: string[];
  imageOptions?: Array<{
    text: string;
    imageUrl?: string;
  }>;
  hasMedia?: boolean;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  parentId?: string;
  children?: string[];
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
  const [questions, setQuestions] = useState<any[]>([]);
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
      if (data.info.status === 200) {
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
          parentId: questionData.parentId || null,
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
        if (!accessToken) {
          throw new Error("Missing access token");
        }

        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/10138/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              id: id,
              is_required: updates.required || false,
              type: mapQuestionType(updates.type || ""),
              title: updates.label || "",
              attachment_type: updates.hasMedia ? updates.mediaType : null,
              related_group: updates.parentId || null,
              style: updates.textType === "long" ? "long" : "short",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی سوال");
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
    [accessToken]
  );

  // Helper function to map question types to API types
  const mapQuestionType = (type: string): string => {
    console.log("Mapping question type:", type);
    const typeMap: { [key: string]: string } = {
      "چندگزینه‌ای (چند جواب)": "multi_select",
      "چندگزینه‌ای (تک جواب)": "single_select",
      ماتریسی: "matrix",
      "اولویت دهی": "prioritize",
      "لیست کشویی": "combobox",
      "درجه بندی": "grading",
      "متنی کوتاه": "text_question",
      "متنی بلند": "text_question",
      اعداد: "number_descriptive",
      "گروه سوال": "question_group",
      "توضیحی": "statement",
      "انتخاب تصویر (چند جواب)": "select_multi_image",
      "انتخاب تصویر (تک جواب)": "select_single_image",
      "بله/خیر": "yes_no",
      "وب سایت": "website",
      طیفی: "range_slider",
      ایمیل: "email",
      // اضافه کردن مپینگ‌های جدید
      چندگزینه‌ای: "single_select", // برای حالت پیش‌فرض چندگزینه‌ای
      متنی: "text_question", // برای حالت پیش‌فرض متنی
    };

    const mappedType = typeMap[type];
    console.log("Mapped to:", mappedType);

    if (!mappedType) {
      console.warn(
        "Unknown question type:",
        type,
        "defaulting to text_question"
      );
      return "text_question";
    }

    return mappedType;
  };

  // Helper function to get question style
  const getQuestionStyle = (type: string): string | undefined => {
    switch (type) {
      case "متنی کوتاه":
        return "short";
      case "متنی بلند":
        return "long";
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

      const newQuestion: Question = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: questionType,
        label: `سوال جدید`,
        required: false,
        parentId: parentId,
      };

      if (questionType === "چندگزینه‌ای") {
        newQuestion.options = ["گزینه ۱", "گزینه ۲"];
        newQuestion.hasOther = false;
        newQuestion.hasNone = false;
        newQuestion.hasAll = false;
        newQuestion.isRequired = false;
        newQuestion.isMultiSelect = false;
        newQuestion.randomizeOptions = false;
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
    (question: Question) => {
      // Convert to API question format for duplication
      const duplicatedQuestion: ApiQuestion = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: mapQuestionType(question.type),
        title: `کپی ${question.label}`,
        is_required: question.required,
        order: questions.length + 1,
        parentId: question.parentId,
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
      if (questionToRemove?.type === "گروه سوال") {
        return prev.filter((q) => q.id !== id && q.parentId !== id);
      }
      return prev.filter((q) => q.id !== id);
    });

    // Remove from expanded groups if it was a group
    setExpandedGroups((prev) => prev.filter((groupId) => groupId !== id));
  }, []);

  const updateQuestionInList = useCallback(
    (id: string, field: string, value: any) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
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
      prev.map((q) => (q.id === questionId ? { ...q, parentId: groupId } : q))
    );
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  const openQuestionSettings = useCallback((question: ApiQuestion) => {
    // Map API question data to our question format
    const mappedQuestion: Question = {
      id: question.id,
      type: mapApiQuestionType(question.type),
      label: question.title,
      required: question.is_required,
      textType: question.style === "long" ? "long" : "short",
      hasMedia: !!question.attachment_type,
      mediaType: question.attachment_type as "image" | "video",
      parentId: question.related_group,
      // Map other fields based on question type
      ...(question.type === "multi_select" && {
        options: question.options || [],
        hasOther: question.has_other || false,
        hasNone: question.has_none || false,
        hasAll: question.has_all || false,
        isMultiSelect: true,
        randomizeOptions: question.randomize_options || false,
      }),
      ...(question.type === "single_select" && {
        options: question.options || [],
        hasOther: question.has_other || false,
        hasNone: question.has_none || false,
        hasAll: question.has_all || false,
        isMultiSelect: false,
        randomizeOptions: question.randomize_options || false,
      }),
      ...(question.type === "matrix" && {
        rows: question.rows || [],
        columns: question.columns || [],
      }),
      ...(question.type === "prioritize" && {
        options: question.options || [],
        isPrioritize: true,
      }),
      ...(question.type === "combobox" && {
        options: question.options || [],
        isCombobox: true,
      }),
      ...(question.type === "grading" && {
        ratingMax: question.rating_max,
        ratingStyle: question.rating_style,
        isGrading: true,
      }),
      ...(question.type === "text_question" && {
        textType: question.style === "long" ? "long" : "short",
        minChars: question.min_chars,
        maxChars: question.max_chars,
      }),
      ...(question.type === "number_descriptive" && {
        isNumber: true,
        minNumber: question.min_value,
        maxNumber: question.max_value,
        step: question.step,
        defaultValue: question.default_value,
      }),
      ...(question.type === "select_multi_image" && {
        isMultiImage: true,
        imageOptions: question.options?.map((opt) => ({ text: opt })) || [],
      }),
      ...(question.type === "select_single_image" && {
        isSingleImage: true,
        imageOptions: question.options?.map((opt) => ({ text: opt })) || [],
      }),
      ...(question.type === "yes_no" && {
        isYesNo: true,
      }),
      ...(question.type === "website" && {
        isWebsite: true,
        validation: {
          pattern: "^https?://.+",
          required: question.is_required,
        },
      }),
      ...(question.type === "range_slider" && {
        isRangeSlider: true,
        minValue: question.min_value,
        maxValue: question.max_value,
        step: question.step,
        defaultValue: question.default_value,
      }),
      ...(question.type === "email" && {
        isEmail: true,
        validation: {
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          required: question.is_required,
        },
      }),
    };

    setSelectedQuestion(mappedQuestion);
    setIsNewQuestion(false);
    setIsModalOpen(true);
  }, []);

  // Helper function to map API question types to our format
  const mapApiQuestionType = (type: string): string => {
    switch (type) {
      case "multi_select":
        return "چندگزینه‌ای (چند جواب)";
      case "single_select":
        return "چندگزینه‌ای (تک جواب)";
      case "matrix":
        return "ماتریسی";
      case "prioritize":
        return "اولویت دهی";
      case "combobox":
        return "لیست کشویی";
      case "grading":
        return "درجه بندی";
      case "text_question":
        return "متنی کوتاه";
      case "number_descriptive":
        return "اعداد";
      case "question_group":
        return "گروه سوال";
      case "statement":
        return "توضیحی";
      case "select_multi_image":
        return "انتخاب تصویر (چند جواب)";
      case "select_single_image":
        return "انتخاب تصویر (تک جواب)";
      case "yes_no":
        return "بله/خیر";
      case "website":
        return "وب سایت";
      case "range_slider":
        return "طیفی";
      case "email":
        return "ایمیل";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn'] overflow-x-hidden"
        dir="rtl"
      >
        <FormHeader
          formTitle={questionnaire?.title || "پرسشنامه جدید"}
          setFormTitle={setFormTitle}
        />

        <div className="flex flex-1 h-[calc(100vh-80px)] relative">
          <FormBuilder
            questions={questions}
            addQuestion={addQuestion}
            updateQuestion={updateQuestionInList}
            duplicateQuestion={duplicateQuestion}
            removeQuestion={removeQuestion}
            moveQuestion={moveQuestion}
            moveToGroup={moveToGroup}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            openQuestionSettings={openQuestionSettings}
          />

          <QuestionSidebar onAddQuestion={addQuestion} />
        </div>

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
    </DndProvider>
  );
};

export default Index;
