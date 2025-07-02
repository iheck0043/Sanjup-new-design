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
import { useToast } from "@/components/ui/use-toast";

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
  // Track group that might become empty during drag
  const [groupBecomingEmpty, setGroupBecomingEmpty] = useState<string | null>(
    null
  );
  // Track question being dragged from group
  const [questionBeingDragged, setQuestionBeingDragged] = useState<
    string | null
  >(null);

  // Toast for showing error messages
  const { toast } = useToast();

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
          // Filter out question being dragged if it's the last one in group
          .filter((q) => {
            if (questionBeingDragged === q.id.toString()) {
              // Check if this is the only question in the group
              const groupQuestions = questions.filter((gq) => {
                const relatedGroupNumber =
                  typeof gq.related_group === "string"
                    ? parseInt(gq.related_group.toString())
                    : gq.related_group;
                return relatedGroupNumber === groupIdNumber;
              });

              if (groupQuestions.length === 1) {
                console.log(
                  `🚫 Hiding dragged question ${q.id} from group ${question.id}`
                );
                return false; // Hide this question from children
              }
            }
            return true;
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
  }, [questions, questionBeingDragged]);

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
      <div
        className="relative group pb-12"
        style={{ userSelect: "none" }}
        data-question-id={item.data.id}
        data-group-id={item.data.id}
      >
        {/* Group Header */}
        <div className="h-[50px] border rounded-lg p-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-shrink-0">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {index + 1}
                </div>
              </div>
              <div className="flex-shrink-0">
                {getQuestionTypeIcon(item.data.type, item.data)}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {renderQuestionTitle(item.data)}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
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

        {/* Group Children - Always show drop zone */}
        <div className="mr-8 mt-2 relative">
          {/* خط آبی برای گروه خالی یا گروهی که در حال خالی شدن است */}
          {(!item.children ||
            item.children.length === 0 ||
            groupBecomingEmpty === item.data.id.toString()) && (
            <div
              className="absolute -right-2 w-1 bg-blue-300"
              style={{
                top: "-6px",
                height: "calc(100% + 12px)",
              }}
            />
          )}
          <ReactSortable
            list={item.children || []}
            setList={(newList) => {
              console.log(
                "🔄 Children setList called for group",
                item.id,
                newList.length
              );

              // بررسی تغییر در محتوای گروه (تعداد یا آیتم‌ها)
              const currentIds = (item.children || [])
                .map((child) => child.id)
                .sort();
              const newIds = newList.map((newItem) => newItem.id).sort();
              const hasChanged =
                newList.length !== (item.children?.length || 0) ||
                JSON.stringify(currentIds) !== JSON.stringify(newIds);

              if (hasChanged) {
                console.log("📋 Group children changed, updating questions");
                console.log("📋 Current IDs:", currentIds);
                console.log("📋 New IDs:", newIds);

                // تبدیل newList به questions array و به‌روزرسانی API
                const updatedQuestions = questions.map((q) => {
                  // پیدا کردن سوالی که در این لیست جدید هست
                  const foundInNewList = newList.find(
                    (newItem) => newItem.id === q.id.toString()
                  );

                  if (foundInNewList) {
                    // این سوال باید در این گروه باشد
                    console.log(
                      `🔄 Setting related_group of question ${q.id} to group ${item.data.id}`
                    );
                    return { ...q, related_group: item.data.id };
                  } else if (
                    q.related_group?.toString() === item.data.id.toString()
                  ) {
                    // این سوال قبلاً در این گروه بود اما حالا نیست
                    console.log(
                      `🔄 Removing related_group from question ${q.id}`
                    );
                    return { ...q, related_group: null };
                  }

                  return q;
                });

                // Optimistic update
                onUpdateQuestion("reorder", {
                  questions: updatedQuestions,
                } as any);
              }
            }}
            group={{
              name: "shared", // Same group name as main container
              put: (to, from, dragEl) => {
                // بررسی اینکه آیا آیتم درحال drop یک گروه است
                const questionType = dragEl.getAttribute("data-question-type");
                if (questionType === "question_group") {
                  console.log(
                    "❌ Cannot drop question group inside another group"
                  );
                  toast({
                    title: "خطا",
                    description:
                      "گروه سوال نمی‌تواند داخل گروه سوال دیگری قرار بگیرد",
                    variant: "destructive",
                  });
                  return false; // منع drop
                }
                return true; // اجازه drop
              },
              pull: true, // Allow items to be pulled out of this group
            }}
            className={`relative ${
              !item.children || item.children.length === 0
                ? "min-h-[50px]"
                : "space-y-2"
            }`}
            animation={200}
            ghostClass="opacity-50"
            chosenClass="bg-blue-50"
            dragClass="rotate-1"
            fallbackOnBody={false}
            swapThreshold={0.5}
            emptyInsertThreshold={50}
            forceFallback={false}
            sort={item.children && item.children.length > 0}
            onMove={(evt) => {
              console.log("🔄 Child move event:", evt);

              // بررسی اینکه آیا آیتم درحال جابجایی یک گروه موجود است
              const draggedElement = evt.dragged;
              const isGroupBeingDragged =
                draggedElement?.hasAttribute("data-group-id");

              if (isGroupBeingDragged) {
                console.log("❌ Group cannot be nested inside another group");
                toast({
                  title: "خطا",
                  description:
                    "گروه سوال نمی‌تواند داخل گروه سوال دیگری قرار بگیرد",
                  variant: "destructive",
                });
                return false; // منع جابجایی
              }

              return true; // اجازه جابجایی
            }}
            onAdd={(evt) => {
              console.log("➕ Child added to group", item.id, evt);

              const draggedElement = evt.clone || evt.item;
              const isFromSidebar =
                draggedElement.hasAttribute("data-question-type");
              const questionType =
                draggedElement.getAttribute("data-question-type");

              if (isFromSidebar && questionType) {
                // سوال جدید از sidebar
                console.log(
                  "📋 New question from sidebar to group:",
                  questionType
                );

                // Store current questions count to identify the new question
                const currentQuestionsCount = questionsRef.current.length;

                onAddQuestion(questionType, evt.newIndex, item.id);

                setTimeout(() => {
                  const currentQuestions = questionsRef.current;

                  // پیدا کردن سوال جدید بر اساس تعداد سوالات و نوع سوال
                  const newQuestion = currentQuestions.find((q, index) => {
                    // سوال جدید باید:
                    // 1. در گروه مناسب باشد
                    // 2. نوع مناسب داشته باشد
                    // 3. آخرین سوال اضافه شده باشد (بیشترین ID یا آخرین index)
                    const belongsToGroup =
                      q.related_group?.toString() === item.id.toString();
                    const hasCorrectType = q.type === questionType;

                    return (
                      belongsToGroup &&
                      hasCorrectType &&
                      index >= currentQuestionsCount
                    );
                  });

                  // اگر روش بالا کار نکرد، آخرین سوال اضافه شده را پیدا کن
                  const fallbackQuestion =
                    currentQuestions.length > currentQuestionsCount
                      ? currentQuestions[currentQuestions.length - 1]
                      : null;

                  const questionToOpen = newQuestion || fallbackQuestion;

                  if (questionToOpen) {
                    console.log(
                      "🔧 Opening modal for new question:",
                      questionToOpen.id,
                      "type:",
                      questionToOpen.type
                    );
                    onQuestionClick(questionToOpen);
                  } else {
                    console.error(
                      "❌ Could not find new question to open modal for"
                    );
                  }
                }, 300);
              } else {
                // انتقال سوال موجود به این گروه
                const existingElement = evt.item;
                let questionId =
                  existingElement.getAttribute("data-question-id");

                if (!questionId) {
                  questionId = existingElement
                    .querySelector("[data-question-id]")
                    ?.getAttribute("data-question-id");
                }

                if (questionId) {
                  console.log(
                    `Moving existing question ${questionId} to group ${item.id}`
                  );

                  // ✨ Optimistic update - فوری سوال را به این گروه منتقل می‌کنیم
                  const updatedQuestions = questions.map((q) =>
                    q.id.toString() === questionId.toString()
                      ? { ...q, related_group: item.data.id }
                      : q
                  );

                  console.log(
                    `🚀 Optimistic update: Question ${questionId} moved to group ${item.data.id}`
                  );

                  onUpdateQuestion("reorder", {
                    questions: updatedQuestions,
                  } as any);

                  // کمی تأخیر تا UI به‌روزرسانی شود
                  setTimeout(async () => {
                    // اول API call برای انتقال به گروه
                    onMoveToGroup(questionId, item.data.id.toString());

                    // سپس reorder کل سوالات
                    const reorderData = updatedQuestions.map(
                      (question, index) => ({
                        id: parseInt(question.id.toString()),
                        order: index + 1,
                      })
                    );

                    console.log(
                      "🚀 Sending reorder API call after group move:",
                      reorderData
                    );

                    try {
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
                        console.log("✅ Reorder after group move successful");
                      } else {
                        console.error("❌ Reorder after group move failed");
                      }
                    } catch (error) {
                      console.error(
                        "❌ Error in reorder after group move:",
                        error
                      );
                    }
                  }, 50);
                }
              }
            }}
            onRemove={(evt) => {
              console.log("➖ Child removed from group", item.id, evt);
              // فقط لاگ می‌کنیم - optimistic update در onAdd گروه مقصد انجام می‌شود
            }}
            onStart={(evt) => {
              console.log("🚀 Child drag started");

              // Check if this is the last question in the group
              const draggedElement = evt.item;
              const questionId =
                draggedElement.getAttribute("data-question-id");

              if (questionId && item.children && item.children.length === 1) {
                // This is the only child in the group
                console.log(`⚠️ Group ${item.data.id} will become empty!`);
                setGroupBecomingEmpty(item.data.id.toString());
                setQuestionBeingDragged(questionId);
              }
            }}
            onEnd={(evt) => {
              console.log("🎯 Child drag ended", evt);
              setGroupBecomingEmpty(null); // Reset state
              setQuestionBeingDragged(null); // Reset dragged question state

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
            {item.children && item.children.length > 0
              ? item.children.map((child, childIndex) => (
                  <QuestionCard
                    key={child.id}
                    item={child}
                    index={childIndex}
                    isChild={true}
                  />
                ))
              : // برای گروه خالی، هیچ محتوایی نداریم - فقط drop zone
                []}
          </ReactSortable>
        </div>
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
        className={`relative group mb-3 ${isChild ? "ml-3" : ""}`}
        style={{ userSelect: "none" }}
        data-question-id={item.data.id}
      >
        {/* Blue line for group children */}
        {isChild && (
          <div
            className="absolute -right-2 w-1 bg-blue-300"
            style={{
              top: "-6px",
              bottom: "10px",
              height: "calc(100% + 12px)",
            }}
          />
        )}

        {/* Simple div instead of Card */}
        <div className="h-[50px] border rounded-lg p-2 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-shrink-0">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {isChild ? `${index + 1}.1` : `${index + 1}`}
                </div>
              </div>
              <div className="flex-shrink-0">
                {getQuestionTypeIcon(item.data.type, item.data)}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
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
    <div className="p-6 2xl:pl-48">
      {questions.length === 0 ? (
        <ReactSortable
          list={[]}
          setList={(newItems: any[]) => {
            newItems.forEach((item) => {
              if (item.type) {
                console.log("📋 New question added from sidebar:", item.type);

                // Store current questions count to identify the new question
                const currentQuestionsCount = questionsRef.current.length;

                // اضافه کردن سوال جدید در index 0 (اولین سوال)
                onAddQuestion(item.type, 0);

                // کمی تأخیر تا سوال اضافه شود، سپس مودال را باز می‌کنیم
                setTimeout(() => {
                  const currentQuestions = questionsRef.current;
                  console.log(
                    "🔍 Current questions length:",
                    currentQuestions.length
                  );
                  console.log(
                    "🔍 Current questions:",
                    currentQuestions.map((q) => q.id)
                  );

                  // پیدا کردن سوال جدید بر اساس نوع سوال
                  const newQuestion = currentQuestions.find((q, index) => {
                    // سوال جدید باید:
                    // 1. نوع مناسب داشته باشد
                    // 2. آخرین سوال اضافه شده باشد
                    const hasCorrectType = q.type === item.type;

                    return hasCorrectType && index >= currentQuestionsCount;
                  });

                  // اگر روش بالا کار نکرد، آخرین سوال اضافه شده را پیدا کن
                  const fallbackQuestion =
                    currentQuestions.length > currentQuestionsCount
                      ? currentQuestions[currentQuestions.length - 1]
                      : null;

                  const questionToOpen = newQuestion || fallbackQuestion;

                  if (questionToOpen) {
                    console.log(
                      "🔧 Opening modal for new question:",
                      questionToOpen.id,
                      "type:",
                      questionToOpen.type
                    );
                    onQuestionClick(questionToOpen);
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
          className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg transition-all duration-200 border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-100/50 dark:hover:bg-blue-900/20"
        >
          <div className="mb-2 text-gray-400 dark:text-gray-500">
            <MoveRight className="w-8 h-8" />
          </div>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
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
          className="space-y-3"
          animation={200}
          ghostClass="opacity-50"
          chosenClass="shadow-lg"
          dragClass="rotate-2"
          fallbackOnBody={false}
          swapThreshold={0.5}
          emptyInsertThreshold={50}
          forceFallback={false}
          sort={true}
          onStart={(evt) => {
            console.log("🚀 Drag started");
            setIsDragging(true);

            // Check if this is the last question in a group
            const draggedElement = evt.item;
            const questionId = draggedElement.getAttribute("data-question-id");

            if (questionId) {
              const question = questions.find(
                (q) => q.id.toString() === questionId
              );
              if (question && question.related_group) {
                // Count how many questions are in this group
                const groupId = question.related_group.toString();
                const groupQuestions = questions.filter(
                  (q) => q.related_group?.toString() === groupId
                );

                console.log(
                  `🔍 Group ${groupId} has ${groupQuestions.length} questions`
                );

                // If this is the only question in the group, mark group as becoming empty
                if (groupQuestions.length === 1) {
                  console.log(`⚠️ Group ${groupId} will become empty!`);
                  setGroupBecomingEmpty(groupId);
                  setQuestionBeingDragged(questionId);
                }
              }
            }
          }}
          onEnd={(evt) => {
            console.log("🎯 Drag ended", evt);
            setIsDragging(false);
            setGroupBecomingEmpty(null); // Reset group becoming empty state
            setQuestionBeingDragged(null); // Reset dragged question state

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

              // Snapshot IDs **before** adding to identify the incoming question precisely
              const previousIds = new Set(
                questionsRef.current.map((q) => q.id.toString())
              );

              // اضافه کردن سوال جدید با index مناسب
              onAddQuestion(questionType, evt.newIndex);

              // کمی تأخیر تا سوال اضافه شود، سپس مودال را باز می‌کنیم
              setTimeout(() => {
                const currentQuestions = questionsRef.current;

                // ⏱️ Find the newly added question by id difference
                const newlyInserted = currentQuestions.find((q) => {
                  const idStr = q.id.toString();
                  const isNew = !previousIds.has(idStr);
                  const isTopLevel = !q.related_group;
                  const hasCorrectType = q.type === questionType;
                  return isNew && isTopLevel && hasCorrectType;
                });

                // Fallback – if difference detection failed, try last element
                const fallbackQuestion =
                  currentQuestions[currentQuestions.length - 1];

                const questionToOpen = newlyInserted || fallbackQuestion;

                if (questionToOpen) {
                  console.log(
                    "🔧 Main - Opening modal for new question:",
                    questionToOpen.id,
                    "type:",
                    questionToOpen.type
                  );
                  onQuestionClick(questionToOpen);
                } else {
                  console.error(
                    "❌ Main - Could not find new question to open modal for"
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
                setTimeout(async () => {
                  // اول API call برای انتقال به top-level
                  onMoveToGroup(questionId, "");

                  // سپس reorder کل سوالات
                  const reorderData = updatedQuestions.map(
                    (question, index) => ({
                      id: parseInt(question.id.toString()),
                      order: index + 1,
                    })
                  );

                  console.log(
                    "🚀 Sending reorder API call after top-level move:",
                    reorderData
                  );

                  try {
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
                      console.log("✅ Reorder after top-level move successful");
                    } else {
                      console.error("❌ Reorder after top-level move failed");
                    }
                  } catch (error) {
                    console.error(
                      "❌ Error in reorder after top-level move:",
                      error
                    );
                  }
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
