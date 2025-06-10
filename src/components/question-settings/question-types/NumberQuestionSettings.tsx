
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Question } from "../../../pages/Index";

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">حداقل مقدار</Label>
          <Input
            type="number"
            value={question.minNumber || 0}
            onChange={(e) => 
              onUpdateField("minNumber", parseInt(e.target.value))
            }
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">حداکثر مقدار</Label>
          <Input
            type="number"
            value={question.maxNumber || 100}
            onChange={(e) => 
              onUpdateField("maxNumber", parseInt(e.target.value))
            }
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberQuestionSettings;
