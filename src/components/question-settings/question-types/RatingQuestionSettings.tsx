
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Question } from "../../../types/question";

interface RatingQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const RatingQuestionSettings: React.FC<RatingQuestionSettingsProps> = ({
  question,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">تعداد ستاره‌ها</Label>
        <Input
          type="number"
          min="3"
          max="10"
          value={question.maxNumber || 5}
          onChange={(e) => onUpdateField("maxNumber", parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">نوع نمایش</Label>
        <Select
          value={question.mediaType || "star"}
          onValueChange={(value) => onUpdateField("mediaType", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="star">ستاره</SelectItem>
            <SelectItem value="heart">قلب</SelectItem>
            <SelectItem value="thumbs">لایک</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RatingQuestionSettings;
