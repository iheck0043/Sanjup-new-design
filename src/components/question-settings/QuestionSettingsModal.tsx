
import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Question } from "../../pages/Index";
import QuestionHeader from "./QuestionHeader";
import QuestionSettingsSidebar from "./QuestionSettingsSidebar";
import QuestionPreview from "./QuestionPreview";

interface QuestionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
  onSave: (question: Question) => void;
  isNewQuestion: boolean;
}

const QuestionSettingsModal: React.FC<QuestionSettingsModalProps> = ({
  isOpen,
  onClose,
  question,
  onUpdateField,
  onSave,
  isNewQuestion,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuestion, setLocalQuestion] = useState<Question>(question);

  useEffect(() => {
    console.log("QuestionSettingsModal - Question prop changed:", question);
    setLocalQuestion(question);
  }, [question]);

  const handleUpdateField = (field: keyof Question, value: any) => {
    console.log(
      "QuestionSettingsModal - Updating field:",
      field,
      "with value:",
      value
    );
    const updated = { ...localQuestion, [field]: value };
    console.log("QuestionSettingsModal - Updated question:", updated);
    setLocalQuestion(updated);
    onUpdateField(field, value);
  };

  useEffect(() => {
    if (question) {
      if (isNewQuestion) {
        console.log("QuestionSettingsModal - Initializing new question");
        const initialQuestion = {
          ...question,
          title: question.title || "سوال جدید",
          label: question.label || "سوال جدید",
          required: true,
          hasMedia: false,
          mediaType: undefined,
          mediaUrl: undefined,
          attachment: undefined,
          attachment_type: undefined,
        };
        setLocalQuestion(initialQuestion);
        onUpdateField("title", initialQuestion.title);
        onUpdateField("label", initialQuestion.label);
        onUpdateField("required", initialQuestion.required);
        onUpdateField("hasMedia", initialQuestion.hasMedia);
        onUpdateField("mediaType", initialQuestion.mediaType);
        onUpdateField("mediaUrl", initialQuestion.mediaUrl);
        onUpdateField("attachment", initialQuestion.attachment);
        onUpdateField("attachment_type", initialQuestion.attachment_type);
      } else {
        console.log("QuestionSettingsModal - Updating existing question");
        const updatedQuestion = {
          ...question,
          title: question.title || question.label || "",
          label: question.title || question.label || "",
          hasMedia: question.hasMedia || false,
          mediaType: question.mediaType || undefined,
          mediaUrl: question.mediaUrl || undefined,
          attachment: question.attachment || undefined,
          attachment_type: question.attachment_type || undefined,
        };
        setLocalQuestion(updatedQuestion);
        onUpdateField("title", updatedQuestion.title);
        onUpdateField("label", updatedQuestion.label);
        onUpdateField("hasMedia", updatedQuestion.hasMedia);
        onUpdateField("mediaType", updatedQuestion.mediaType);
        onUpdateField("mediaUrl", updatedQuestion.mediaUrl);
        onUpdateField("attachment", updatedQuestion.attachment);
        onUpdateField("attachment_type", updatedQuestion.attachment_type);
      }
    }
  }, [question, isNewQuestion]);

  console.log("QuestionSettingsModal - Current localQuestion:", localQuestion);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <QuestionHeader
                question={localQuestion}
                isNewQuestion={isNewQuestion}
                inputRef={inputRef}
                onUpdateField={handleUpdateField}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-2 h-full">
                <div className="border-l p-6">
                  <QuestionSettingsSidebar
                    question={localQuestion}
                    onUpdateField={handleUpdateField}
                  />
                </div>
                <div className="p-6">
                  <QuestionPreview question={localQuestion} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button onClick={() => onSave(localQuestion)}>ذخیره</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
