import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Image as ImageIcon,
  Star,
  Heart,
  ThumbsUp,
  Play,
  Video,
} from "lucide-react";
import type { Question } from "../pages/QuestionnaireForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionHeader from "./question-settings/QuestionHeader";
import QuestionSettingsSidebar from "./question-settings/QuestionSettingsSidebar";
import QuestionPreview from "./question-settings/QuestionPreview";

interface QuestionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
  isNewQuestion: boolean;
}

const QuestionSettingsModal: React.FC<QuestionSettingsModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
  onCancel,
  isNewQuestion,
}) => {
  const [localQuestion, setLocalQuestion] = useState<Question | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newDropdownOption, setNewDropdownOption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (question) {
      if (isNewQuestion) {
        setLocalQuestion({
          ...question,
          title: "سوال جدید",
          label: "سوال جدید",
          required: true,
        });
      } else {
        setLocalQuestion({
          ...question,
          label: question.title || question.label || "",
        });
      }
      setHasChanges(isNewQuestion);
    }
  }, [question, isNewQuestion]);

  if (!localQuestion) return null;

  const handleUpdateField = (field: keyof Question, value: any) => {
    const updated = { ...localQuestion, [field]: value };
    if (field === "label") {
      updated.title = value;
    }
    setLocalQuestion(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!localQuestion.label.trim()) {
      inputRef.current?.focus();
      return;
    }

    if (hasChanges && localQuestion) {
      onSave(localQuestion);
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (isNewQuestion) {
      onCancel();
    } else {
      setHasChanges(false);
      onClose();
    }
  };

  // Helper functions for different question types
  const addOption = () => {
    const currentOptions = localQuestion.options || [];
    const newOptions = [
      ...currentOptions,
      `گزینه ${currentOptions.length + 1}`,
    ];
    handleUpdateField("options", newOptions);
  };

  const removeOption = (index: number) => {
    if (localQuestion.options && localQuestion.options.length > 2) {
      const newOptions = localQuestion.options.filter((_, i) => i !== index);
      handleUpdateField("options", newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (localQuestion.options) {
      const newOptions = [...localQuestion.options];
      newOptions[index] = value;
      handleUpdateField("options", newOptions);
    }
  };

  // Dropdown options management
  const addDropdownOption = () => {
    if (newDropdownOption.trim()) {
      const currentOptions = localQuestion.options || [];
      const newOptions = [...currentOptions, newDropdownOption.trim()];
      handleUpdateField("options", newOptions);
      setNewDropdownOption("");
    }
  };

  const handleDropdownKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDropdownOption();
    }
  };

  const removeDropdownOption = (index: number) => {
    if (localQuestion.options && localQuestion.options.length > 1) {
      const newOptions = localQuestion.options.filter((_, i) => i !== index);
      handleUpdateField("options", newOptions);
    }
  };

  // Matrix functions - fixed to ensure minimum 2 items
  const addRow = () => {
    const currentRows = localQuestion.rows || ["سطر ۱", "سطر ۲"];
    const newRows = [...currentRows, `سطر ${currentRows.length + 1}`];
    handleUpdateField("rows", newRows);
  };

  const removeRow = (index: number) => {
    if (localQuestion.rows && localQuestion.rows.length > 2) {
      const newRows = localQuestion.rows.filter((_, i) => i !== index);
      handleUpdateField("rows", newRows);
    }
  };

  const updateRow = (index: number, value: string) => {
    if (localQuestion.rows) {
      const newRows = [...localQuestion.rows];
      newRows[index] = value;
      handleUpdateField("rows", newRows);
    }
  };

  const addColumn = () => {
    const currentColumns = localQuestion.columns || ["ستون ۱", "ستون ۲"];
    const newColumns = [...currentColumns, `ستون ${currentColumns.length + 1}`];
    handleUpdateField("columns", newColumns);
  };

  const removeColumn = (index: number) => {
    if (localQuestion.columns && localQuestion.columns.length > 2) {
      const newColumns = localQuestion.columns.filter((_, i) => i !== index);
      handleUpdateField("columns", newColumns);
    }
  };

  const updateColumn = (index: number, value: string) => {
    if (localQuestion.columns) {
      const newColumns = [...localQuestion.columns];
      newColumns[index] = value;
      handleUpdateField("columns", newColumns);
    }
  };

  // Image choice functions - fixed
  const addImageOption = () => {
    const currentOptions = localQuestion.imageOptions || [
      { text: "گزینه ۱", imageUrl: "" },
      { text: "گزینه ۲", imageUrl: "" },
    ];
    const newOptions = [
      ...currentOptions,
      { text: `گزینه ${currentOptions.length + 1}`, imageUrl: "" },
    ];
    handleUpdateField("imageOptions", newOptions);
  };

  const removeImageOption = (index: number) => {
    if (localQuestion.imageOptions && localQuestion.imageOptions.length > 2) {
      const newOptions = localQuestion.imageOptions.filter(
        (_, i) => i !== index
      );
      handleUpdateField("imageOptions", newOptions);
    }
  };

  const updateImageOption = (
    index: number,
    field: "text" | "imageUrl",
    value: string
  ) => {
    if (localQuestion.imageOptions) {
      const newOptions = [...localQuestion.imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      handleUpdateField("imageOptions", newOptions);
    }
  };

  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateImageOption(index, "imageUrl", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasOptions = localQuestion.type === "چندگزینه‌ای";
  const isMultiChoice = localQuestion.type === "چندگزینه‌ای";
  const isDropdown = localQuestion.type === "لیست کشویی";
  const isScale = localQuestion.type === "طیفی";
  const isText =
    localQuestion.type === "متنی کوتاه" || localQuestion.type === "متنی بلند";
  const isNumber = localQuestion.type === "اعداد";
  const isMatrix = localQuestion.type === "ماتریسی";
  const isPriority = localQuestion.type === "اولویت‌دهی";
  const isImageChoice = localQuestion.type === "چند‌گزینه‌ای تصویری";
  const isQuestionGroup = localQuestion.type === "گروه سوال";
  const isDescription = localQuestion.type === "متن بدون پاسخ";
  const isRating = localQuestion.type === "درجه‌بندی";
  const isEmail = localQuestion.type === "ایمیل";
  const isShortText = localQuestion.type === "متنی کوتاه";
  const isLongText = localQuestion.type === "متنی بلند";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-none max-h-none w-screen h-screen p-0 m-0 rounded-none font-vazirmatn"
        dir="rtl"
      >
        <div className="flex h-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="absolute left-4 top-4 z-10 w-8 h-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="w-80 border-l border-gray-200 bg-gray-50/50 flex flex-col h-full">
            <QuestionHeader
              question={localQuestion}
              isNewQuestion={isNewQuestion}
              inputRef={inputRef}
              onUpdateField={handleUpdateField}
            />

            <ScrollArea className="flex-1">
              <QuestionSettingsSidebar
                question={localQuestion}
                onUpdateField={handleUpdateField}
              />
            </ScrollArea>

            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={!hasChanges || !localQuestion.label.trim()}
                >
                  ذخیره
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  انصراف
                </Button>
              </div>
            </div>
          </div>

          <QuestionPreview question={localQuestion} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
