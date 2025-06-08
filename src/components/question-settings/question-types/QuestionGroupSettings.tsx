
import React from 'react';
import { ApiQuestion } from '../../../pages/Index';

interface QuestionGroupSettingsProps {
  question: ApiQuestion;
  onUpdate: (updates: Partial<ApiQuestion>) => void;
}

const QuestionGroupSettings: React.FC<QuestionGroupSettingsProps> = ({
  question,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">عنوان گروه</label>
        <input
          type="text"
          value={question.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="عنوان گروه سوال"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">توضیحات</label>
        <textarea
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="توضیحات گروه سوال"
          rows={3}
        />
      </div>
    </div>
  );
};

export default QuestionGroupSettings;
