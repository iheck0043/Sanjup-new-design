
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Upload } from "lucide-react";
import type { Question } from "../../../pages/Index";

interface ImageChoiceQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const ImageChoiceQuestionSettings: React.FC<ImageChoiceQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const imageOptions = question.imageOptions || [
    { text: "گزینه ۱", imageUrl: "" },
    { text: "گزینه ۲", imageUrl: "" },
  ];

  const addImageOption = () => {
    const newOptions = [
      ...imageOptions,
      { text: `گزینه ${imageOptions.length + 1}`, imageUrl: "" },
    ];
    onUpdateField("imageOptions", newOptions);
  };

  const removeImageOption = (index: number) => {
    if (imageOptions.length > 2) {
      const newOptions = imageOptions.filter((_, i) => i !== index);
      onUpdateField("imageOptions", newOptions);
    }
  };

  const updateImageOption = (
    index: number,
    field: "text" | "imageUrl",
    value: string
  ) => {
    const newOptions = [...imageOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onUpdateField("imageOptions", newOptions);
  };

  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateImageOption(index, "imageUrl", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">گزینه‌های تصویری</Label>
        <div className="space-y-4">
          {imageOptions.map((option, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateImageOption(index, "text", e.target.value)}
                  placeholder="متن گزینه"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeImageOption(index)}
                  disabled={imageOptions.length <= 2}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">تصویر گزینه</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => handleImageUpload(index, e as any);
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={option.text}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button type="button" onClick={addImageOption} className="mt-2" variant="outline">
          <Plus className="w-4 h-4 ml-1" />
          افزودن گزینه
        </Button>
      </div>
    </div>
  );
};

export default ImageChoiceQuestionSettings;
