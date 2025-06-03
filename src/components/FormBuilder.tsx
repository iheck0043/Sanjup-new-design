import React, { useState, useCallback } from "react";
import {
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Settings,
  ChevronDown,
  ChevronUp,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiQuestion } from "../pages/QuestionnaireForm";

interface FormBuilderProps {
  questions: ApiQuestion[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<ApiQuestion>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: ApiQuestion) => void;
  onAddQuestion: (type: string, insertIndex?: number) => void;
  onDuplicateQuestion: (question: ApiQuestion) => void;
  onConditionClick: (question: ApiQuestion) => void;
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

  const handleDragEnd = (result: any) => {
    setDragOverIndex(null);
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      onMoveQuestion(source.index, destination.index);
    }
  };

  const renderQuestion = (question: ApiQuestion, index: number) => {
    const isGroup = question.type === "گروه سوال";
    const isExpanded = expandedGroups.includes(question.id);
    const childQuestions = questions.filter(
      (q) => q.related_group === question.id
    );

    return (
      <Draggable
        key={String(question.id)}
        draggableId={String(question.id + "_" + index)}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn("relative group", snapshot.isDragging && "z-50")}
          >
            <div
              className={cn(
                "bg-white rounded-lg border border-gray-200/70 shadow-sm",
                snapshot.isDragging && "shadow-lg scale-[1.02] rotate-1",
                "hover:shadow-md hover:border-gray-300/50"
              )}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    {...provided.dragHandleProps}
                    className="mt-1.5 cursor-move text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {renderQuestionTitle(question)}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                      onClick={() => onQuestionClick(question)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                      onClick={() => onDuplicateQuestion(question)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                      onClick={() => onRemoveQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {isGroup && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                        onClick={() => onToggleGroup(question.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isGroup && isExpanded && childQuestions.length > 0 && (
              <div className="mt-2 pr-8">
                {childQuestions.map((childQuestion, childIndex) => (
                  <div key={childQuestion.id} className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="pl-4">
                      {renderQuestion(childQuestion, childIndex)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <Droppable droppableId="formQuestions" type="QUESTION_TYPE">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-4 ${
                snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg" : ""
              }`}
            >
              {questions.map((question, index) =>
                renderQuestion(question, index)
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default FormBuilder;
