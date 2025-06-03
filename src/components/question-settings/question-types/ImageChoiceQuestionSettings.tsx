import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import type { Question } from "../../../../pages/QuestionnaireForm";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface ImageChoiceQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const ImageChoiceQuestionSettings: React.FC<ImageChoiceQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addOption = () => {
    const currentOptions = question.imageOptions || [
      { text: "گزینه ۱", imageUrl: "" },
      { text: "گزینه ۲", imageUrl: "" },
    ];
    const newOptions = [
      ...currentOptions,
      { text: `گزینه ${currentOptions.length + 1}`, imageUrl: "" },
    ];
    onUpdateField("imageOptions", newOptions);
  };

  const removeOption = (index: number) => {
    if (question.imageOptions && question.imageOptions.length > 2) {
      const newOptions = question.imageOptions.filter((_, i) => i !== index);
      onUpdateField("imageOptions", newOptions);
    }
  };

  const updateOption = (index: number, field: "text" | "imageUrl", value: string) => {
    if (question.imageOptions) {
      const newOptions = [...question.imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      onUpdateField("imageOptions", newOptions);
    }
  };

  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex(index);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${BASE_URL}/api/v1/uploader/images/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("خطا در آپلود تصویر");
      }

      const data = await response.json();
      if (data.info.status === 200) {
        updateOption(index, "imageUrl", data.data.image_url);
        toast.success("تصویر با موفقیت آپلود شد");
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "خطا در آپلود تصویر");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">چند جوابی</Label>
        <Switch
          checked={question.isMultiImage || false}
          onCheckedChange={(checked) => onUpdateField("isMultiImage", checked)}
        />
      </div>

      <div className="space-y-4">
        {question.imageOptions?.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, "text", e.target.value)}
              placeholder={`گزینه ${index + 1}`}
              className="flex-1"
            />
            <label className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                disabled={uploadingIndex === index}
              >
                {uploadingIndex === index ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </label>
            {question.imageOptions && question.imageOptions.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-red-500 hover:text-red-600"
                onClick={() => removeOption(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addOption}
      >
        <Plus className="h-4 w-4 ml-2" />
        افزودن گزینه
      </Button>
    </div>
  );
};

export default ImageChoiceQuestionSettings;
