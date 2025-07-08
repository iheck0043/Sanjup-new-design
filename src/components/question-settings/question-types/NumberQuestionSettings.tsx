import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Question } from "../../../../pages/QuestionnaireForm";

interface NumberQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const NumberQuestionSettings: React.FC<NumberQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Input
            type="number"
            value={question.minNumber || 0}
            onChange={(e) =>
              onUpdateField("minNumber", parseInt(e.target.value) || 0)
            }
            className="w-24"
          />
          <Label className="text-sm font-medium">حداقل مقدار</Label>
        </div>

        <div className="flex items-center justify-between">
          <Input
            type="number"
            value={question.maxNumber || 0}
            onChange={(e) =>
              onUpdateField("maxNumber", parseInt(e.target.value) || 0)
            }
            className="w-24"
          />
          <Label className="text-sm font-medium">حداکثر مقدار</Label>
        </div>
      </div>
    </div>
  );
};

export default NumberQuestionSettings;
