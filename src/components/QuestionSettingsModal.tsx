
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
import type { Question } from "../types/question";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionHeader from "./question-settings/QuestionHeader";
import QuestionSettingsSidebar from "./question-settings/QuestionSettingsSidebar";
import QuestionPreview from "./question-settings/QuestionPreview";
import { Checkbox } from "@/components/ui/checkbox";

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
          title: question.title || "سوال جدید",
          label: question.label || "سوال جدید",
          isRequired: true,
        });
      } else {
        setLocalQuestion({
          ...question,
          title: question.title || question.label || "",
          label: question.title || question.label || "",
        });
      }
      setHasChanges(isNewQuestion);
    }
  }, [question, isNewQuestion]);

  if (!localQuestion) return null;

  const handleUpdateField = (field: keyof Question, value: any) => {
    console.log("Updating field:", field, "with value:", value);
    const updated = { ...localQuestion } as Question;

    if (field === "label") {
      updated.title = value;
      updated.label = value;
    }

    if (field === "hasMedia") {
      updated.hasMedia = value;
      if (!value) {
        updated.mediaType = undefined;
        updated.mediaUrl = undefined;
      } else if (!updated.mediaType) {
        updated.mediaType = "image";
      }
    } else if (field === "mediaType") {
      updated.mediaType = value;
      updated.mediaUrl = undefined;
    } else {
      (updated as any)[field] = value;
    }

    console.log("Updated question:", updated);
    setLocalQuestion(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!localQuestion.title?.trim()) {
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
    const currentRows = (localQuestion as any).rows || ["سطر ۱", "سطر ۲"];
    const newRows = [...currentRows, `سطر ${currentRows.length + 1}`];
    handleUpdateField("rows" as keyof Question, newRows);
  };

  const removeRow = (index: number) => {
    if ((localQuestion as any).rows && (localQuestion as any).rows.length > 2) {
      const newRows = (localQuestion as any).rows.filter((_: any, i: number) => i !== index);
      handleUpdateField("rows" as keyof Question, newRows);
    }
  };

  const updateRow = (index: number, value: string) => {
    if ((localQuestion as any).rows) {
      const newRows = [...(localQuestion as any).rows];
      newRows[index] = value;
      handleUpdateField("rows" as keyof Question, newRows);
    }
  };

  const addColumn = () => {
    const currentColumns = (localQuestion as any).columns || ["ستون ۱", "ستون ۲"];
    const newColumns = [...currentColumns, `ستون ${currentColumns.length + 1}`];
    handleUpdateField("columns" as keyof Question, newColumns);
  };

  const removeColumn = (index: number) => {
    if ((localQuestion as any).columns && (localQuestion as any).columns.length > 2) {
      const newColumns = (localQuestion as any).columns.filter((_: any, i: number) => i !== index);
      handleUpdateField("columns" as keyof Question, newColumns);
    }
  };

  const updateColumn = (index: number, value: string) => {
    if ((localQuestion as any).columns) {
      const newColumns = [...(localQuestion as any).columns];
      newColumns[index] = value;
      handleUpdateField("columns" as keyof Question, newColumns);
    }
  };

  // Image choice functions - fixed
  const addImageOption = () => {
    const currentOptions = (localQuestion as any).imageOptions || [
      { text: "گزینه ۱", imageUrl: "" },
      { text: "گزینه ۲", imageUrl: "" },
    ];
    const newOptions = [
      ...currentOptions,
      { text: `گزینه ${currentOptions.length + 1}`, imageUrl: "" },
    ];
    handleUpdateField("imageOptions" as keyof Question, newOptions);
  };

  const removeImageOption = (index: number) => {
    if ((localQuestion as any).imageOptions && (localQuestion as any).imageOptions.length > 2) {
      const newOptions = (localQuestion as any).imageOptions.filter(
        (_: any, i: number) => i !== index
      );
      handleUpdateField("imageOptions" as keyof Question, newOptions);
    }
  };

  const updateImageOption = (
    index: number,
    field: "text" | "imageUrl",
    value: string
  ) => {
    if ((localQuestion as any).imageOptions) {
      const newOptions = [...(localQuestion as any).imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      handleUpdateField("imageOptions" as keyof Question, newOptions);
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

  const hasOptions = localQuestion.type === "single_select";
  const isMultiChoice = localQuestion.type === "single_select";
  const isDropdown = localQuestion.type === "combobox";
  const isScale = localQuestion.type === "range_slider";
  const isText =
    localQuestion.type === "text_question_short" ||
    localQuestion.type === "text_question_long";
  const isNumber = localQuestion.type === "number_descriptive";
  const isMatrix = localQuestion.type === "matrix";
  const isPriority = localQuestion.type === "prioritize";
  const isImageChoice = localQuestion.type === "select_multi_image";
  const isQuestionGroup = localQuestion.type === "question_group";
  const isDescription = localQuestion.type === "statement";
  const isRating = localQuestion.type === "grading";
  const isEmail = localQuestion.type === "text_question";
  const isShortText = localQuestion.type === "text_question_short";
  const isLongText = localQuestion.type === "text_question_long";

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
                  disabled={!hasChanges || !localQuestion.title?.trim()}
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
