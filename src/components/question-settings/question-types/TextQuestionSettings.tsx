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
  // Get maxLength from either maxLength or limit property
  const maxLength = question.maxLength || question.limit || 200;

  return (
    <div className="space-y-4">
      <div className="space-y-3 border-t pt-4">
        {(question.type === "text_question_short" ||
          question.type === "text_question_long") && (
          <div className="flex items-center justify-between">
            <Input
              type="number"
              value={maxLength}
              onChange={(e) =>
                onUpdateField("maxLength", parseInt(e.target.value))
              }
              className="w-24"
              min={1}
            />
            <Label className="text-sm font-medium">حداکثر تعداد کاراکتر</Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextQuestionSettings;
