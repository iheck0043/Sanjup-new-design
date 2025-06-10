
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Question } from "../../../pages/Index";

interface TextQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const TextQuestionSettings: React.FC<TextQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const isLongText = question.type === "text_question_long";
  const isEmail = question.type === "text_question_email";

  return (
    <div className="space-y-4">
      {!isEmail && (
        <div>
          <Label className="text-sm font-medium">
            {isLongText ? "حداکثر تعداد کاراکتر" : "حداکثر طول"}
          </Label>
          <Input
            type="number"
            min="1"
            value={question.maxLength || question.limit || 100}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              onUpdateField("maxLength", value);
              onUpdateField("limit", value);
            }}
            className="mt-1"
          />
        </div>
      )}

      {isEmail && (
        <div className="text-sm text-gray-500">
          این سوال به طور خودکار ایمیل را اعتبارسنجی می‌کند.
        </div>
      )}
    </div>
  );
};

export default TextQuestionSettings;
