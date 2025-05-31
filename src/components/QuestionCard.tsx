
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Text, SquareCheck, ListCheck, Hash, Mail, Link, ArrowUp, ArrowDown, SquarePlus, BarChart3, CreditCard, Flag, Copy, GitBranch, Star } from 'lucide-react';
import { Question } from '../pages/Index';

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
    accept: ['question-card', 'question'],
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
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
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
    type: 'question-card',
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
      'متنی با پاسخ کوتاه': <Text className="w-4 h-4 text-blue-600" />,
      'متنی با پاسخ بلند': <Text className="w-4 h-4 text-purple-600" />,
      'گروه سوال': <SquarePlus className="w-4 h-4 text-green-600" />,
      'چندگزینه‌ای': <SquareCheck className="w-4 h-4 text-pink-600" />,
      'چندگزینه‌ای تصویری': <SquareCheck className="w-4 h-4 text-yellow-600" />,
      'لیست کشویی': <ListCheck className="w-4 h-4 text-teal-600" />,
      'طیفی': <BarChart3 className="w-4 h-4 text-indigo-600" />,
      'درجه‌بندی': <Star className="w-4 h-4 text-yellow-500" />,
      'درخت‌بندی': <ArrowDown className="w-4 h-4 text-orange-600" />,
      'اولویت‌دهی': <ArrowUp className="w-4 h-4 text-red-600" />,
      'لینک/وب‌سایت': <Link className="w-4 h-4 text-cyan-600" />,
      'متن بدون پاسخ': <Text className="w-4 h-4 text-gray-600" />,
      'درگاه پرداخت': <CreditCard className="w-4 h-4 text-emerald-600" />,
      'عدد': <Hash className="w-4 h-4 text-blue-600" />,
      'ایمیل': <Mail className="w-4 h-4 text-red-600" />,
      'صفحه پایان': <Flag className="w-4 h-4 text-gray-600" />,
      'ماتریسی': <SquareCheck className="w-4 h-4 text-purple-600" />,
    };
    return iconMap[type as keyof typeof iconMap] || <Text className="w-4 h-4 text-gray-600" />;
  };

  const getQuestionNumber = () => {
    if (isChild) {
      return `${index + 1}.1`;
    }
    return `${index + 1}`;
  };

  const getQuestionNumberBg = () => {
    if (isChild) {
      return 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700';
    }
    return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700';
  };

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`group bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-lg transition-all duration-300 hover:shadow-lg hover:border-gray-300/60 cursor-pointer hover:-translate-y-0.5 ${
        isDragging ? 'opacity-50 rotate-1 scale-105' : ''
      } ${isChild ? 'bg-blue-50/40 border-blue-200/40' : ''}`}
      onClick={() => onClick(question)}
    >
      <div className="flex items-center p-3.5 gap-3">
        <div 
          ref={dragRef}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-110"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>

        <div className="flex-shrink-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm ${getQuestionNumberBg()}`}>
            {getQuestionNumber()}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="p-1.5 bg-white/80 rounded-lg shadow-sm">
            {getQuestionIcon(question.type)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-800 font-semibold truncate">
            {question.label}
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
            isChild 
              ? 'text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100' 
              : 'text-gray-600 bg-gradient-to-r from-gray-100 to-gray-150'
          }`}>
            {question.type}
          </span>
        </div>

        <div 
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConditionClick(question)}
            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 p-0 rounded-lg transition-all duration-200 hover:scale-110"
            title="شرط‌گذاری"
          >
            <GitBranch className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(question)}
            className="text-gray-400 hover:text-green-600 hover:bg-green-50 w-8 h-8 p-0 rounded-lg transition-all duration-200 hover:scale-110"
            title="کپی کردن"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 p-0 rounded-lg transition-all duration-200 hover:scale-110"
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
