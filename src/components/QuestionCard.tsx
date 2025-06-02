import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  GripVertical,
  Text,
  SquareCheck,
  ListCheck,
  Hash,
  Mail,
  Link,
  ArrowUp,
  ArrowDown,
  SquarePlus,
  BarChart3,
  CreditCard,
  Flag,
  Copy,
  GitBranch,
  Star,
} from "lucide-react";
import { Question } from "../pages/Index";

interface QuestionCardProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onClick: (question: Question) => void;
  onAddQuestion: (type: string, insertIndex: number) => void;
  onDuplicate: (question: Question) => void;
  onConditionClick: (question: Question) => void;
  isChild?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onRemove,
  onMove,
  onClick,
  onAddQuestion,
  onDuplicate,
  onConditionClick,
  isChild = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ["question-card", "question"],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop(item: { type?: string; index?: number }, monitor) {
      if (!ref.current) return;

      if (item.type && item.index === undefined) {
        onAddQuestion(item.type, index);
        return;
      }

      if (item.index !== undefined) {
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    hover(item: { index?: number }, monitor) {
      if (!ref.current || item.index === undefined) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "question-card",
    item: () => ({ id: question.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);
  drop(preview(ref));

  const getQuestionIcon = (type: string) => {
    const iconMap = {
      "متنی با پاسخ کوتاه": <Text className="w-4 h-4 text-blue-600" />,
      "متنی با پاسخ بلند": <Text className="w-4 h-4 text-purple-600" />,
      "گروه سوال": <SquarePlus className="w-4 h-4 text-green-600" />,
      چندگزینه‌ای: <SquareCheck className="w-4 h-4 text-pink-600" />,
      "چندگزینه‌ای تصویری": <SquareCheck className="w-4 h-4 text-yellow-600" />,
      "لیست کشویی": <ListCheck className="w-4 h-4 text-teal-600" />,
      طیفی: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      درجه‌بندی: <Star className="w-4 h-4 text-yellow-500" />,
      درخت‌بندی: <ArrowDown className="w-4 h-4 text-orange-600" />,
      اولویت‌دهی: <ArrowUp className="w-4 h-4 text-red-600" />,
      "لینک/وب‌سایت": <Link className="w-4 h-4 text-cyan-600" />,
      "متن بدون پاسخ": <Text className="w-4 h-4 text-gray-600" />,
      "درگاه پرداخت": <CreditCard className="w-4 h-4 text-emerald-600" />,
      عدد: <Hash className="w-4 h-4 text-blue-600" />,
      ایمیل: <Mail className="w-4 h-4 text-red-600" />,
      "صفحه پایان": <Flag className="w-4 h-4 text-gray-600" />,
      ماتریسی: <SquareCheck className="w-4 h-4 text-purple-600" />,
    };
    return (
      iconMap[type as keyof typeof iconMap] || (
        <Text className="w-4 h-4 text-gray-600" />
      )
    );
  };

  const getQuestionNumber = () => {
    if (isChild) {
      return `${index + 1}.1`;
    }
    return `${index + 1}`;
  };

  const getQuestionNumberBg = () => {
    if (isChild) {
      return "bg-blue-100 text-blue-600";
    }
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`group bg-white/90 backdrop-blur-sm border border-gray-200/70 rounded-lg transition-all duration-300 ease-out transform hover:shadow-lg hover:border-gray-300/70 cursor-pointer ${
        isDragging
          ? "opacity-50 scale-95 rotate-1"
          : "scale-100 hover:scale-[1.02]"
      } ${isChild ? "bg-blue-50/30" : ""}`}
      onClick={() => onClick(question)}
    >
      <div className="flex items-center p-3 gap-3">
        <div
          ref={dragRef}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-110"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-shrink-0 transition-all duration-300 group-hover:scale-110">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${getQuestionNumberBg()}`}
          >
            {getQuestionNumber()}
          </div>
        </div>

        <div className="flex-shrink-0 transition-all duration-300 group-hover:scale-110">
          {getQuestionIcon(question.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-700 font-medium truncate transition-all duration-300 group-hover:text-gray-900">
            {question.label || question.title || "سوال بدون عنوان"}
          </div>
        </div>

        <div className="flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-md font-medium transition-all duration-300 ${
              isChild
                ? "text-blue-600 bg-blue-50 group-hover:bg-blue-100"
                : "text-gray-500 bg-gray-50 group-hover:bg-gray-100"
            }`}
          >
            {question.type}
          </span>
        </div>

        <div
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 transform translate-x-2 group-hover:translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConditionClick(question)}
            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 w-7 h-7 p-0 rounded-md transition-all duration-200 hover:scale-110"
            title="شرط‌گذاری"
          >
            <GitBranch className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(question)}
            className="text-gray-400 hover:text-green-500 hover:bg-green-50 w-7 h-7 p-0 rounded-md transition-all duration-200 hover:scale-110"
            title="کپی کردن"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 p-0 rounded-md transition-all duration-200 hover:scale-110"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
