
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import type { Question } from "../../../types/question";

interface PriorityQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const PriorityQuestionSettings: React.FC<PriorityQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption.trim()) {
      const currentOptions = question.options || [];
      const newOptions = [...currentOptions, newOption.trim()];
      onUpdateField("options", newOptions);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onUpdateField("options", newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[index] = value;
      onUpdateField("options", newOptions);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">گزینه‌ها</Label>
        <div className="space-y-2">
          {(question.options || ["گزینه ۱", "گزینه ۲", "گزینه ۳"]).map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeOption(index)}
                disabled={(question.options?.length || 0) <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="گزینه جدید"
            onKeyPress={(e) => e.key === "Enter" && addOption()}
          />
          <Button type="button" onClick={addOption}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">ترتیب تصادفی گزینه‌ها</Label>
        <Switch
          checked={question.shuffleOptions || false}
          onCheckedChange={(checked) =>
            onUpdateField("shuffleOptions", checked)
          }
        />
      </div>
    </div>
  );
};

export default PriorityQuestionSettings;
