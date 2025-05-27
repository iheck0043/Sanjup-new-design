
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical } from 'lucide-react';
import { Question } from '../pages/Index';

interface QuestionCardProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onRemove,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);

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
    <div className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5">
      <div className="flex items-center p-5 gap-4">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500" />
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
            {index + 1}
          </div>
        </div>

        {/* Question Icon */}
        <div className="flex-shrink-0 text-xl filter drop-shadow-sm">
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
              className="border-none shadow-none p-0 text-base font-medium bg-transparent focus:bg-white/90 focus:shadow-lg focus:border-2 focus:border-blue-200 focus:p-3 rounded-xl transition-all duration-200"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-right w-full text-base font-medium text-gray-700 hover:text-gray-900 transition-colors truncate"
            >
              {question.label}
            </button>
          )}
        </div>

        {/* Question Type Badge */}
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full font-medium border border-gray-100">
            {question.type}
          </span>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-gray-300 hover:text-red-500 hover:bg-red-50 w-9 h-9 p-0 rounded-xl transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
