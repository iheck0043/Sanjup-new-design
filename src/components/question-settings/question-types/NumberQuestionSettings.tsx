import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { Question } from '../../../pages/Index';

interface NumberQuestionSettingsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  form: any;
}

const NumberQuestionSettings: React.FC<NumberQuestionSettingsProps> = ({
  question,
  onUpdate,
  form
}) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>اجباری</FormLabel>
              <FormDescription>
                آیا پاسخ به این سوال اجباری است؟
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default NumberQuestionSettings;
