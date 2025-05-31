
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Question } from '../../types/Question';

interface DropdownSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
}

const DropdownSettings: React.FC<DropdownSettingsProps> = ({ question, onUpdate }) => {
  const [newDropdownOption, setNewDropdownOption] = useState('');

  const addDropdownOption = () => {
    if (newDropdownOption.trim()) {
      const currentOptions = question.options || [];
      const newOptions = [...currentOptions, newDropdownOption.trim()];
      onUpdate('options', newOptions);
      setNewDropdownOption('');
    }
  };

  const handleDropdownKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDropdownOption();
    }
  };

  const removeDropdownOption = (index: number) => {
    if (question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onUpdate('options', newOptions);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium">گزینه‌ها</Label>
      </div>
      <div className="space-y-3">
        <div className="border border-gray-200 rounded-lg p-3">
          <Input
            value={newDropdownOption}
            onChange={(e) => setNewDropdownOption(e.target.value)}
            onKeyPress={handleDropdownKeyPress}
            placeholder="گزینه جدید را تایپ کنید و Enter بزنید"
            className="mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {(question.options || []).map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                <span>{option}</span>
                <button
                  onClick={() => removeDropdownOption(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownSettings;
