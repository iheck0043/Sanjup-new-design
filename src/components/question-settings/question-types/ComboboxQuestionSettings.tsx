import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question } from "@/pages/QuestionnaireForm";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Switch } from "@/components/ui/switch";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface PredefinedList {
  name: string;
  items: Array<{ name: string }>;
}

interface ComboboxQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const ComboboxQuestionSettings: React.FC<ComboboxQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const [predefinedLists, setPredefinedLists] = useState<PredefinedList[]>([]);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      fetchPredefinedLists();
    }
  }, [accessToken]);

  const fetchPredefinedLists = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/type-list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("خطا در دریافت لیست‌های آماده");
      }
      const data = await response.json();
      if (data.data) {
        setPredefinedLists(data.data);
      }
    } catch (error) {
      console.error("Error fetching predefined lists:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در دریافت لیست‌های آماده"
      );
    } finally {
      setLoading(false);
    }
  };

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

  const handlePredefinedListSelect = (listName: string) => {
    const selectedList = predefinedLists.find((list) => list.name === listName);
    if (selectedList) {
      const newOptions = selectedList.items.map((item) => item.name);
      onUpdateField("options", newOptions);
      toast.success("گزینه‌های آماده با موفقیت اضافه شدند");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">گزینه‌های آماده</Label>
        <Select onValueChange={handlePredefinedListSelect} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب لیست آماده" />
          </SelectTrigger>
          <SelectContent>
            {predefinedLists.map((list) => (
              <SelectItem key={list.name} value={list.name}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div dir="rtl" className="space-y-2">
        <div className="flex items-center justify-between">
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
    </div>
  );
};

export default ComboboxQuestionSettings;
