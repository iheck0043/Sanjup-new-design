
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { Question } from "../../../pages/Index";

interface MatrixQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const MatrixQuestionSettings: React.FC<MatrixQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  const addRow = () => {
    const currentRows = question.rows || ["سطر ۱", "سطر ۲"];
    const newRows = [...currentRows, `سطر ${currentRows.length + 1}`];
    onUpdateField("rows", newRows);
  };

  const removeRow = (index: number) => {
    if (question.rows && question.rows.length > 2) {
      const newRows = question.rows.filter((_, i) => i !== index);
      onUpdateField("rows", newRows);
    }
  };

  const updateRow = (index: number, value: string) => {
    if (question.rows) {
      const newRows = [...question.rows];
      newRows[index] = value;
      onUpdateField("rows", newRows);
    }
  };

  const addColumn = () => {
    const currentColumns = question.columns || ["ستون ۱", "ستون ۲"];
    const newColumns = [...currentColumns, `ستون ${currentColumns.length + 1}`];
    onUpdateField("columns", newColumns);
  };

  const removeColumn = (index: number) => {
    if (question.columns && question.columns.length > 2) {
      const newColumns = question.columns.filter((_, i) => i !== index);
      onUpdateField("columns", newColumns);
    }
  };

  const updateColumn = (index: number, value: string) => {
    if (question.columns) {
      const newColumns = [...question.columns];
      newColumns[index] = value;
      onUpdateField("columns", newColumns);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">سطرها</Label>
        <div className="space-y-2">
          {(question.rows || ["سطر ۱", "سطر ۲"]).map((row, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={row}
                onChange={(e) => updateRow(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeRow(index)}
                disabled={(question.rows?.length || 0) <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" onClick={addRow} className="mt-2" variant="outline">
          <Plus className="w-4 h-4 ml-1" />
          افزودن سطر
        </Button>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">ستون‌ها</Label>
        <div className="space-y-2">
          {(question.columns || ["ستون ۱", "ستون ۲"]).map((column, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={column}
                onChange={(e) => updateColumn(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeColumn(index)}
                disabled={(question.columns?.length || 0) <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" onClick={addColumn} className="mt-2" variant="outline">
          <Plus className="w-4 h-4 ml-1" />
          افزودن ستون
        </Button>
      </div>
    </div>
  );
};

export default MatrixQuestionSettings;
