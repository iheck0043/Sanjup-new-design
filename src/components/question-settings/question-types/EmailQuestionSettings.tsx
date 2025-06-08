
import React from 'react';
import { ApiQuestion } from '../../../pages/Index';

interface EmailQuestionSettingsProps {
  question: ApiQuestion;
  onUpdate: (updates: Partial<ApiQuestion>) => void;
}

const EmailQuestionSettings: React.FC<EmailQuestionSettingsProps> = ({
  question,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">عنوان سوال</label>
        <input
          type="text"
          value={question.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان سوال ایمیل"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">متن راهنما</label>
        <input
          type="text"
          value={question.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="مثال: آدرس ایمیل خود را وارد کنید"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">توضیحات</label>
        <textarea
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="توضیحات اضافی برای سوال"
          rows={3}
        />
      </div>
    </div>
  );
};

export default EmailQuestionSettings;
