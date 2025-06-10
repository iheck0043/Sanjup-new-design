
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface EmailQuestionSettingsProps {
  question: any;
  onUpdate: (updates: any) => void;
  form: any;
}

const EmailQuestionSettings: React.FC<EmailQuestionSettingsProps> = ({
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
              <Input placeholder="سوال خود را وارد کنید" {...field} />
            </FormControl>
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
                placeholder="توضیحات اضافی برای سوال (اختیاری)"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>متن راهنما</FormLabel>
            <FormControl>
              <Input 
                placeholder="مثال: example@email.com"
                {...field}
              />
            </FormControl>
            <FormDescription>
              متنی که در فیلد ورودی نمایش داده می‌شود
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

export default EmailQuestionSettings;
