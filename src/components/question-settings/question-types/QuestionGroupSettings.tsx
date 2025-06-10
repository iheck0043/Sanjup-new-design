
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface QuestionGroupSettingsProps {
  question: any;
  onUpdate: (updates: any) => void;
  form: any;
}

const QuestionGroupSettings: React.FC<QuestionGroupSettingsProps> = ({
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
            <FormLabel>عنوان گروه</FormLabel>
            <FormControl>
              <Input placeholder="عنوان گروه سوال را وارد کنید" {...field} />
            </FormControl>
            <FormDescription>
              این عنوان در بالای گروه سوالات نمایش داده می‌شود
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>توضیحات</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="توضیحات اضافی برای گروه سوال (اختیاری)"
                {...field}
              />
            </FormControl>
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
                آیا پاسخ به تمام سوالات این گروه اجباری است؟
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

export default QuestionGroupSettings;
