
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDrop } from "react-dnd";
import QuestionCard from "./QuestionCard";
import QuestionGroup from "./QuestionGroup";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  parentId?: string;
  options?: { id: string; text: string }[];
}

interface APIQuestion {
  id: string;
  type: string;
  title: string;
  is_required: boolean;
  parentId?: string;
  options?: { id: string; text: string }[];
}

interface FormBuilderProps {
  questions: APIQuestion[];
  addQuestion: (type: string, index?: number, parentId?: string) => void;
  updateQuestion: (id: string, field: string, value: any) => void;
  duplicateQuestion: (question: Question) => void;
  removeQuestion: (id: string) => void;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
  moveToGroup: (questionId: string, targetGroupId: string) => void;
  expandedGroups: string[];
  toggleGroup: (groupId: string) => void;
  openQuestionSettings: (question: APIQuestion) => void;
}

const FormBuilder = ({
  questions,
  addQuestion,
  updateQuestion,
  duplicateQuestion,
  removeQuestion,
  moveQuestion,
  moveToGroup,
  expandedGroups,
  toggleGroup,
  openQuestionSettings,
}: FormBuilderProps) => {
  const handleDrop = useCallback(
    (item: { id: string; type: string; isFromSidebar?: boolean }) => {
      if (item.isFromSidebar) {
        addQuestion(item.type);
      }
    },
    [addQuestion]
  );

  const [{ isOver }, drop] = useDrop({
    accept: "question",
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Group questions by parent (for groups)
  const groupedQuestions = useMemo(() => {
    const groups: { [key: string]: Question[] } = { root: [] };
    
    questions.forEach((q) => {
      // Convert API question to Question interface
      const question: Question = {
        id: q.id,
        type: q.type,
        label: q.title, // Map title to label
        required: q.is_required,
        parentId: q.parentId,
        options: q.options,
      };
      
      if (question.parentId) {
        if (!groups[question.parentId]) {
          groups[question.parentId] = [];
        }
        groups[question.parentId].push(question);
      } else {
        groups.root.push(question);
      }
    });
    
    return groups;
  }, [questions]);

  const renderQuestion = useCallback(
    (question: Question, index: number, parentId?: string) => {
      if (question.type === "گروه سوال") {
        const isExpanded = expandedGroups.includes(question.id);
        const childQuestions = groupedQuestions[question.id] || [];

        return (
          <QuestionGroup
            key={question.id}
            question={question}
            index={index}
            isExpanded={isExpanded}
            onToggle={() => toggleGroup(question.id)}
            onEdit={() => openQuestionSettings(questions.find(q => q.id === question.id)!)}
            onDuplicate={() => duplicateQuestion(question)}
            onRemove={() => removeQuestion(question.id)}
            onMove={moveQuestion}
            onAddChild={(type) => addQuestion(type, undefined, question.id)}
            parentId={parentId}
          >
            {childQuestions}
          </QuestionGroup>
        );
      }

      return (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          onEdit={() => openQuestionSettings(questions.find(q => q.id === question.id)!)}
          onDuplicate={() => duplicateQuestion(question)}
          onRemove={() => removeQuestion(question.id)}
          onMove={moveQuestion}
          parentId={parentId}
        />
      );
    },
    [
      expandedGroups,
      groupedQuestions,
      toggleGroup,
      openQuestionSettings,
      duplicateQuestion,
      removeQuestion,
      moveQuestion,
      addQuestion,
      questions,
    ]
  );

  return (
    <div
      ref={drop}
      className="flex-1 p-6 min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20"
      style={{ position: "relative" }}
    >
      {isOver && (
        <div
          className="absolute inset-0 bg-blue-400/10 border-2 border-dashed border-blue-400 rounded-lg animate-pulse"
          style={{
            zIndex: 1,
          }}
        />
      )}
      
      <div className="space-y-3">
        {groupedQuestions.root.length === 0 ? (
          <div className="text-center py-20 text-gray-400 animate-fade-in">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">هنوز سوالی اضافه نشده</h3>
            <p className="text-sm text-gray-400">سوالات را از نوار کناری به اینجا بکشید</p>
          </div>
        ) : (
          groupedQuestions.root.map((question, index) =>
            renderQuestion(question, index)
          )
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
