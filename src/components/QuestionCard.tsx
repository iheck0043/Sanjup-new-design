
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
    <div className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 hover:shadow-md">
      <div className="flex items-center p-4 gap-4">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {index + 1}
          </span>
        </div>

        {/* Question Icon */}
        <div className="flex-shrink-0 text-xl">
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
              className="border-none shadow-none p-0 text-base font-medium bg-transparent focus:bg-white focus:shadow-md focus:border focus:p-2 rounded-lg transition-all"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-right w-full text-base font-medium text-gray-800 hover:text-blue-600 transition-colors truncate"
            >
              {question.label}
            </button>
          )}
        </div>

        {/* Question Type Badge */}
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {question.type}
          </span>
        </div>

        {/* Required Toggle */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">الزامی</span>
          </label>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
