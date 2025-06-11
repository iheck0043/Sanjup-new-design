import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import type { Question } from "../../../../pages/QuestionnaireForm";

interface DescriptionQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const DescriptionQuestionSettings: React.FC<
  DescriptionQuestionSettingsProps
> = ({ question, onUpdateField }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">آپلود رسانه</Label>
          <Switch
            checked={question.hasMedia || false}
            onCheckedChange={(checked) => {
              onUpdateField("hasMedia", checked);
              if (!checked) {
                onUpdateField("mediaType", undefined);
                onUpdateField("mediaUrl", undefined);
              } else if (!question.mediaType) {
                onUpdateField("mediaType", "image");
              }
            }}
          />
        </div>

        {question.hasMedia && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">نوع رسانه</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={question.mediaType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onUpdateField("mediaType", "image");
                  onUpdateField("mediaUrl", undefined);
                }}
              >
                تصویر
              </Button>
              <Button
                type="button"
                variant={question.mediaType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onUpdateField("mediaType", "video");
                  onUpdateField("mediaUrl", undefined);
                }}
              >
                ویدئو
              </Button>
            </div>

            {question.mediaType && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept =
                      question.mediaType === "image" ? "image/*" : "video/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          onUpdateField("mediaUrl", e.target?.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <ImagePlus className="w-4 h-4 ml-2" />
                  آپلود {question.mediaType === "image" ? "تصویر" : "ویدئو"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionQuestionSettings;
