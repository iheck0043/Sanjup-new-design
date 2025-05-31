
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Question } from '../../types/Question';

interface ImageOptionsSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
}

const ImageOptionsSettings: React.FC<ImageOptionsSettingsProps> = ({ question, onUpdate }) => {
  const addImageOption = () => {
    const currentOptions = question.imageOptions || [{ text: 'گزینه ۱', imageUrl: '' }, { text: 'گزینه ۲', imageUrl: '' }];
    const newOptions = [...currentOptions, { text: `گزینه ${currentOptions.length + 1}`, imageUrl: '' }];
    onUpdate('imageOptions', newOptions);
  };

  const removeImageOption = (index: number) => {
    if (question.imageOptions && question.imageOptions.length > 2) {
      const newOptions = question.imageOptions.filter((_, i) => i !== index);
      onUpdate('imageOptions', newOptions);
    }
  };

  const updateImageOption = (index: number, field: 'text' | 'imageUrl', value: string) => {
    if (question.imageOptions) {
      const newOptions = [...question.imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      onUpdate('imageOptions', newOptions);
    }
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateImageOption(index, 'imageUrl', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium">گزینه‌ها</Label>
        <Button size="sm" variant="outline" onClick={addImageOption} className="h-8 px-2">
          <Plus className="w-4 h-4 ml-1" />
          افزودن
        </Button>
      </div>
      <div className="space-y-3">
        {(question.imageOptions || [{ text: 'گزینه ۱', imageUrl: '' }, { text: 'گزینه ۲', imageUrl: '' }]).map((option, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={option.text}
                onChange={(e) => updateImageOption(index, 'text', e.target.value)}
                placeholder={`گزینه ${index + 1}`}
                className="flex-1"
              />
              {(question.imageOptions?.length || 2) > 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeImageOption(index)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="w-4 h-4 ml-2" />
                  آپلود تصویر
                </Button>
              </div>
              {option.imageUrl && (
                <div className="w-full h-20 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={option.imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageOptionsSettings;
