
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '../../types/Question';

interface TextSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
}

const TextSettings: React.FC<TextSettingsProps> = ({ question, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">نوع متن</Label>
        <Select value={question.textType || 'short'} onValueChange={(value) => onUpdate('textType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">متن کوتاه</SelectItem>
            <SelectItem value="long">متن بلند</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium">حداقل کاراکتر</Label>
          <Input
            type="number"
            value={question.minChars || ''}
            onChange={(e) => onUpdate('minChars', parseInt(e.target.value) || 0)}
            min={0}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">حداکثر کاراکتر</Label>
          <Input
            type="number"
            value={question.maxChars || ''}
            onChange={(e) => onUpdate('maxChars', parseInt(e.target.value) || 0)}
            min={0}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default TextSettings;
