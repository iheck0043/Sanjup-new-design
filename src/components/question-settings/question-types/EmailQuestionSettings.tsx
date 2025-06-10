
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Question } from '../../../pages/Index';

interface EmailQuestionSettingsProps {
  question: Question & {
    placeholder?: string;
    email_validation?: boolean;
  };
  onUpdateField: (field: string, value: any) => void;
}

const EmailQuestionSettings: React.FC<EmailQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="emailPlaceholder">متن راهنما</Label>
        <Input
          id="emailPlaceholder"
          value={question.placeholder || ''}
          onChange={(e) => onUpdateField('placeholder', e.target.value)}
          placeholder="مثال: your.email@example.com"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="emailValidation">اعتبارسنجی ایمیل</Label>
        <Switch
          id="emailValidation"
          checked={question.email_validation || true}
          onCheckedChange={(checked) => onUpdateField('email_validation', checked)}
        />
      </div>
    </div>
  );
};

export default EmailQuestionSettings;
