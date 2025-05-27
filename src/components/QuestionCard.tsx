
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  const getQuestionColor = (type: string) => {
    const colors = {
      'متنی با پاسخ کوتاه': 'bg-blue-50 border-blue-200',
      'متنی با پاسخ بلند': 'bg-purple-50 border-purple-200',
      'چندگزینه‌ای': 'bg-pink-50 border-pink-200',
      'چندگزینه‌ای تصویری': 'bg-yellow-50 border-yellow-200',
      'لیست کشویی': 'bg-teal-50 border-teal-200',
      'عدد': 'bg-red-50 border-red-200',
      'ایمیل': 'bg-red-50 border-red-200',
      'لینک/وب‌سایت': 'bg-cyan-50 border-cyan-200',
      'طیفی': 'bg-indigo-50 border-indigo-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'متنی با پاسخ کوتاه':
        return (
          <Input
            placeholder="پاسخ کوتاه..."
            className="mt-3"
            disabled
          />
        );
      case 'متنی با پاسخ بلند':
        return (
          <Textarea
            placeholder="پاسخ بلند..."
            className="mt-3"
            rows={3}
            disabled
          />
        );
      case 'عدد':
        return (
          <Input
            type="number"
            placeholder="عدد..."
            className="mt-3"
            disabled
          />
        );
      case 'ایمیل':
        return (
          <Input
            type="email"
            placeholder="آدرس ایمیل..."
            className="mt-3"
            disabled
          />
        );
      case 'چندگزینه‌ای':
        return (
          <div className="mt-3 space-y-2">
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2 space-x-reverse">
                <input type="radio" name={`question-${question.id}`} disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getQuestionColor(question.type)} relative group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <span className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-600">
              {index + 1}
            </span>
            <span className="text-xs text-gray-500">{question.type}</span>
          </div>
          
          {isEditing ? (
            <Input
              value={question.label}
              onChange={(e) => onUpdate(question.id, { label: e.target.value })}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="text-lg font-medium"
              autoFocus
            />
          ) : (
            <h3
              className="text-lg font-medium text-gray-800 cursor-pointer hover:bg-white hover:bg-opacity-50 p-2 rounded"
              onClick={() => setIsEditing(true)}
            >
              {question.label}
            </h3>
          )}
          
          {renderQuestionInput()}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            حذف
          </Button>
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
        <label className="flex items-center space-x-1 space-x-reverse cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
            className="rounded"
          />
          <span>الزامی</span>
        </label>
      </div>
    </div>
  );
};

export default QuestionCard;
