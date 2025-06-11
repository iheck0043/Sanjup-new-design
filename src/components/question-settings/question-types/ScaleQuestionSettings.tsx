import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Question } from "../../../../pages/QuestionnaireForm";

interface ScaleQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const ScaleQuestionSettings: React.FC<ScaleQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">تنظیم طیف</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">
              تعداد گزینه‌ها
            </Label>
            <Slider
              value={[question.scaleMax || 5]}
              onValueChange={(value) => onUpdateField("scaleMax", value[0])}
              min={3}
              max={11}
              step={2}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span>
              <span>11</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">
              یا وارد کنید
            </Label>
            <Input
              type="number"
              value={question.scaleMax || 5}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 3 && value <= 11 && value % 2 === 1) {
                  onUpdateField("scaleMax", value);
                }
              }}
              min={3}
              max={11}
              step={2}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">برچسب‌های طیف</Label>
        <div className="space-y-2">
          <Input
            placeholder="برچسب چپ"
            value={question.scaleLabels?.left || ""}
            onChange={(e) =>
              onUpdateField("scaleLabels", {
                ...question.scaleLabels,
                left: e.target.value,
              })
            }
          />
          <Input
            placeholder="برچسب وسط"
            value={question.scaleLabels?.center || ""}
            onChange={(e) =>
              onUpdateField("scaleLabels", {
                ...question.scaleLabels,
                center: e.target.value,
              })
            }
          />
          <Input
            placeholder="برچسب راست"
            value={question.scaleLabels?.right || ""}
            onChange={(e) =>
              onUpdateField("scaleLabels", {
                ...question.scaleLabels,
                right: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ScaleQuestionSettings;
