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
          <Label className="text-sm font-medium">حداقل مقدار</Label>
          <Input
            type="number"
            value={question.min || 0}
            onChange={(e) =>
              onUpdateField("min", parseInt(e.target.value) || 0)
            }
            className="w-24"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">حداکثر مقدار</Label>
          <Input
            type="number"
            value={question.max || 0}
            onChange={(e) =>
              onUpdateField("max", parseInt(e.target.value) || 0)
            }
            className="w-24"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">گام</Label>
          <Input
            type="number"
            value={question.step || 1}
            onChange={(e) =>
              onUpdateField("step", parseInt(e.target.value) || 1)
            }
            min={1}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberQuestionSettings;
