
import React, { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
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

// استفاده از انترفیس Question از Index.tsx
import { Question } from "../pages/Index";

interface FormBuilderProps {
  questions: Question[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: Question) => void;
  onAddQuestion: (type: string, insertIndex?: number) => void;
  onDuplicateQuestion: (question: Question) => void;
  onConditionClick: (question: Question) => void;
  onMoveToGroup: (questionId: string, groupId: string) => void;
  expandedGroups: string[];
  onToggleGroup: (groupId: string) => void;
  renderQuestionTitle: (question: Question) => React.ReactNode;
}

const getQuestionTypeIcon = (type: string, question: Question) => {
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
    case "text_question_short":
    case "text_question_long":
    case "text_question_email":
      return <Type className="w-3 h-3 text-purple-600" />;
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
    case "text_question_short":
    case "text_question_long":
    case "text_question_email":
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
  const handleRemoveFromGroup = (questionId: string) => {
    onUpdateQuestion(questionId, { related_group: null });
  };

  const handleMoveToGroup = (questionId: string, groupId: string) => {
    onUpdateQuestion(questionId, { related_group: groupId });
    onMoveToGroup(questionId, groupId);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // Same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Dragging from question types sidebar to main form
    if (source.droppableId === 'questionTypes' && destination.droppableId === 'formQuestions') {
      // Adding new question from sidebar
      onAddQuestion(draggableId, destination.index);
      return;
    }

    // Dragging from question types sidebar to a group
    if (source.droppableId === 'questionTypes' && destination.droppableId.startsWith('group-')) {
      // Create question and add to group
      const groupId = destination.droppableId.replace('group-', '');
      onAddQuestion(draggableId);
      // Wait for question to be created then move it to group
      setTimeout(() => {
        const newQuestion = questions[questions.length - 1];
        if (newQuestion) {
          handleMoveToGroup(newQuestion.id, groupId);
        }
      }, 0);
      return;
    }

    const questionId = draggableId.replace('_child', '').replace(/_\d+$/, '');

    // Moving from main list to group
    if (source.droppableId === 'formQuestions' && destination.droppableId.startsWith('group-')) {
      const groupId = destination.droppableId.replace('group-', '');
      handleMoveToGroup(questionId, groupId);
      return;
    }

    // Moving from group to main list
    if (source.droppableId.startsWith('group-') && destination.droppableId === 'formQuestions') {
      handleRemoveFromGroup(questionId);
      return;
    }

    // Moving within same group or main list
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'formQuestions') {
        // Moving within main questions
        onMoveQuestion(source.index, destination.index);
      }
      return;
    }

    // Moving between different groups
    if (source.droppableId.startsWith('group-') && destination.droppableId.startsWith('group-')) {
      const newGroupId = destination.droppableId.replace('group-', '');
      handleMoveToGroup(questionId, newGroupId);
      return;
    }
  };

  // Get main questions (not children of any group)
  const mainQuestions = questions.filter(q => !q.related_group);

  const renderChildQuestions = (groupId: string) => {
    const childQuestions = questions.filter(q => q.related_group === groupId);
    
    return (
      <Droppable droppableId={`group-${groupId}`} type="CHILD_QUESTION">
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "mt-2 space-y-2 min-h-[60px]",
              snapshot.isDraggingOver && "bg-blue-50 rounded-lg p-2"
            )}
          >
            {childQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <SquarePlus className="w-6 h-6 text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm text-center">
                  سوالات را به اینجا بکشید
                </p>
              </div>
            ) : (
              childQuestions.map((question, index) => (
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
                        "relative group pr-4 border-r-2 border-blue-200",
                        snapshot.isDragging && "z-50"
                      )}
                    >
                      <div
                        className={cn(
                          "bg-blue-50/50 rounded-lg border border-blue-200/70 shadow-sm",
                          snapshot.isDragging && "shadow-lg scale-[1.02] rotate-1",
                          "hover:shadow-md hover:border-blue-300/50"
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
                                <span className={cn(
                                  "flex items-center justify-center w-5 h-5 rounded-full text-xs text-blue-600 font-medium",
                                  "bg-blue-100"
                                )}>
                                  {getQuestionTypeIcon(question.type, question)}
                                </span>
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[10px] text-blue-600 font-medium">
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
                                className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                onClick={() => handleRemoveFromGroup(question.id)}
                                title="خارج کردن از گروه"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                                onClick={() => onRemoveQuestion(question.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  const renderQuestion = (question: Question, index: number) => {
    const isGroup = question.type === "question_group";
    const isExpanded = expandedGroups.includes(question.id);

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
              <div className="mt-2 pr-4 border-r-2 border-gray-200">
                {renderChildQuestions(question.id)}
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="formQuestions" type="QUESTION_TYPE">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 min-h-[200px] ${
                  snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg" : ""
                }`}
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
        </DragDropContext>
      </div>
    </div>
  );
};

export default FormBuilder;
