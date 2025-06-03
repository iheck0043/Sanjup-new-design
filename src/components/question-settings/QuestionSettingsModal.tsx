import React, { useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Question } from "../../pages/QuestionnaireForm";
import QuestionHeader from "./QuestionHeader";
import QuestionSettingsSidebar from "./QuestionSettingsSidebar";
import QuestionPreview from "./QuestionPreview";

interface QuestionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
  onSave: () => void;
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

  useEffect(() => {
    if (isOpen && isNewQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isNewQuestion]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <QuestionHeader
                question={question}
                isNewQuestion={isNewQuestion}
                inputRef={inputRef}
                onUpdateField={onUpdateField}
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
                    question={question}
                    onUpdateField={onUpdateField}
                  />
                </div>
                <div className="p-6">
                  <QuestionPreview question={question} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button onClick={onSave}>ذخیره</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
