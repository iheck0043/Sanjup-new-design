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
import { Card, CardHeader } from "@/components/ui/card";

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
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Helper functions to determine group boundaries
  const getGroupInfo = (question: ApiQuestion, index: number) => {
    if (!question.related_group) return null;

    // Find the group question (question with type "question_group" and same related_group)
    const groupQuestionIndex = questions.findIndex(
      (q) =>
        q.type === "question_group" &&
        q.related_group === question.related_group
    );

    const isFirstInGroup =
      index === 0 ||
      !questions[index - 1]?.related_group ||
      questions[index - 1].related_group !== question.related_group;

    const isLastInGroup =
      index === questions.length - 1 ||
      !questions[index + 1]?.related_group ||
      questions[index + 1].related_group !== question.related_group;

    const isGroupQuestion = question.type === "question_group";

    return {
      isFirstInGroup,
      isLastInGroup,
      isGroupQuestion,
      groupQuestionIndex,
    };
  };

  // Calculate total number of items (questions + exit areas)
  const totalItems = questions.reduce((acc, question, index) => {
    const isLastQuestionInGroup =
      question.related_group &&
      !questions
        .slice(index + 1)
        .some((q) => q.related_group === question.related_group);
    return acc + (isLastQuestionInGroup ? 2 : 1);
  }, 0);

  // Create a flat array of all items (questions and exit areas)
  const allItems = questions.reduce((acc, question, index) => {
    const isLastQuestionInGroup =
      question.related_group &&
      !questions
        .slice(index + 1)
        .some((q) => q.related_group === question.related_group);

    acc.push({ type: "question", data: question, originalIndex: index });
    if (isLastQuestionInGroup) {
      acc.push({ type: "exit", data: question, originalIndex: index });
    }
    return acc;
  }, [] as Array<{ type: "question" | "exit"; data: ApiQuestion; originalIndex: number }>);

  return (
    <div className="p-6">
      <div className="">
        <Droppable droppableId="formQuestions" type="QUESTION_TYPE">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ position: "relative" }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!snapshot.isDraggingOver) return;

                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const itemHeight = 60 + 4; // height + margin
                const newHoverIndex = Math.floor(y / itemHeight);

                if (newHoverIndex !== hoverIndex) {
                  setHoverIndex(
                    Math.max(0, Math.min(newHoverIndex, allItems.length))
                  );
                }
              }}
              onDragLeave={() => {
                setHoverIndex(null);
              }}
            >
              {questions.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
                    snapshot.isDraggingOver
                      ? "border-blue-400 bg-blue-100/50"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div
                    className={`mb-2 transition-colors duration-200 ${
                      snapshot.isDraggingOver
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  >
                    <MoveRight className="w-8 h-8" />
                  </div>
                  <p
                    className={`text-sm text-center transition-colors duration-200 ${
                      snapshot.isDraggingOver
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {snapshot.isDraggingOver
                      ? "اینجا رها کنید"
                      : "سوالات را از لیست سمت راست به اینجا بکشید"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Drop zone at the beginning */}
                  {snapshot.isDraggingOver && hoverIndex === 0 && (
                    <div className="h-2 bg-blue-400 rounded-full mb-2 transition-all duration-150" />
                  )}

                  {allItems.map((item, index) => {
                    if (item.type === "question") {
                      const groupInfo = getGroupInfo(
                        item.data,
                        item.originalIndex
                      );

                      return (
                        <div key={String(item.data.id)}>
                          <Draggable
                            draggableId={String(item.data.id)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative group h-[60px] bg-transparent mb-1 ${
                                  snapshot.isDragging ? "opacity-50 mb-1" : ""
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  left: "unset !important",
                                  top: "unset !important",
                                }}
                              >
                                <div
                                  className={`h-[50px] ${
                                    item.data.related_group ? "pr-8" : ""
                                  }`}
                                >
                                  {/* Blue line for subgroup questions - positioned outside the padding */}
                                  {item.data.related_group && (
                                    <div
                                      className={`absolute right-4 w-1 z-10 transition-all duration-200 bg-blue-200`}
                                      style={{
                                        top:
                                          groupInfo?.isGroupQuestion ||
                                          groupInfo?.isFirstInGroup
                                            ? "-14px"
                                            : "-6px",
                                        bottom: groupInfo?.isLastInGroup
                                          ? "10px"
                                          : "-6px",
                                        height:
                                          groupInfo?.isGroupQuestion &&
                                          groupInfo?.isLastInGroup
                                            ? "calc(100% - 10px)"
                                            : groupInfo?.isFirstInGroup &&
                                              groupInfo?.isLastInGroup
                                            ? "calc(100% - 10px)"
                                            : "calc(100% + 12px)",
                                      }}
                                    />
                                  )}

                                  <Card
                                    className={`h-full flex items-center ${
                                      snapshot.isDragging
                                        ? "shadow-lg"
                                        : "hover:shadow-md"
                                    } transition-shadow duration-200`}
                                  >
                                    <CardHeader className="p-2 w-full">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                                            <div
                                              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                                                item.data.related_group
                                                  ? "bg-blue-100 text-blue-600"
                                                  : "bg-gray-100 text-gray-600"
                                              }`}
                                            >
                                              {item.data.related_group
                                                ? `${index + 1}.1`
                                                : `${index + 1}`}
                                            </div>
                                          </div>
                                          <div className="flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                                            {getQuestionTypeIcon(
                                              item.data.type,
                                              item.data
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-700">
                                            {renderQuestionTitle(item.data)}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                              onQuestionClick(item.data)
                                            }
                                          >
                                            <Settings className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                              onDuplicateQuestion(item.data)
                                            }
                                          >
                                            <Copy className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                              onRemoveQuestion(item.data.id)
                                            }
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                  </Card>
                                </div>
                              </div>
                            )}
                          </Draggable>

                          {/* Drop zone after each question when hovering over that specific area */}
                          {snapshot.isDraggingOver &&
                            hoverIndex === index + 1 && (
                              <div className="h-2 bg-blue-400 rounded-full my-1 transition-all duration-150" />
                            )}
                        </div>
                      );
                    } else {
                      return (
                        <Draggable
                          key={`group-${item.data.related_group}-exit`}
                          draggableId={`group-${item.data.related_group}-exit`}
                          index={index}
                          isDragDisabled={true}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors mb-1 ${
                                snapshot.isDragging
                                  ? "border-blue-400 bg-blue-50/80"
                                  : "border-gray-300 bg-gray-50/80"
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                position: "relative",
                                zIndex: 1,
                                pointerEvents: "auto",
                                cursor: "default",
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                const draggedQuestionId =
                                  e.dataTransfer.getData("text/plain");
                                const draggedQuestion = questions.find(
                                  (q) => q.id === draggedQuestionId
                                );
                                if (
                                  draggedQuestion &&
                                  draggedQuestion.related_group ===
                                    item.data.related_group
                                ) {
                                  onUpdateQuestion(draggedQuestionId, {
                                    related_group: null,
                                  });
                                }
                              }}
                            >
                              <span className="text-gray-400 text-sm">
                                برای خارج کردن سوال از گروه، اینجا رها کنید
                              </span>
                            </div>
                          )}
                        </Draggable>
                      );
                    }
                  })}
                </>
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
