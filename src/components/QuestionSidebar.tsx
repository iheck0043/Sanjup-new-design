import React from "react";
import { ReactSortable } from "react-sortablejs";
import {
  SquareCheck,
  BarChart3,
  SquarePlus,
  FileText,
  Type,
  Hash,
  Grid3X3,
  ArrowUpDown,
  Image,
  ChevronDown,
  Star,
  Mail,
  Sparkles,
  GripVertical,
} from "lucide-react";

interface QuestionTypeItem {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  chosen?: boolean;
}

interface QuestionSidebarProps {
  onAddQuestion: (type: string, insertIndex?: number) => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({ onAddQuestion }) => {
  const questionTypes: QuestionTypeItem[] = [
    {
      id: "text_question_short",
      type: "text_question_short",
      label: "متنی با پاسخ کوتاه",
      icon: <Type className="w-4 h-4 text-purple-600" />,
      color:
        "bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-200",
    },
    {
      id: "text_question_long",
      type: "text_question_long",
      label: "متنی با پاسخ بلند",
      icon: <Type className="w-4 h-4 text-purple-600" />,
      color:
        "bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-200",
    },
    {
      id: "single_select",
      type: "single_select",
      label: "چندگزینه‌ای",
      icon: <SquareCheck className="w-4 h-4 text-blue-600" />,
      color:
        "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200",
    },
    {
      id: "range_slider",
      type: "range_slider",
      label: "طیفی",
      icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      color:
        "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200",
    },
    {
      id: "question_group",
      type: "question_group",
      label: "گروه سوال",
      icon: <SquarePlus className="w-4 h-4 text-green-600" />,
      color:
        "bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-200",
    },
    {
      id: "statement",
      type: "statement",
      label: "متن بدون پاسخ",
      icon: <FileText className="w-4 h-4 text-gray-600" />,
      color:
        "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200",
    },
    {
      id: "number_descriptive",
      type: "number_descriptive",
      label: "عددی",
      icon: <Hash className="w-4 h-4 text-orange-600" />,
      color:
        "bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-200",
    },
    {
      id: "matrix",
      type: "matrix",
      label: "ماتریسی",
      icon: <Grid3X3 className="w-4 h-4 text-cyan-600" />,
      color:
        "bg-cyan-50 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200",
    },
    {
      id: "prioritize",
      type: "prioritize",
      label: "اولویت‌دهی",
      icon: <ArrowUpDown className="w-4 h-4 text-pink-600" />,
      color:
        "bg-pink-50 border-pink-100 hover:bg-pink-100 hover:border-pink-200",
    },
    {
      id: "select_multi_image",
      type: "select_multi_image",
      label: "چند‌گزینه‌ای تصویری",
      icon: <Image className="w-4 h-4 text-yellow-600" />,
      color:
        "bg-yellow-50 border-yellow-100 hover:bg-yellow-100 hover:border-yellow-200",
    },
    {
      id: "combobox",
      type: "combobox",
      label: "لیست کشویی",
      icon: <ChevronDown className="w-4 h-4 text-teal-600" />,
      color:
        "bg-teal-50 border-teal-100 hover:bg-teal-100 hover:border-teal-200",
    },
    {
      id: "grading",
      type: "grading",
      label: "درجه‌بندی",
      icon: <Star className="w-4 h-4 text-amber-600" />,
      color:
        "bg-amber-50 border-amber-100 hover:bg-amber-100 hover:border-amber-200",
    },
    {
      id: "text_question_email",
      type: "text_question_email",
      label: "ایمیل",
      icon: <Mail className="w-4 h-4 text-red-600" />,
      color: "bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200",
    },
  ];

  const [items, setItems] = React.useState<QuestionTypeItem[]>(questionTypes);

  const QuestionTypeCard: React.FC<{ item: QuestionTypeItem }> = ({ item }) => {
    // Create dark mode versions of colors
    const getDarkModeColors = (lightColors: string) => {
      if (lightColors.includes("purple"))
        return "dark:bg-purple-900/20 dark:border-purple-700 dark:hover:bg-purple-800/30 dark:hover:border-purple-600";
      if (lightColors.includes("blue"))
        return "dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-800/30 dark:hover:border-blue-600";
      if (lightColors.includes("indigo"))
        return "dark:bg-indigo-900/20 dark:border-indigo-700 dark:hover:bg-indigo-800/30 dark:hover:border-indigo-600";
      if (lightColors.includes("green"))
        return "dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-800/30 dark:hover:border-green-600";
      if (lightColors.includes("gray"))
        return "dark:bg-gray-800/50 dark:border-gray-600 dark:hover:bg-gray-700/70 dark:hover:border-gray-500";
      if (lightColors.includes("orange"))
        return "dark:bg-orange-900/20 dark:border-orange-700 dark:hover:bg-orange-800/30 dark:hover:border-orange-600";
      if (lightColors.includes("cyan"))
        return "dark:bg-cyan-900/20 dark:border-cyan-700 dark:hover:bg-cyan-800/30 dark:hover:border-cyan-600";
      if (lightColors.includes("pink"))
        return "dark:bg-pink-900/20 dark:border-pink-700 dark:hover:bg-pink-800/30 dark:hover:border-pink-600";
      if (lightColors.includes("yellow"))
        return "dark:bg-yellow-900/20 dark:border-yellow-700 dark:hover:bg-yellow-800/30 dark:hover:border-yellow-600";
      if (lightColors.includes("teal"))
        return "dark:bg-teal-900/20 dark:border-teal-700 dark:hover:bg-teal-800/30 dark:hover:border-teal-600";
      if (lightColors.includes("amber"))
        return "dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-800/30 dark:hover:border-amber-600";
      if (lightColors.includes("red"))
        return "dark:bg-red-900/20 dark:border-red-700 dark:hover:bg-red-800/30 dark:hover:border-red-600";
      return "dark:bg-gray-800/50 dark:border-gray-600 dark:hover:bg-gray-700/70 dark:hover:border-gray-500";
    };

    return (
      <div
        className={`flex items-center p-2.5 rounded-lg border cursor-move hover:shadow-sm hover:scale-[1.02] transition-all ${
          item.color
        } ${getDarkModeColors(item.color)} ${item.chosen ? "opacity-50" : ""}`}
        onClick={() => !item.chosen && onAddQuestion(item.type)}
      >
        <div className="flex items-center gap-2 w-full">
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex-shrink-0">{item.icon}</div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {item.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l border-gray-200/70 dark:border-gray-600/70 h-[calc(100vh-80px)] fixed top-16 right-0 flex flex-col">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-600/50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            انواع سوالات
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          سوال مورد نظر را بکشید به فرم
        </p>
      </div>

      <div className="flex-1 p-4">
        <ReactSortable
          list={items}
          setList={setItems}
          group={{
            name: "shared",
            pull: "clone", // Enable cloning from sidebar
            put: false, // Don't allow items to be dropped in sidebar
          }}
          clone={(item) => ({
            ...item,
            chosen: true,
          })}
          sort={false} // Disable sorting in sidebar
          className="flex flex-wrap gap-2"
          onClone={(evt) => {
            // اضافه کردن attribute به clone شده element
            console.log("🔄 Cloning item:", evt);
            const clonedElement = evt.clone;
            const originalElement = evt.item;
            const questionType =
              originalElement.getAttribute("data-question-type");

            console.log("🔍 Clone details:", {
              hasClone: !!clonedElement,
              hasOriginal: !!originalElement,
              originalQuestionType: questionType,
              originalElement: originalElement,
              clonedElement: clonedElement,
            });

            if (questionType && clonedElement) {
              clonedElement.setAttribute("data-question-type", questionType);

              // تأیید اینکه attribute اضافه شده
              const verifyAttribute =
                clonedElement.getAttribute("data-question-type");
              console.log(
                "✅ Added data-question-type to clone:",
                questionType,
                "Verification:",
                verifyAttribute
              );
            } else {
              console.error("❌ Failed to copy attribute:", {
                questionType,
                hasClone: !!clonedElement,
                hasOriginal: !!originalElement,
              });
            }
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[calc(50%-4px)]"
              data-question-type={item.type}
            >
              <QuestionTypeCard item={item} />
            </div>
          ))}
        </ReactSortable>
      </div>
    </div>
  );
};

export default QuestionSidebar;
