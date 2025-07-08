import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Question } from "../../../../pages/QuestionnaireForm";

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
    <div dir="rtl" className="space-y-4 ">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">سطرها</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addRow}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 ml-1" />
            افزودن
          </Button>
        </div>
        <div className="space-y-2">
          {(question.rows || ["سطر ۱", "سطر ۲"]).map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={row}
                onChange={(e) => updateRow(index, e.target.value)}
                className="flex-1"
              />
              {(question.rows?.length || 2) > 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRow(index)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">ستون‌ها</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addColumn}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 ml-1" />
            افزودن
          </Button>
        </div>
        <div className="space-y-2">
          {(question.columns || ["ستون ۱", "ستون ۲"]).map((column, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={column}
                onChange={(e) => updateColumn(index, e.target.value)}
                className="flex-1"
              />
              {(question.columns?.length || 2) > 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeColumn(index)}
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

export default MatrixQuestionSettings;
