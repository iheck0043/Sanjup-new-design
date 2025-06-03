import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Question } from "../../../../pages/QuestionnaireForm";

interface TextQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const TextQuestionSettings: React.FC<TextQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">حداکثر تعداد کاراکتر</Label>
          <Input
            type="number"
            value={question.limit || 0}
            onChange={(e) =>
              onUpdateField("limit", parseInt(e.target.value) || 0)
            }
            min={0}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default TextQuestionSettings;
