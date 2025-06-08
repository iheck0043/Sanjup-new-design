
import React from 'react';
import { ApiQuestion } from '../../../pages/QuestionnaireForm';

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
          value={question.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
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
          placeholder="مثال: ایمیل خود را وارد کنید"
        />
      </div>
    </div>
  );
};

export default EmailQuestionSettings;
