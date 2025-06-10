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

const ImageChoiceQuestionSettings: React.FC<
  ImageChoiceQuestionSettingsProps
> = ({ question, onUpdateField }) => {
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

  const updateOption = (
    index: number,
    field: "text" | "imageUrl",
    value: string
  ) => {
    if (question.imageOptions) {
      const newOptions = [...question.imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      onUpdateField("imageOptions", newOptions);
    }
  };

  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      toast.error(
        error instanceof Error ? error.message : "خطا در آپلود تصویر"
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">انتخاب چندگانه</Label>
        <Switch
          checked={question.isMultiImage || false}
          onCheckedChange={(checked) => onUpdateField("isMultiImage", checked)}
        />
      </div>

      {question.isMultiImage && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium">حداقل انتخاب</Label>
            <Input
              type="number"
              value={question.minSelectableChoices || 2}
              onChange={(e) =>
                onUpdateField(
                  "minSelectableChoices",
                  parseInt(e.target.value) || 2
                )
              }
              min={2}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">حداکثر انتخاب</Label>
            <Input
              type="number"
              value={question.maxSelectableChoices || 4}
              onChange={(e) =>
                onUpdateField(
                  "maxSelectableChoices",
                  parseInt(e.target.value) || 4
                )
              }
              min={2}
              className="mt-1"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          {(
            question.imageOptions || [
              { text: "تصویر ۱", imageUrl: "" },
              { text: "تصویر ۲", imageUrl: "" },
            ]
          )
            .filter((_, index) => {
              const option = question.rawOptions?.[index];
              return option?.option_kind !== "etc";
            })
            .map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, "text", e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) =>
                        handleImageUpload(index, e as any);
                      input.click();
                    }}
                  >
                    {uploadingIndex === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                  {(question.imageOptions?.length || 2) > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
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

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">گزینه "سایر"</Label>
          <Switch
            checked={question.hasOther || false}
            onCheckedChange={(checked) => onUpdateField("hasOther", checked)}
          />
        </div>

        {question.hasOther && (
          <div className="mr-6">
            <Input
              placeholder="متن گزینه سایر"
              value={
                question.rawOptions?.find((opt) => opt.option_kind === "etc")
                  ?.label || "سایر"
              }
              onChange={(e) => {
                const otherOption = question.rawOptions?.find(
                  (opt) => opt.option_kind === "etc"
                );
                if (otherOption) {
                  otherOption.label = e.target.value;
                  otherOption.text = e.target.value;
                  onUpdateField("rawOptions", [...(question.rawOptions || [])]);
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">گزینه "هیچکدام"</Label>
          <Switch
            checked={question.hasNone || false}
            onCheckedChange={(checked) => onUpdateField("hasNone", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">گزینه "همه موارد"</Label>
          <Switch
            checked={question.hasAll || false}
            onCheckedChange={(checked) => onUpdateField("hasAll", checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageChoiceQuestionSettings;
