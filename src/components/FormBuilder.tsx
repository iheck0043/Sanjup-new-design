import React, { useState, useRef } from "react";
import { useDrop, useDrag, useDragLayer } from "react-dnd";
import QuestionCard from "./QuestionCard";
import QuestionGroup from "./QuestionGroup";
import { Question, ApiQuestion } from "../pages/QuestionnaireForm";
import {
  MousePointer2,
  GripVertical,
  MoreVertical,
  Copy,
  Trash2,
  Link,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionItemProps {
  question: Question;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: Question) => void;
  onDuplicateQuestion: (question: Question) => void;
  onRemoveQuestion: (id: string) => void;
  onConditionClick: (question: Question) => void;
  renderQuestionTitle: (question: Question) => React.ReactNode;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  moveQuestion,
  onQuestionClick,
  onDuplicateQuestion,
  onRemoveQuestion,
  onConditionClick,
  renderQuestionTitle,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "QUESTION",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "QUESTION",
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="transition-opacity duration-200"
    >
      <Card
        className={`relative p-4 mb-4 cursor-pointer transition-all duration-200 ${
          isOver && canDrop
            ? "border-2 border-blue-500 bg-blue-50 shadow-lg"
            : "hover:shadow-md"
        }`}
        onClick={() => onQuestionClick(question)}
      >
        <div className="flex items-center gap-2">
          <div className="cursor-move">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">{renderQuestionTitle(question)}</div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateQuestion(question);
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onConditionClick(question);
              }}
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveQuestion(question.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface DropZoneProps {
  index: number;
  onAddQuestion: (type: string, index: number) => void;
  setDragOverIndex: (index: number | null) => void;
  setIsDraggingFromSidebar: (isDragging: boolean) => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  index,
  onAddQuestion,
  setDragOverIndex,
  setIsDraggingFromSidebar,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "question",
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return;
      onAddQuestion(item.type, index);
      setDragOverIndex(null);
      setIsDraggingFromSidebar(false);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      if (!monitor.isOver()) return;
      setDragOverIndex(index);
      setIsDraggingFromSidebar(true);
    },
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`transform transition-all duration-150 ease-out   ${
        isActive
          ? "h-20  flex items-center justify-center opacity-100 py-3 "
          : "h-4 opacity-0  "
      }`}
      style={{
        position: "relative",
        zIndex: isActive ? 1 : 9999,
        pointerEvents: "all",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div
        className={`h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-400 rounded-lg `}
        style={{
          position: "relative",

          pointerEvents: "all",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {isActive && (
          <div className="text-blue-500 text-sm font-medium">
            رها کنید تا سوال اضافه شود
          </div>
        )}
      </div>
    </div>
  );
};

interface FormBuilderProps {
  questions: ApiQuestion[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: ApiQuestion) => void;
  onAddQuestion: (
    type: string,
    insertIndex?: number,
    parentId?: string
  ) => void;
  onDuplicateQuestion: (question: Question) => void;
  onConditionClick: (question: Question) => void;
  onMoveToGroup: (questionId: string, groupId: string) => void;
  expandedGroups: string[];
  onToggleGroup: (groupId: string) => void;
  renderQuestionTitle: (question: ApiQuestion) => React.ReactNode;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onRemoveQuestion,
  onUpdateQuestion,
  onMoveQuestion,
  onQuestionClick,
  onAddQuestion,
  onDuplicateQuestion,
  onConditionClick,
  onMoveToGroup,
  expandedGroups,
  onToggleGroup,
  renderQuestionTitle,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDragging, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }));

  const handleDragEnd = () => {
    setDragOverIndex(null);
    setIsDraggingFromSidebar(false);
  };

  // Separate top-level questions from grouped questions
  const topLevelQuestions = questions.filter((q) => !q.parentId);
  const groupedQuestions = questions.filter((q) => q.parentId);

  const getChildQuestions = (groupId: string) => {
    return groupedQuestions.filter((q) => q.parentId === groupId);
  };

  return (
    <div className="flex-1 overflow-y-auto pr-96 ">
      <div
        ref={containerRef}
        className="min-h-[500px] p-6 max-w-4xl mx-auto relative"
        onDragEnd={handleDragEnd}
      >
        {topLevelQuestions.length === 0 ? (
          <div className="relative">
            <DropZone
              index={0}
              onAddQuestion={onAddQuestion}
              setDragOverIndex={setDragOverIndex}
              setIsDraggingFromSidebar={setIsDraggingFromSidebar}
            />
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 hover-scale">
                <MousePointer2 className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-600">
                شروع ساخت فرم
              </h3>
              <p className="text-center max-w-sm text-gray-500 text-sm">
                سوالات خود را از سایدبار سمت راست به اینجا بکشید یا روی آنها
                کلیک کنید
              </p>
            </div>
          </div>
        ) : (
          <div>
            <DropZone
              index={0}
              onAddQuestion={onAddQuestion}
              setDragOverIndex={setDragOverIndex}
              setIsDraggingFromSidebar={setIsDraggingFromSidebar}
            />
            {topLevelQuestions.map((question, index) => (
              <div key={question.id} className="relative">
                <div className="transform transition-all duration-150 ease-out">
                  {question.type === "گروه سوال" ? (
                    <QuestionGroup
                      group={question}
                      children={getChildQuestions(question.id)}
                      index={index}
                      onRemoveQuestion={onRemoveQuestion}
                      onUpdateQuestion={onUpdateQuestion}
                      onMoveQuestion={onMoveQuestion}
                      onQuestionClick={onQuestionClick}
                      onAddQuestion={onAddQuestion}
                      onDuplicateQuestion={onDuplicateQuestion}
                      onConditionClick={onConditionClick}
                      onMoveToGroup={onMoveToGroup}
                      isExpanded={expandedGroups.includes(question.id)}
                      onToggleExpand={onToggleGroup}
                    />
                  ) : (
                    <QuestionCard
                      question={question}
                      index={index}
                      onRemove={onRemoveQuestion}
                      onUpdate={onUpdateQuestion}
                      onMove={onMoveQuestion}
                      onClick={onQuestionClick}
                      onAddQuestion={onAddQuestion}
                      onDuplicate={onDuplicateQuestion}
                      onConditionClick={onConditionClick}
                    />
                  )}
                </div>
                <DropZone
                  index={index + 1}
                  onAddQuestion={onAddQuestion}
                  setDragOverIndex={setDragOverIndex}
                  setIsDraggingFromSidebar={setIsDraggingFromSidebar}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
