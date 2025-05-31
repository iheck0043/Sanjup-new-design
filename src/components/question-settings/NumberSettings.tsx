
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Question } from '../../types/Question';

interface NumberSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
}

const NumberSettings: React.FC<NumberSettingsProps> = ({ question, onUpdate }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-sm font-medium">حداقل عدد</Label>
        <Input
          type="number"
          value={question.minNumber || ''}
          onChange={(e) => onUpdate('minNumber', parseInt(e.target.value) || 0)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-sm font-medium">حداکثر عدد</Label>
        <Input
          type="number"
          value={question.maxNumber || ''}
          onChange={(e) => onUpdate('maxNumber', parseInt(e.target.value) || 0)}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default NumberSettings;
