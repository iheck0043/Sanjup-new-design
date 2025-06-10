import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Question } from '../../../pages/Index';

interface DescriptionQuestionSettingsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  form: any;
}

const DescriptionQuestionSettings: React.FC<DescriptionQuestionSettingsProps> = ({
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
            <FormLabel>متن توضیحات</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="متن توضیحات را وارد کنید"
                {...field}
              />
            </FormControl>
            <FormDescription>
              این متن در صفحه نمایش داده می‌شود.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};

export default DescriptionQuestionSettings;
