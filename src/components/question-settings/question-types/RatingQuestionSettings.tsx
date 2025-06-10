import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Question } from '../../../pages/Index';

interface RatingQuestionSettingsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  form: any;
}

const RatingQuestionSettings: React.FC<RatingQuestionSettingsProps> = ({
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
            <FormLabel>عنوان سوال</FormLabel>
            <FormControl>
              <Input placeholder="عنوان سوال را وارد کنید" {...field} />
            </FormControl>
            <FormDescription>
              این عنوان در بالای سوال نمایش داده می‌شود
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
              <Input placeholder="توضیحات اضافی برای سوال (اختیاری)" {...field} />
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

      <FormField
        control={form.control}
        name="ratingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع رتبه‌بندی</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع رتبه‌بندی" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="star">ستاره</SelectItem>
                <SelectItem value="heart">قلب</SelectItem>
                <SelectItem value="thumbs">لایک</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              نوع شکلی که برای رتبه‌بندی نمایش داده می‌شود را انتخاب کنید
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};

export default RatingQuestionSettings;
