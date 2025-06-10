import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { Question } from '../../../pages/Index';

interface TextQuestionSettingsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  form: any;
}

const TextQuestionSettings: React.FC<TextQuestionSettingsProps> = ({
  question,
  onUpdate,
  form
}) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>متن سوال</FormLabel>
            <FormControl>
              <input placeholder="متن سوال را وارد کنید" className="border rounded px-3 py-2 w-full" {...field} />
            </FormControl>
            <FormDescription>
              متنی که می‌خواهید به عنوان سوال نمایش داده شود را وارد کنید.
            </FormDescription>
          </FormItem>
        )}
      />

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

export default TextQuestionSettings;
