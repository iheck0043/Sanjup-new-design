
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Question } from "../../../pages/Index";

interface DescriptionQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const DescriptionQuestionSettings: React.FC<DescriptionQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">متن توضیحات</Label>
        <Textarea
          value={question.description || ""}
          onChange={(e) => onUpdateField("description", e.target.value)}
          className="mt-1"
          rows={4}
          placeholder="متن توضیحات خود را وارد کنید..."
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">نمایش به عنوان HTML</Label>
        <Switch
          checked={question.hasMedia || false}
          onCheckedChange={(checked) => onUpdateField("hasMedia", checked)}
        />
      </div>
    </div>
  );
};

export default DescriptionQuestionSettings;
