
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Question, ApiQuestion } from "../pages/QuestionnaireForm";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useQuestionManagement = (
  questions: ApiQuestion[],
  fetchQuestions: () => Promise<void>
) => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [conditionQuestion, setConditionQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [pendingQuestionData, setPendingQuestionData] = useState<{
    type: string;
    insertIndex?: number;
    parentId?: string;
  } | null>(null);

  // Helper function to map question types to API types
  const mapQuestionType = (type: string): string => {
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
      توضیحی: "statement",
      "انتخاب تصویر (چند جواب)": "select_multi_image",
      "انتخاب تصویر (تک جواب)": "select_single_image",
      "بله/خیر": "yes_no",
      "وب سایت": "website",
      طیفی: "range_slider",
      ایمیل: "email",
      چندگزینه‌ای: "single_select",
      متنی: "text_question",
    };

    const mappedType = typeMap[type];
    if (!mappedType) {
      console.warn("Unknown question type:", type, "defaulting to text_question");
      return "text_question";
    }
    return mappedType;
  };

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

  const createQuestion = useCallback(
    async (questionData: Partial<Question>) => {
      try {
        if (!id || !accessToken) {
          throw new Error("Missing questionnaire ID or access token");
        }

        const questionType =
          isNewQuestion && pendingQuestionData
            ? pendingQuestionData.type
            : questionData.type;

        if (!questionType) {
          throw new Error("Question type is required");
        }

        const apiData = {
          is_required: questionData.required || false,
          order: questions.length + 1,
          type: mapQuestionType(questionType),
          style: getQuestionStyle(questionType),
          title: questionData.label || "",
          attachment_type: questionData.hasMedia ? questionData.mediaType : null,
          related_group: questionData.parentId || null,
        };

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
          throw new Error(errorData.info?.message || "خطا در ایجاد سوال");
        }

        const data = await response.json();
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
    async (questionId: string, updates: Partial<Question>) => {
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
              id: questionId,
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

  return {
    selectedQuestion,
    setSelectedQuestion,
    isModalOpen,
    setIsModalOpen,
    isConditionModalOpen,
    setIsConditionModalOpen,
    conditionQuestion,
    setConditionQuestion,
    isNewQuestion,
    setIsNewQuestion,
    pendingQuestionData,
    setPendingQuestionData,
    createQuestion,
    updateQuestion,
    mapQuestionType,
  };
};
