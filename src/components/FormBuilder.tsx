import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ReactSortable } from "react-sortablejs";
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

interface SortableItem {
  id: string;
  type: "question" | "group";
  data: ApiQuestion;
  children?: SortableItem[];
}

interface FormBuilderProps {
  questions: ApiQuestion[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<ApiQuestion>) => void;
  onMoveQuestion: (activeId: string, overId: string) => void;
  onQuestionClick: (question: ApiQuestion) => void;
  onAddQuestion: (
    type: string,
    insertIndex?: number,
    parentId?: string
  ) => void;
  onDuplicateQuestion: (question: ApiQuestion) => void;
  onConditionClick: (question: ApiQuestion) => void;
  onMoveToGroup: (questionId: string, groupId: string) => void;
  expandedGroups: string[];
  onToggleGroup: (groupId: string) => void;
  renderQuestionTitle: (question: ApiQuestion) => React.ReactNode;
  questionnaireId?: string;
  accessToken?: string;
  fetchQuestions: () => Promise<void>;
}

const getQuestionTypeIcon = (type: string, question: ApiQuestion) => {
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
  questionnaireId,
  accessToken,
  fetchQuestions,
}) => {
  console.log("🏗️ FormBuilder re-rendered with", questions.length, "questions");
  console.log(
    "📋 Questions IDs:",
    questions.map((q) => q.id)
  );

  // Track if we're actually dragging to prevent expand/collapse from triggering reorder
  const [isDragging, setIsDragging] = useState(false);
  // Track if we're already processing a reorder to prevent duplicate API calls
  const [isReordering, setIsReordering] = useState(false);

  // Ref to get latest questions in setTimeout callbacks
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  // Wrap onMoveQuestion to see when it's called (now unused)
  const wrappedOnMoveQuestion = useCallback(
    (activeId: string, overId: string) => {
      console.log("🔥 onMoveQuestion called:", activeId, "->", overId);
      return onMoveQuestion(activeId, overId);
    },
    [onMoveQuestion]
  );
  // Build nested structure directly from questions (no local state)
  const nestedItems = useMemo(() => {
    console.log("🔄 Rebuilding nestedItems from questions:", questions.length);
    console.log(
      "📋 Questions order:",
      questions.map((q) => `${q.id}-${q.type}`)
    );

    const result: SortableItem[] = [];

    questions.forEach((question) => {
      if (question.type === "question_group") {
        // Find children for this group - handle type conversion
        const groupIdNumber =
          typeof question.id === "string"
            ? parseInt(question.id.toString())
            : question.id;
        const children = questions
          .filter((q) => {
            const relatedGroupNumber =
              typeof q.related_group === "string"
                ? parseInt(q.related_group.toString())
                : q.related_group;
            const matches = relatedGroupNumber === groupIdNumber;
            if (matches) {
              console.log(
                `🔍 Question ${q.id} belongs to group ${question.id} (${relatedGroupNumber} === ${groupIdNumber})`
              );
            }
            return matches;
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(
            (child): SortableItem => ({
              id: child.id.toString(),
              type: "question",
              data: child,
            })
          );

        // Add group with its children
        result.push({
          id: question.id.toString(),
          type: "group",
          data: question,
          children: children,
        });

        console.log(`📁 Group ${question.id} has ${children.length} children`);
      } else if (!question.related_group) {
        // Add top-level questions
        result.push({
          id: question.id.toString(),
          type: "question",
          data: question,
        });

        console.log(`❓ Top-level question ${question.id}`);
      }
    });

    console.log(
      "✅ Built nestedItems:",
      result.map((r) => `${r.id}-${r.type}`)
    );
    return result;
  }, [questions]);

  const handleSortUpdate = useCallback(
    (newItems: SortableItem[]) => {
      console.log("🔄 Sort update called with:", newItems.length, "items");
      console.log("🚚 Is dragging:", isDragging);
      console.log("🔄 Is reordering:", isReordering);

      // Only process reorder if we're actually dragging and not already reordering
      if (!isDragging || isReordering) {
        console.log(
          "❌ Not dragging or already reordering, ignoring sort update"
        );
        return;
      }

      // Set reordering flag to prevent duplicate calls
      setIsReordering(true);

      console.log(
        "📦 New order:",
        newItems.map((item) => `${item.id}-${item.type}`)
      );

      // Extract the reordered questions from newItems
      const reorderedQuestions: ApiQuestion[] = [];

      newItems.forEach((item, index) => {
        if (item.type === "group") {
          // Add the group question
          reorderedQuestions.push({
            ...item.data,
            order: index + 1,
          });

          // Add its children right after
          if (item.children) {
            item.children.forEach((child, childIndex) => {
              reorderedQuestions.push({
                ...child.data,
                order: index + 1 + childIndex + 0.1, // Keep children after parent
              });
            });
          }
        } else {
          // Add regular question
          reorderedQuestions.push({
            ...item.data,
            order: index + 1,
          });
        }
      });

      console.log(
        "📋 New questions order:",
        reorderedQuestions.map((q) => `${q.id}-${q.type}`)
      );

      // Update parent component's questions state immediately (optimistic update)
      onUpdateQuestion("reorder", { questions: reorderedQuestions } as any);

      // Then make API call to persist the reorder
      const reorderAllQuestionsAPI = async () => {
        try {
          // Create reorder data for all questions
          const reorderData = reorderedQuestions.map((question, index) => ({
            id: parseInt(question.id.toString()),
            order: index + 1,
          }));

          console.log("🚀 Sending main reorder API call:", reorderData);

          const BASE_URL = import.meta.env.VITE_BASE_URL;
          const response = await fetch(
            `${BASE_URL}/api/v1/questionnaire/${questionnaireId}/questions/reorder/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(reorderData),
            }
          );

          if (response.ok) {
            console.log(
              "✅ Main reorder API call successful - changes persisted"
            );
          } else {
            console.error("❌ Main reorder API call failed");
            const errorText = await response.text();
            console.error("Error details:", errorText);

            // TODO: Rollback local state if needed
            // For now, we keep the optimistic update even if API fails
          }
        } catch (error) {
          console.error("❌ Error in main reorder API call:", error);
        } finally {
          // Reset reordering flag
          setIsReordering(false);
        }
      };

      // Call API with slight delay to ensure UI update happens first
      setTimeout(() => {
        reorderAllQuestionsAPI();
      }, 50);
    },
    [onUpdateQuestion, isDragging, isReordering, questionnaireId, accessToken]
  );

  const handleChildSortUpdate = useCallback(
    (
      groupId: string,
      children: SortableItem[],
      oldIndex: number,
      newIndex: number
    ) => {
      console.log(
        `🔄 Child moved in group ${groupId}: from ${oldIndex} to ${newIndex}`
      );

      // Get current children for this group - handle type conversion
      const groupIdNumber =
        typeof groupId === "string" ? parseInt(groupId) : groupId;
      const currentChildren = questions
        .filter((q) => {
          const relatedGroupNumber =
            typeof q.related_group === "string"
              ? parseInt(q.related_group)
              : q.related_group;
          return relatedGroupNumber === groupIdNumber;
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      console.log(
        `📊 Found ${currentChildren.length} children for group ${groupId}`
      );
      console.log("📊 Requested move:", `${oldIndex} to ${newIndex}`);

      // Check if move is valid
      if (
        oldIndex === newIndex ||
        oldIndex < 0 ||
        newIndex < 0 ||
        oldIndex >= currentChildren.length ||
        newIndex >= currentChildren.length
      ) {
        console.log("❌ Invalid move, ignoring update");
        return;
      }

      console.log("✅ Valid child move, processing update");

      // Create new order array
      const reorderedChildren = [...currentChildren];
      const [movedItem] = reorderedChildren.splice(oldIndex, 1);
      reorderedChildren.splice(newIndex, 0, movedItem);

      console.log(
        "📋 Child questions new order:",
        reorderedChildren.map((q) => `${q.id}-${q.type}`)
      );

      // First, update local state immediately (optimistic update)
      const updatedQuestions = questions.map((q) => {
        const childMatch = reorderedChildren.find(
          (child) => child.id.toString() === q.id.toString()
        );
        if (childMatch) {
          const newIndex = reorderedChildren.indexOf(childMatch);
          return { ...q, order: newIndex + 1 };
        }
        return q;
      });

      // Update local state immediately so UI doesn't jump back
      onUpdateQuestion("reorder", { questions: updatedQuestions } as any);

      // Then make API call to persist changes
      const reorderChildrenAPI = async () => {
        try {
          const reorderData = reorderedChildren.map((child, index) => ({
            id: parseInt(child.id.toString()),
            order: index + 1,
          }));

          console.log("🚀 Sending child reorder API call:", reorderData);

          const BASE_URL = import.meta.env.VITE_BASE_URL;
          const response = await fetch(
            `${BASE_URL}/api/v1/questionnaire/${questionnaireId}/questions/reorder/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(reorderData),
            }
          );

          if (response.ok) {
            console.log(
              "✅ Child reorder API call successful - changes persisted"
            );
          } else {
            console.error("❌ Child reorder API call failed");
            const errorText = await response.text();
            console.error("Error details:", errorText);

            // TODO: Rollback local state if needed
            // For now, we keep the optimistic update even if API fails
          }
        } catch (error) {
          console.error("❌ Error in child reorder API call:", error);
        }
      };

      // Call API
      reorderChildrenAPI();
    },
    [questions, onUpdateQuestion, questionnaireId, accessToken]
  );

  // Group Component with nested children
  const NestedGroup: React.FC<{
    item: SortableItem;
    index: number;
  }> = ({ item, index }) => {
    const isExpanded = expandedGroups.includes(item.data.id.toString());

    return (
      <div className="relative group mb-1" style={{ userSelect: "none" }}>
        {/* Group Header */}
        <div className="h-[50px] border rounded-lg p-2 bg-green-50 border-green-200 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-shrink-0">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600">
                  {index + 1}
                </div>
              </div>
              <div className="flex-shrink-0">
                {getQuestionTypeIcon(item.data.type, item.data)}
              </div>
              <div className="text-sm text-gray-700 truncate">
                {renderQuestionTitle(item.data)}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
                {item.children?.length || 0} سوال
              </div>
            </div>
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ pointerEvents: "auto" }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(
                    "🎯 Toggle group clicked:",
                    item.data.id.toString()
                  );
                  console.log("📋 Current expanded groups:", expandedGroups);
                  console.log("🔍 Is expanded:", isExpanded);
                  onToggleGroup(item.data.id.toString());
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuestionClick(item.data);
                }}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onConditionClick(item.data);
                }}
              >
                <MoveRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateQuestion(item.data);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveQuestion(item.data.id.toString());
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Group Children */}
        {isExpanded && item.children && item.children.length > 0 && (
          <div className="ml-8 mt-2">
            <ReactSortable
              list={item.children || []}
              setList={(newList) => {
                // فقط اگر واقعاً تغییری بوده و در حالت drag نیستیم
                console.log(
                  "🔄 Children setList called for group",
                  item.id,
                  newList.length
                );
              }}
              group={{
                name: "children", // Same group name for all children
                put: true, // Allow items to be put into this group
                pull: true, // Allow items to be pulled out of this group
              }}
              className="space-y-1"
              animation={200}
              ghostClass="opacity-50"
              chosenClass="bg-blue-50"
              dragClass="rotate-1"
              fallbackOnBody={true}
              swapThreshold={0.65}
              onMove={(evt) => {
                console.log("🔄 Child move event:", evt);
                return true; // Allow the move
              }}
              onAdd={(evt) => {
                console.log("➕ Child added to group", item.id, evt);
                // در clone mode باید به evt.clone نگاه کنیم، نه evt.item
                const draggedElement = evt.clone || evt.item;

                // بررسی اینکه آیا از sidebar آمده (سوال جدید) یا انتقال از جای دیگر
                const isFromSidebar =
                  draggedElement.hasAttribute("data-question-type");
                const questionType =
                  draggedElement.getAttribute("data-question-type");

                console.log("🔍 Group - Checking if from sidebar:", {
                  isFromSidebar,
                  questionType,
                  hasAttribute:
                    draggedElement.hasAttribute("data-question-type"),
                  attributeValue:
                    draggedElement.getAttribute("data-question-type"),
                  isClone: !!evt.clone,
                  usingElement: evt.clone ? "clone" : "item",
                  draggedElement: draggedElement,
                  allAttributes: Array.from(
                    draggedElement.attributes || []
                  ).map((attr) => ({
                    name: attr.name,
                    value: attr.value,
                  })),
                });

                if (isFromSidebar && questionType) {
                  console.log(
                    "📋 New question from sidebar to group:",
                    questionType,
                    item.id,
                    "at index:",
                    evt.newIndex
                  );
                  // اضافه کردن سوال جدید در گروه با index مناسب
                  onAddQuestion(questionType, evt.newIndex, item.id);

                  // کمی تأخیر تا سوال اضافه شود، سپس مودال را باز می‌کنیم
                  setTimeout(() => {
                    // پیدا کردن سوال جدید در group
                    const currentQuestions = questionsRef.current;
                    console.log(
                      "🔍 Group - Current questions length:",
                      currentQuestions.length
                    );
                    console.log(
                      "🔍 Group - Current questions:",
                      currentQuestions.map((q) => q.id)
                    );

                    // پیدا کردن سوال جدید در گروه
                    const groupQuestions = currentQuestions.filter(
                      (q) => q.related_group?.toString() === item.id.toString()
                    );
                    const newQuestion = groupQuestions[evt.newIndex];

                    if (newQuestion) {
                      console.log(
                        "🔧 Group - Opening modal for new question:",
                        newQuestion.id,
                        "at group index:",
                        evt.newIndex
                      );

                      // باز کردن مودال
                      console.log("🔧 Group - About to call onQuestionClick");
                      onQuestionClick(newQuestion);
                    } else {
                      console.error(
                        "❌ Group - No questions found at group index:",
                        evt.newIndex
                      );
                    }
                  }, 300);
                } else {
                  // انتقال سوال موجود بین گروه‌ها یا از top-level
                  // برای existing questions، از evt.item استفاده می‌کنیم نه clone
                  const existingElement = evt.item;
                  let questionId =
                    existingElement.getAttribute("data-question-id");
                  if (!questionId) {
                    questionId = existingElement
                      .querySelector("[data-question-id]")
                      ?.getAttribute("data-question-id");
                  }

                  console.log("🔍 Found questionId:", questionId);
                  console.log("🔍 Dragged element:", draggedElement);

                  if (questionId) {
                    console.log(
                      `Moving question ${questionId} to group ${item.id}`
                    );

                    // ✨ Optimistic update - فوری در UI تغییر می‌دهیم
                    const updatedQuestions = questions.map((q) =>
                      q.id.toString() === questionId.toString()
                        ? { ...q, related_group: item.id }
                        : q
                    );

                    console.log(
                      `🚀 Optimistic update: Question ${questionId} moved to group ${item.id}`
                    );
                    console.log(
                      "📋 Updated questions:",
                      updatedQuestions.filter(
                        (q) => q.id.toString() === questionId.toString()
                      )
                    );

                    onUpdateQuestion("reorder", {
                      questions: updatedQuestions,
                    } as any);

                    // کمی تأخیر تا UI به‌روزرسانی شود
                    setTimeout(() => {
                      // سپس API call برای ذخیره در سرور
                      onMoveToGroup(questionId, item.id);
                    }, 50);
                  } else {
                    console.error(
                      "❌ Could not find questionId from dragged element"
                    );
                  }
                }
              }}
              onRemove={(evt) => {
                console.log("➖ Child removed from group", item.id, evt);
                // فقط لاگ می‌کنیم - optimistic update در onAdd گروه مقصد انجام می‌شود
              }}
              onEnd={(evt) => {
                console.log("🎯 Child drag ended", evt);
                // Only handle reordering within the same group
                if (evt.from === evt.to && evt.oldIndex !== evt.newIndex) {
                  handleChildSortUpdate(
                    item.id,
                    item.children,
                    evt.oldIndex,
                    evt.newIndex
                  );
                }
              }}
            >
              {item.children.map((child, childIndex) => (
                <QuestionCard
                  key={child.id}
                  item={child}
                  index={childIndex}
                  isChild={true}
                />
              ))}
            </ReactSortable>
          </div>
        )}
      </div>
    );
  };

  // Question Card Component
  const QuestionCard: React.FC<{
    item: SortableItem;
    index: number;
    isChild?: boolean;
  }> = ({ item, index, isChild = false }) => {
    return (
      <div
        className={`relative group mb-1 ${isChild ? "ml-4" : ""}`}
        style={{ userSelect: "none" }}
        data-question-id={item.data.id}
      >
        {/* Blue line for group children */}
        {isChild && (
          <div
            className="absolute right-4 w-1 bg-blue-200 transition-all duration-200"
            style={{
              top: "-6px",
              bottom: "10px",
              height: "calc(100% + 12px)",
            }}
          />
        )}

        {/* Simple div instead of Card */}
        <div className="h-[50px] border rounded-lg p-2 bg-white hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing border-gray-200">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-shrink-0">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600">
                  {isChild ? `${index + 1}.1` : `${index + 1}`}
                </div>
              </div>
              <div className="flex-shrink-0">
                {getQuestionTypeIcon(item.data.type, item.data)}
              </div>
              <div className="text-sm text-gray-700 truncate">
                {renderQuestionTitle(item.data)}
              </div>
            </div>
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ pointerEvents: "auto" }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuestionClick(item.data);
                }}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onConditionClick(item.data);
                }}
              >
                <MoveRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateQuestion(item.data);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveQuestion(item.data.id.toString());
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Debug: Show nested structure
  // console.log("Nested items count:", nestedItems.length);

  return (
    <div className="p-6">
      {questions.length === 0 ? (
        <ReactSortable
          list={[]}
          setList={(newItems: any[]) => {
            newItems.forEach((item) => {
              if (item.type) {
                console.log("📋 New question added from sidebar:", item.type);
                // اضافه کردن سوال جدید در index 0 (اولین سوال)
                onAddQuestion(item.type, 0);

                // کمی تأخیر تا سوال اضافه شود، سپس مودال را باز می‌کنیم
                setTimeout(() => {
                  // پیدا کردن اولین سوال اضافه شده
                  const currentQuestions = questionsRef.current;
                  console.log(
                    "🔍 Current questions length:",
                    currentQuestions.length
                  );
                  console.log(
                    "🔍 Current questions:",
                    currentQuestions.map((q) => q.id)
                  );

                  const firstQuestion = currentQuestions[0];
                  if (firstQuestion) {
                    console.log(
                      "🔧 Opening modal for new question:",
                      firstQuestion.id,
                      "at index: 0"
                    );
                    console.log("🔧 Question type:", firstQuestion.type);
                    console.log(
                      "🔧 onQuestionClick function:",
                      typeof onQuestionClick
                    );
                    onQuestionClick(firstQuestion);
                  } else {
                    console.error("❌ No questions found to open modal for");
                  }
                }, 300);
              }
            });
          }}
          group={{
            name: "shared",
            put: true,
            pull: false,
          }}
          className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg transition-all duration-200 border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-100/50"
        >
          <div className="mb-2 text-gray-400">
            <MoveRight className="w-8 h-8" />
          </div>
          <p className="text-sm text-center text-gray-500">
            سوالات را از لیست سمت راست به اینجا بکشید
          </p>
        </ReactSortable>
      ) : (
        <ReactSortable
          list={nestedItems}
          setList={(newList) => {
            // فقط لاگ می‌کنیم - reorder را از onEnd انجام می‌دهیم
            console.log("🔄 Main setList called with", newList.length, "items");
          }}
          group={{
            name: "shared",
            put: true,
            pull: true,
          }}
          className="space-y-1"
          animation={200}
          ghostClass="opacity-50"
          chosenClass="shadow-lg"
          dragClass="rotate-2"
          onStart={() => {
            console.log("🚀 Drag started");
            setIsDragging(true);
          }}
          onEnd={(evt) => {
            console.log("🎯 Drag ended", evt);
            setIsDragging(false);

            // فقط اگر reorder در همان container بود و نه انتقال بین گروه‌ها
            if (evt.from === evt.to && evt.oldIndex !== evt.newIndex) {
              console.log(
                "📦 Main reorder detected:",
                evt.oldIndex,
                "->",
                evt.newIndex
              );

              // از nestedItems ترتیب جدید بگیریم
              const newOrder = [...nestedItems];
              const [movedItem] = newOrder.splice(evt.oldIndex, 1);
              newOrder.splice(evt.newIndex, 0, movedItem);

              handleSortUpdate(newOrder);
            }
          }}
          onAdd={(evt) => {
            console.log("➕ Item added to top-level", evt);
            // در clone mode باید به evt.clone نگاه کنیم، نه evt.item
            const draggedElement = evt.clone || evt.item;

            // بررسی اینکه آیا از sidebar آمده (سوال جدید) یا انتقال از گروه
            const isFromSidebar =
              draggedElement.hasAttribute("data-question-type");
            const questionType =
              draggedElement.getAttribute("data-question-type");

            console.log("🔍 Main - Checking if from sidebar:", {
              isFromSidebar,
              questionType,
              hasAttribute: draggedElement.hasAttribute("data-question-type"),
              attributeValue: draggedElement.getAttribute("data-question-type"),
              isClone: !!evt.clone,
              usingElement: evt.clone ? "clone" : "item",
              draggedElement: draggedElement,
              allAttributes: Array.from(draggedElement.attributes || []).map(
                (attr) => ({
                  name: attr.name,
                  value: attr.value,
                })
              ),
            });

            if (isFromSidebar && questionType) {
              console.log("📋 New question from sidebar:", questionType);
              console.log("📋 Drop index:", evt.newIndex);

              // اضافه کردن سوال جدید با index مناسب
              onAddQuestion(questionType, evt.newIndex);

              // کمی تأخیر تا سوال اضافه شود، سپس مودال را باز می‌کنیم
              setTimeout(() => {
                // پیدا کردن سوال جدید در index مناسب
                const currentQuestions = questionsRef.current;
                console.log(
                  "🔍 Main - Current questions length:",
                  currentQuestions.length
                );
                console.log(
                  "🔍 Main - Current questions:",
                  currentQuestions.map((q) => q.id)
                );

                // پیدا کردن سوال در index مناسب
                const newQuestion = currentQuestions[evt.newIndex];
                if (newQuestion) {
                  console.log(
                    "🔧 Main - Opening modal for new question:",
                    newQuestion.id,
                    "at index:",
                    evt.newIndex
                  );
                  console.log("🔧 Main - Question type:", newQuestion.type);
                  onQuestionClick(newQuestion);
                } else {
                  console.error(
                    "❌ Main - No questions found at index:",
                    evt.newIndex
                  );
                }
              }, 300);
            } else {
              // انتقال سوال موجود از گروه به top-level
              // برای existing questions، از evt.item استفاده می‌کنیم نه clone
              const existingElement = evt.item;
              let questionId = existingElement.getAttribute("data-question-id");
              if (!questionId) {
                questionId = existingElement
                  .querySelector("[data-question-id]")
                  ?.getAttribute("data-question-id");
              }

              if (questionId) {
                console.log(`Moving question ${questionId} to top-level`);

                // ✨ Optimistic update - فوری سوال را به top-level منتقل می‌کنیم
                const updatedQuestions = questions.map((q) =>
                  q.id.toString() === questionId.toString()
                    ? { ...q, related_group: null }
                    : q
                );

                console.log(
                  `🚀 Optimistic update: Question ${questionId} moved to top-level`
                );

                onUpdateQuestion("reorder", {
                  questions: updatedQuestions,
                } as any);

                // کمی تأخیر تا UI به‌روزرسانی شود
                setTimeout(() => {
                  // سپس API call برای ذخیره در سرور
                  onMoveToGroup(questionId, "");
                }, 50);
              }
            }
          }}
        >
          {nestedItems.map((item, index) => (
            <div key={item.id}>
              {item.type === "group" ? (
                <NestedGroup item={item} index={index} />
              ) : (
                <QuestionCard item={item} index={index} />
              )}
            </div>
          ))}
        </ReactSortable>
      )}
    </div>
  );
};

export default FormBuilder;
