import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Video } from "lucide-react";
import type { Question } from "../../../../pages/QuestionnaireForm";
import ScaleQuestionSettings from "./question-types/ScaleQuestionSettings";
import PriorityQuestionSettings from "./question-types/PriorityQuestionSettings";
import RatingQuestionSettings from "./question-types/RatingQuestionSettings";
import TextQuestionSettings from "./question-types/TextQuestionSettings";
import NumberQuestionSettings from "./question-types/NumberQuestionSettings";
import ImageChoiceQuestionSettings from "./question-types/ImageChoiceQuestionSettings";
import MultiChoiceQuestionSettings from "./question-types/MultiChoiceQuestionSettings";
import DropdownQuestionSettings from "./question-types/DropdownQuestionSettings";
import MatrixQuestionSettings from "./question-types/MatrixQuestionSettings";
import ComboboxQuestionSettings from "./question-types/ComboboxQuestionSettings";

interface QuestionSettingsSidebarProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const QuestionSettingsSidebar: React.FC<QuestionSettingsSidebarProps> = ({
  question,
  onUpdateField,
}) => {
  const renderQuestionTypeSettings = () => {
    console.log("Question Type:", question.type);

    switch (question.type) {
      case "طیفی":
        return (
          <ScaleQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "اولویت‌دهی":
        return (
          <PriorityQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "درجه‌بندی":
      case "درجه بندی":
        return (
          <RatingQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "متنی کوتاه":
      case "متنی بلند":
        return (
          <TextQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "اعداد":
        return (
          <NumberQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "چندگزینه‌ای":
        return (
          <MultiChoiceQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "چند‌گزینه‌ای تصویری":
        return (
          <ImageChoiceQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "لیست کشویی":
        return (
          <ComboboxQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "ماتریسی":
        return (
          <MatrixQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      default:
        console.log("No matching question type found");
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <Label className="text-sm font-medium">توضیحات</Label>
        <Textarea
          value={question.description || ""}
          onChange={(e) => onUpdateField("description", e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">اجباری</Label>
        <Switch
          checked={question.required || false}
          onCheckedChange={(checked) => onUpdateField("required", checked)}
        />
      </div>

      {renderQuestionTypeSettings()}

      {["توضیحی", "متنی کوتاه", "متنی بلند", "اعداد"].includes(
        question.type
      ) && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">آپلود تصویر</Label>
            <Switch
              checked={question.allowImageUpload || false}
              onCheckedChange={(checked) =>
                onUpdateField("allowImageUpload", checked)
              }
            />
          </div>

          {question.allowImageUpload && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Handle image upload
              }}
            >
              <ImagePlus className="w-4 h-4 ml-2" />
              انتخاب تصویر
            </Button>
          )}
        </div>
      )}

      {question.type === "توضیحی" && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">آپلود ویدیو</Label>
            <Switch
              checked={question.allowVideoUpload || false}
              onCheckedChange={(checked) =>
                onUpdateField("allowVideoUpload", checked)
              }
            />
          </div>

          {question.allowVideoUpload && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Handle video upload
              }}
            >
              <Video className="w-4 h-4 ml-2" />
              انتخاب ویدیو
            </Button>
          )}
        </div>
      )}

      {question.type === "متن بدون پاسخ" && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">آپلود رسانه</Label>
            <Switch
              checked={question.hasMedia || false}
              onCheckedChange={(checked) => {
                onUpdateField("hasMedia", checked);
                if (!checked) {
                  onUpdateField("mediaType", undefined);
                }
              }}
            />
          </div>

          {question.hasMedia && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="image"
                  name="mediaType"
                  checked={question.mediaType === "image"}
                  onChange={() => onUpdateField("mediaType", "image")}
                  className="ml-2"
                />
                <Label htmlFor="image" className="text-sm font-medium">
                  تصویر
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="video"
                  name="mediaType"
                  checked={question.mediaType === "video"}
                  onChange={() => onUpdateField("mediaType", "video")}
                  className="ml-2"
                />
                <Label htmlFor="video" className="text-sm font-medium">
                  ویدئو
                </Label>
              </div>

              {question.mediaType && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Handle media upload based on type
                  }}
                >
                  {question.mediaType === "image" ? (
                    <ImagePlus className="w-4 h-4 ml-2" />
                  ) : (
                    <Video className="w-4 h-4 ml-2" />
                  )}
                  انتخاب {question.mediaType === "image" ? "تصویر" : "ویدئو"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionSettingsSidebar;
 