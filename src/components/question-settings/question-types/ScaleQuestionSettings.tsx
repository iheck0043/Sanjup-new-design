
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "../../../types/question";

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">حداقل مقدار</Label>
          <Input
            type="number"
            value={question.minNumber || 0}
            onChange={(e) => onUpdateField("minNumber", parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">حداکثر مقدار</Label>
          <Input
            type="number"
            value={question.maxNumber || 10}
            onChange={(e) => onUpdateField("maxNumber", parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">برچسب حداقل</Label>
        <Input
          value={question.options?.[0] || ""}
          onChange={(e) => {
            const newOptions = [...(question.options || ["", ""])];
            newOptions[0] = e.target.value;
            onUpdateField("options", newOptions);
          }}
          className="mt-1"
          placeholder="برچسب حداقل مقدار"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">برچسب حداکثر</Label>
        <Input
          value={question.options?.[1] || ""}
          onChange={(e) => {
            const newOptions = [...(question.options || ["", ""])];
            newOptions[1] = e.target.value;
            onUpdateField("options", newOptions);
          }}
          className="mt-1"
          placeholder="برچسب حداکثر مقدار"
        />
      </div>
    </div>
  );
};

export default ScaleQuestionSettings;
