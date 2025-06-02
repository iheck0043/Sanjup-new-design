import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FormBuilder from "../components/FormBuilder";
import QuestionSidebar from "../components/QuestionSidebar";
import FormHeader from "../components/FormHeader";
import { QuestionSettingsModal } from "../components/QuestionSettingsModal";
import { ConditionalLogicModal } from "../components/ConditionalLogicModal";
import { useQuestionnaireData } from "../hooks/useQuestionnaireData";
import { useQuestionManagement } from "../hooks/useQuestionManagement";
import { mapApiQuestionToQuestion } from "../utils/questionMapping";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface ApiQuestion {
  id: string;
  type: string;
  title: string;
  is_required: boolean;
  style?: string;
  attachment_type?: string;
  related_group?: string;
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
  const {
    questionnaire,
    questions,
    setQuestions,
    loading,
    fetchQuestions,
  } = useQuestionnaireData();

  const {
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
  } = useQuestionManagement(questions, fetchQuestions);

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
          await createQuestion(questionData);
        } else {
          await updateQuestion(questionData.id, questionData);
        }

        await fetchQuestions();

        setIsModalOpen(false);
        setSelectedQuestion(null);
        setIsNewQuestion(false);
        setPendingQuestionData(null);
      } catch (error) {
        console.error("Error saving question:", error);
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
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
  }, []);

  const duplicateQuestion = useCallback((questionId: string) => {
    // Implementation for duplicating question
    console.log("Duplicating question:", questionId);
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const questionToRemove = prev.find((q) => q.id === id);
      if (questionToRemove?.type === "question_group") {
        return prev.filter((q) => q.id !== id && q.related_group !== id);
      }
      return prev.filter((q) => q.id !== id);
    });

    setExpandedGroups((prev) => prev.filter((groupId) => groupId !== id));
  }, [setQuestions]);

  const updateQuestionInList = useCallback(
    (id: string, updates: Partial<Question>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
      );
    },
    [setQuestions]
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
  }, [setQuestions]);

  const moveToGroup = useCallback((questionId: string, groupId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, related_group: groupId } : q))
    );
  }, [setQuestions]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  const openQuestionSettings = useCallback((question: ApiQuestion) => {
    const mappedQuestion = mapApiQuestionToQuestion(question);
    setSelectedQuestion(mappedQuestion);
    setIsNewQuestion(false);
    setIsModalOpen(true);
  }, []);

  const closeQuestionSettings = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
  }, []);

  const openConditionModal = useCallback((questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const mappedQuestion = mapApiQuestionToQuestion(question);
      setConditionQuestion(mappedQuestion);
      setIsConditionModalOpen(true);
    }
  }, [questions]);

  const closeConditionModal = useCallback(() => {
    setIsConditionModalOpen(false);
    setConditionQuestion(null);
  }, []);

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
          setFormTitle={() => {}}
        />

        <div className="flex flex-1 h-[calc(100vh-80px)] relative">
          <FormBuilder
            questions={questions}
            onRemoveQuestion={removeQuestion}
            onUpdateQuestion={updateQuestionInList}
            onMoveQuestion={moveQuestion}
            onQuestionClick={openQuestionSettings}
            onAddQuestion={addQuestion}
            onDuplicateQuestion={duplicateQuestion}
            onConditionClick={openConditionModal}
            onMoveToGroup={moveToGroup}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            renderQuestionTitle={renderQuestionTitle}
          />

          <QuestionSidebar onAddQuestion={addQuestion} />
        </div>

        <QuestionSettingsModal
          open={isModalOpen}
          onClose={closeQuestionSettings}
          question={selectedQuestion}
          onSave={handleQuestionSave}
        />

        <ConditionalLogicModal
          open={isConditionModalOpen}
          onClose={closeConditionModal}
          initialConditions={[]}
          onSave={() => {}}
          questionOptions={[]}
        />
      </div>
    </DndProvider>
  );
};

export default Index;
