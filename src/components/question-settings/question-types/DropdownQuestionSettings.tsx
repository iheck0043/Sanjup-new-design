import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import type { Question } from "../../../../pages/QuestionnaireForm";

interface DropdownQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const DropdownQuestionSettings: React.FC<DropdownQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const addOption = () => {
    const currentOptions = question.options || ["گزینه ۱", "گزینه ۲"];
    const newOptions = [
      ...currentOptions,
      `گزینه ${currentOptions.length + 1}`,
    ];
    onUpdateField("options", newOptions);
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
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">گزینه‌ها</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addOption}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 ml-1" />
            افزودن
          </Button>
        </div>
        <div className="space-y-2">
          {(question.options || ["گزینه ۱", "گزینه ۲"]).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1"
              />
              {(question.options?.length || 2) > 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOption(index)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">انتخاب چندگانه</Label>
          <Switch
            checked={question.isMultiSelect || false}
            onCheckedChange={(checked) =>
              onUpdateField("isMultiSelect", checked)
            }
          />
        </div>

        {question.isMultiSelect && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">حداقل انتخاب</Label>
              <Input
                type="number"
                value={question.minSelectableChoices || 2}
                onChange={(e) =>
                  onUpdateField(
                    "minSelectableChoices",
                    parseInt(e.target.value) || 2
                  )
                }
                min={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">حداکثر انتخاب</Label>
              <Input
                type="number"
                value={question.maxSelectableChoices || 4}
                onChange={(e) =>
                  onUpdateField(
                    "maxSelectableChoices",
                    parseInt(e.target.value) || 4
                  )
                }
                min={2}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">ترتیب تصادفی گزینه‌ها</Label>
          <Switch
            checked={question.shuffleOptions || false}
            onCheckedChange={(checked) =>
              onUpdateField("shuffleOptions", checked)
            }
          />
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">گزینه "سایر"</Label>
            <Switch
              checked={question.hasOther || false}
              onCheckedChange={(checked) => onUpdateField("hasOther", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">گزینه "هیچکدام"</Label>
            <Switch
              checked={question.hasNone || false}
              onCheckedChange={(checked) => onUpdateField("hasNone", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownQuestionSettings;
