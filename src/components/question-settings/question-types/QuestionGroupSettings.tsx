
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '../../../types/question';

interface QuestionGroupSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const QuestionGroupSettings: React.FC<QuestionGroupSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="groupTitle">عنوان گروه</Label>
        <Input
          id="groupTitle"
          value={question.title || ''}
          onChange={(e) => onUpdateField('title', e.target.value)}
          placeholder="عنوان گروه سوال را وارد کنید"
        />
      </div>
      
      <div>
        <Label htmlFor="groupDescription">توضیحات گروه</Label>
        <Textarea
          id="groupDescription"
          value={question.description || ''}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="توضیحات گروه سوال را وارد کنید"
          rows={3}
        />
      </div>
    </div>
  );
};

export default QuestionGroupSettings;
