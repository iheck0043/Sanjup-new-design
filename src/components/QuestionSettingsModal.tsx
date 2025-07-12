import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import type { Question } from "../../pages/QuestionnaireForm";
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
    setLocalQuestion((prev) => {
      const updated = { ...prev } as Question;

      if (field === "label") {
        updated.label = value;
        updated.title = value;
      } else if (field === "hasMedia") {
        updated.hasMedia = value;
        if (!value) {
          updated.mediaType = undefined;
          updated.mediaUrl = undefined;
          updated.attachment = undefined;
          updated.attachment_type = undefined;
        } else if (!updated.mediaType) {
          updated.mediaType = "image";
        }
      } else if (field === "mediaType") {
        updated.mediaType = value;
        updated.mediaUrl = undefined;
        updated.attachment = undefined;
        updated.attachment_type = undefined;
      } else if (field === "mediaUrl" || field === "attachment") {
        // set field value and ensure hasMedia true
        // @ts-ignore
        updated[field] = value;
        if (value) {
          updated.hasMedia = true;
          if (!updated.mediaType) updated.mediaType = "image";
        }
      } else {
        // generic assignment
        // @ts-ignore
        updated[field] = value;
      }

      return updated;
    });

    setHasChanges(true);
    onSave && onSave; // just to use parameter maybe not used; but we propagate to parent separately below
  };

  const handleSave = () => {
    if (!localQuestion.label.trim()) {
      inputRef.current?.focus();
      return;
    }

    // Prevent saving scale question if any of its labels are missing
    if (areScaleLabelsMissing) {
      // Optionally, focus could be set to first label input if refs are managed; for now, just block save.
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

  const hasOptions = localQuestion.type === "single_select";
  const isMultiChoice = localQuestion.type === "single_select";
  const isDropdown = localQuestion.type === "combobox";
  const isScale = localQuestion.type === "range_slider";
  // Determine if any of the required scale labels are missing
  const areScaleLabelsMissing =
    isScale &&
    (!localQuestion.scaleLabels?.left?.trim() ||
      !localQuestion.scaleLabels?.center?.trim() ||
      !localQuestion.scaleLabels?.right?.trim());
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
        className="xl:max-w-[97%] xl:max-h-[97%] max-h-full max-w-full w-full h-full  "
        dir="rtl"
      >
        <DialogTitle className="sr-only">
          {isNewQuestion ? "ایجاد سوال جدید" : "ویرایش سوال"}
        </DialogTitle>
        <div className="flex h-full w-full overflow-hidden">
          {/* Left Sidebar with Settings */}
          <div className="w-80 border-l border-gray-200 bg-gray-50/50 flex flex-col">
            {/* Header section - fixed */}
            <div className="flex-shrink-0">
              <QuestionHeader
                question={localQuestion}
                isNewQuestion={isNewQuestion}
                inputRef={inputRef}
                onUpdateField={handleUpdateField}
              />
            </div>

            {/* Scrollable content section */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <QuestionSettingsSidebar
                  question={localQuestion}
                  onUpdateField={handleUpdateField}
                />
              </ScrollArea>
            </div>

            {/* Fixed footer with Save and Cancel buttons */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={
                    !hasChanges ||
                    !localQuestion.label.trim() ||
                    areScaleLabelsMissing
                  }
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

          {/* Right side Preview */}
          <div className="flex-1 overflow-hidden">
            <QuestionPreview question={localQuestion} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
