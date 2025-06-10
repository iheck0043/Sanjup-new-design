import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import type { Question } from '../../../pages/Index';

interface ImageChoiceQuestionSettingsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  form: any;
}

const ImageChoiceQuestionSettings: React.FC<ImageChoiceQuestionSettingsProps> = ({
  question,
  onUpdate,
  form
}) => {
  return (
    <div className="space-y-6">
      {question.imageOptions && question.imageOptions.map((option, index) => (
        <div key={index} className="border rounded-md p-4">
          <FormField
            control={form.control}
            name={`imageOptions.${index}.text`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>متن گزینه {index + 1}</FormLabel>
                <FormControl>
                  <Input placeholder="متن گزینه را وارد کنید" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`imageOptions.${index}.imageUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>آدرس تصویر گزینه {index + 1}</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="آدرس تصویر را وارد کنید" {...field} />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor={`upload-image-${index}`} className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        آپلود
                      </label>
                    </Button>
                    <input
                      type="file"
                      id={`upload-image-${index}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            field.onChange(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const updatedImageOptions = [...question.imageOptions!];
              updatedImageOptions.splice(index, 1);
              onUpdate({ imageOptions: updatedImageOptions });
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            حذف گزینه
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={() => {
          const newImageOptions = [...(question.imageOptions || []), { text: '', imageUrl: '' }];
          onUpdate({ imageOptions: newImageOptions });
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        افزودن گزینه
      </Button>
    </div>
  );
};

export default ImageChoiceQuestionSettings;
