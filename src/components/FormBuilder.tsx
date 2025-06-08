
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
import { ApiQuestion } from "../pages/Index";

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
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const handleRemoveFromGroup = (questionId: string) => {
    onUpdateQuestion(questionId, { related_group: null });
  };

  const handleAddToGroup = (type: string, groupId: string) => {
    console.log("Adding question to group:", type, groupId);
    
    // Create a temporary question ID
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    // Add the question with the group relationship
    onAddQuestion(type);
    
    // Find the most recently added question and update its related_group
    setTimeout(() => {
      const allQuestions = questions;
      const lastQuestion = allQuestions[allQuestions.length - 1];
      if (lastQuestion) {
        onUpdateQuestion(lastQuestion.id, { related_group: groupId });
      }
    }, 100);
  };

  // Get main questions (not children of any group)
  const mainQuestions = questions.filter(q => !q.related_group);

  const renderChildQuestions = (groupId: string) => {
    const childQuestions = questions.filter(q => q.related_group === groupId);
    
    return (
      <Droppable droppableId={`group-${groupId}`} type="QUESTION">
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "mt-3 min-h-[120px] rounded-lg border-2 border-dashed transition-all duration-300 p-3",
              snapshot.isDraggingOver 
                ? "border-blue-400 bg-blue-50/70" 
                : "border-blue-200 bg-blue-50/30"
            )}
            onDrop={(e) => {
              e.preventDefault();
              console.log("Drop event on group:", groupId);
              const questionType = e.dataTransfer.getData('text/plain');
              console.log("Question type:", questionType);
              if (questionType && questionType.startsWith('question-type-')) {
                const type = questionType.replace('question-type-', '');
                console.log("Adding type to group:", type, groupId);
                handleAddToGroup(type, groupId);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOverGroup(groupId);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              // Only clear if we're leaving the actual drop zone
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverGroup(null);
              }
            }}
          >
            {childQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <SquarePlus className="w-8 h-8 text-blue-300 mb-3" />
                <p className="text-blue-500 text-sm font-medium text-center">
                  سوالات را به اینجا بکشید
                </p>
                <p className="text-blue-400 text-xs text-center mt-1">
                  یا از نوار کناری سوال جدید اضافه کنید
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {childQuestions.map((question, index) => (
                  <Draggable
                    key={String(question.id)}
                    draggableId={String(question.id + "_child")}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "relative group",
                          snapshot.isDragging && "z-50"
                        )}
                      >
                        <div
                          className={cn(
                            "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm transition-all duration-200",
                            snapshot.isDragging && "shadow-xl scale-[1.03] rotate-1 ring-2 ring-blue-300",
                            "hover:shadow-md hover:border-blue-300 hover:scale-[1.01]"
                          )}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-blue-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                                    {getQuestionTypeIcon(question.type, question)}
                                  </span>
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <div className="text-sm text-gray-800 font-medium">
                                    {renderQuestionTitle(question)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                  onClick={() => onQuestionClick(question)}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                  onClick={() => onDuplicateQuestion(question)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-100"
                                  onClick={() => handleRemoveFromGroup(question.id)}
                                  title="خارج کردن از گروه"
                                >
                                  <MoveRight className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                  onClick={() => onRemoveQuestion(question.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  const renderQuestion = (question: ApiQuestion, index: number) => {
    const isGroup = question.type === "question_group";
    const childQuestions = questions.filter(q => q.related_group === question.id);
    const isExpanded = expandedGroups.includes(question.id);

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
                "bg-white rounded-lg border transition-all duration-200",
                snapshot.isDragging && "shadow-xl scale-[1.02] rotate-1 ring-2 ring-blue-300",
                isGroup ? (
                  "border-green-200 shadow-md hover:shadow-lg hover:border-green-300"
                ) : (
                  "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                ),
                isGroup && dragOverGroup === question.id && "border-green-400 shadow-xl bg-green-50/30"
              )}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-move text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                          isGroup ? "bg-green-100 text-green-700" : getQuestionTypeColor(question.type) + " text-gray-700"
                        )}
                      >
                        {getQuestionTypeIcon(question.type, question)}
                      </span>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="text-base text-gray-800 font-medium">
                        {renderQuestionTitle(question)}
                      </div>
                      {isGroup && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {childQuestions.length} سوال
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isGroup && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-100"
                        onClick={() => onToggleGroup(question.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => onQuestionClick(question)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => onDuplicateQuestion(question)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => onRemoveQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {isGroup && isExpanded && (
                <div className="border-t border-green-100 bg-green-50/20">
                  {renderChildQuestions(question.id)}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <Droppable droppableId="formQuestions" type="QUESTION">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-6 min-h-[400px] transition-all duration-300",
                snapshot.isDraggingOver && "bg-blue-50/50 rounded-lg p-4"
              )}
              onDrop={(e) => {
                e.preventDefault();
                console.log("Drop event on main area");
                const questionType = e.dataTransfer.getData('text/plain');
                console.log("Question type on main area:", questionType);
                if (questionType && questionType.startsWith('question-type-')) {
                  const type = questionType.replace('question-type-', '');
                  console.log("Adding type to main area:", type);
                  onAddQuestion(type);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
            >
              {mainQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                  <div className="text-gray-400 mb-4">
                    <SquarePlus className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    سوال اول را اضافه کنید
                  </h3>
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
