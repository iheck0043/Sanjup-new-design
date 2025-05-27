
import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical } from 'lucide-react';
import { Question } from '../pages/Index';

interface QuestionCardProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onRemove,
  onUpdate,
  onMove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'question-card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'question-card',
    item: () => {
      return { id: question.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getQuestionIcon = (type: string) => {
    const icons = {
      'متنی با پاسخ کوتاه': '📝',
      'متنی با پاسخ بلند': '📄',
      'چندگزینه‌ای': '⚪',
      'چندگزینه‌ای تصویری': '🖼️',
      'لیست کشویی': '📋',
      'عدد': '🔢',
      'ایمیل': '📧',
      'لینک/وب‌سایت': '🔗',
      'طیفی': '📊',
      'گروه سوال': '📁',
      'درخت‌بندی': '🌳',
      'اولویت‌دهی': '⬆️',
      'متن بدون پاسخ': '💬',
      'درگاه پرداخت': '💳',
      'صفحه پایان': '🏁',
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`group bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center p-4 gap-3">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
        </div>

        {/* Question Icon */}
        <div className="flex-shrink-0 text-lg">
          {getQuestionIcon(question.type)}
        </div>

        {/* Question Text */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={question.label}
              onChange={(e) => onUpdate(question.id, { label: e.target.value })}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="border-none shadow-none p-0 text-sm bg-transparent focus:bg-white focus:shadow-sm focus:border focus:border-blue-200 focus:p-2 rounded transition-all"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-right w-full text-sm text-gray-700 hover:text-gray-900 transition-colors truncate"
            >
              {question.label}
            </button>
          )}
        </div>

        {/* Question Type Badge */}
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md font-medium">
            {question.type}
          </span>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 p-0 rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
