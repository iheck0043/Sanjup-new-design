import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Question } from "../../pages/QuestionnaireForm";

interface QuestionHeaderProps {
  question: Question;
  isNewQuestion: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  question,
  isNewQuestion,
  inputRef,
  onUpdateField,
}) => {
  const isQuestionGroup = question.type === "گروه سوال";

  return (
    <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
          {question.type}
        </span>
      </div>
      <div>
        <Label htmlFor="question-label" className="text-sm font-medium">
          {isQuestionGroup ? "متن گروه سوال" : "عنوان سوال"}
          <span className="text-red-500 mr-1">*</span>
        </Label>
        <Input
          ref={inputRef}
          id="question-label"
          value={question.label}
          onChange={(e) => onUpdateField("label", e.target.value)}
          placeholder={
            isQuestionGroup
              ? "عنوان گروه سوال را وارد کنید"
              : "عنوان سوال را وارد کنید"
          }
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default QuestionHeader;
