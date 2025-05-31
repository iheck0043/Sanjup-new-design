
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Question } from '../../types/Question';

interface OptionsSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
  questionType: string;
}

const OptionsSettings: React.FC<OptionsSettingsProps> = ({ question, onUpdate, questionType }) => {
  const addOption = () => {
    const currentOptions = question.options || [];
    const newOptions = [...currentOptions, `گزینه ${currentOptions.length + 1}`];
    onUpdate('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onUpdate('options', newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      onUpdate('options', newOptions);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium">گزینه‌ها</Label>
        <Button size="sm" variant="outline" onClick={addOption} className="h-8 px-2">
          <Plus className="w-4 h-4 ml-1" />
          افزودن
        </Button>
      </div>
      <div className="space-y-2">
        {(question.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1"
            />
            {(question.options?.length || 2) > 2 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOption(index)}
                className="h-8 w-8 p-0 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionsSettings;
