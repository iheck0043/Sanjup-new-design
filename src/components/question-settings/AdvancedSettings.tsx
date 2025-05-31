
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Question } from '../../types/Question';

interface AdvancedSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ question, onUpdate }) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium text-gray-900">تنظیمات پیشرفته</h4>
      
      <div className="space-y-3">
        {[
          { key: 'hasOther', label: 'گزینه سایر' },
          { key: 'hasNone', label: 'گزینه هیچکدام' },
          { key: 'hasAll', label: 'گزینه همه موارد' },
          { key: 'isRequired', label: 'پاسخ اجباری باشد' },
          { key: 'isMultiSelect', label: 'سوال چند انتخابی' },
          { key: 'randomizeOptions', label: 'گزینه‌های تصادفی' }
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm font-medium">{label}</Label>
            <Switch
              checked={question[key as keyof Question] as boolean || false}
              onCheckedChange={(checked) => onUpdate(key as keyof Question, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedSettings;
