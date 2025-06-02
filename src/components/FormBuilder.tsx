
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
            {childQuestions.map((child, childIndex) =>
              renderQuestion(child, childIndex, question.id)
            )}
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
      className="flex-1 p-4"
      style={{ position: "relative" }}
    >
      {isOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            zIndex: 1,
            backgroundColor: "rgba(0, 100, 200, 0.1)",
          }}
        />
      )}
      {groupedQuestions.root.map((question, index) =>
        renderQuestion(question, index)
      )}
    </div>
  );
};

export default FormBuilder;
