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
  SquareCheck,
  BarChart3,
  SquarePlus,
  FileText,
  Type,
  Hash,
  Grid3X3,
  ArrowUpDown,
  Image,
  Star,
  Mail,
  AlignLeft,
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

const getQuestionTypeIcon = (type: string, question) => {
  switch (type) {
    case "single_select":
    case "multi_select":
      return <SquareCheck className="w-3 h-3 text-blue-600" />;
    case "range_slider":
      return <BarChart3 className="w-3 h-3 text-indigo-600" />;
    case "question_group":
      return <SquarePlus className="w-3 h-3 text-green-600" />;
    case "statement":
      return <FileText className="w-3 h-3 text-gray-600" />;
    case "text_question":
      if (question.style === "email") {
        return <Mail className="w-3 h-3 text-red-600" />;
      } else if (question.style === "long") {
        return <Type className="w-3 h-3 text-red-600" />;
      } else {
        return <Type className="w-3 h-3 text-purple-600" />;
      }
    case "number_descriptive":
      return <Hash className="w-3 h-3 text-orange-600" />;
    case "matrix":
      return <Grid3X3 className="w-3 h-3 text-cyan-600" />;
    case "prioritize":
      return <ArrowUpDown className="w-3 h-3 text-pink-600" />;
    case "select_multi_image":
      return <Image className="w-3 h-3 text-yellow-600" />;
    case "combobox":
      return <ChevronDown className="w-3 h-3 text-teal-600" />;
    case "grading":
      return <Star className="w-3 h-3 text-amber-600" />;
    case "yes_no":
      return <SquareCheck className="w-3 h-3 text-red-600" />;
    case "website":
      return <Mail className="w-3 h-3 text-red-600" />;
    default:
      return <Type className="w-3 h-3 text-gray-600" />;
  }
};

const getQuestionTypeColor = (type: string) => {
  switch (type) {
    case "single_select":
    case "multi_select":
      return "bg-blue-50";
    case "range_slider":
      return "bg-indigo-50";
    case "question_group":
      return "bg-green-50";
    case "statement":
      return "bg-gray-50";
    case "text_question":
      return "bg-purple-50";
    case "number_descriptive":
      return "bg-orange-50";
    case "matrix":
      return "bg-cyan-50";
    case "prioritize":
      return "bg-pink-50";
    case "select_multi_image":
      return "bg-yellow-50";
    case "combobox":
      return "bg-teal-50";
    case "grading":
      return "bg-amber-50";
    case "yes_no":
      return "bg-red-50";
    case "website":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

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

  const renderQuestion = (
    question: ApiQuestion,
    index: number,
    parentId?: string
  ) => {
    const isGroup = question.type === "question_group";
    const isExpanded = expandedGroups.includes(question.id);
    const childQuestions = questions.filter(
      (q) => q.related_group === question.id
    );

    if (isGroup) {
      console.log("Group Details:", {
        id: question.id,
        title: question.title,
        childQuestions: childQuestions.map((q) => ({
          id: q.id,
          title: q.title,
          related_group: q.related_group,
        })),
      });
    }

    return (
      <Draggable
        key={String(question.id)}
        draggableId={String(question.id)}
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
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-move text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-full text-xs text-gray-600 font-medium",
                          getQuestionTypeColor(question.type)
                        )}
                      >
                        {getQuestionTypeIcon(question.type, question)}
                      </span>
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] text-gray-600 font-medium">
                        {index + 1}
                      </span>
                      <div className="text-sm text-gray-700 font-medium">
                        {renderQuestionTitle(question)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                      onClick={() => onQuestionClick(question)}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                      onClick={() => onDuplicateQuestion(question)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                      onClick={() => onRemoveQuestion(question.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    {isGroup && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                        onClick={() => onToggleGroup(question.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isGroup && isExpanded && (
              <div className="mt-2 pr-8">
                <Droppable
                  droppableId={String(question.id)}
                  type="QUESTION_TYPE"
                >
                  {(
                    provided: DroppableProvided,
                    snapshot: DroppableStateSnapshot
                  ) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-4 min-h-[50px] rounded-lg transition-colors duration-200",
                        snapshot.isDraggingOver
                          ? "bg-blue-50/80 border-2 border-dashed border-blue-300 p-4"
                          : "border-2 border-dashed border-transparent p-4",
                        childQuestions.length === 0 &&
                          "flex items-center justify-center"
                      )}
                    >
                      {childQuestions.length === 0 ? (
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                          <MoveRight className="w-4 h-4" />
                          <span>سوالات را به اینجا بکشید</span>
                        </div>
                      ) : (
                        childQuestions.map((childQuestion, childIndex) => (
                          <div key={childQuestion.id} className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                            <div className="pl-4">
                              {renderQuestion(
                                childQuestion,
                                childIndex,
                                question.id
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  // Filter main questions (those not in any group)
  const mainQuestions = questions.filter((q) => !q.related_group);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <Droppable droppableId="formQuestions" type="QUESTION_TYPE">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-4",
                snapshot.isDraggingOver && "bg-blue-50/50 rounded-lg p-2"
              )}
            >
              {mainQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="text-gray-400 mb-2">
                    <MoveRight className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 text-sm text-center">
                    سوالات را از لیست سمت راست به اینجا بکشید
                  </p>
                </div>
              ) : (
                mainQuestions.map((question, index) =>
                  renderQuestion(question, index)
                )
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
