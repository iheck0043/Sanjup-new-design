import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Question } from "../../pages/QuestionnaireForm";
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
import DescriptionQuestionSettings from "./question-types/DescriptionQuestionSettings";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface QuestionSettingsSidebarProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const QuestionSettingsSidebar: React.FC<QuestionSettingsSidebarProps> = ({
  question,
  onUpdateField,
}) => {
  const [isMediaEnabled, setIsMediaEnabled] = useState(
    question.hasMedia === true
  );

  useEffect(() => {
    setIsMediaEnabled(question.hasMedia === true);
  }, [question.hasMedia]);

  console.log("QuestionSettingsSidebar - Full question object:", question);
  console.log("QuestionSettingsSidebar - hasMedia:", question.hasMedia);
  console.log("QuestionSettingsSidebar - mediaType:", question.mediaType);

  const renderQuestionTypeSettings = () => {
    console.log("QuestionSettingsSidebar - Question Type:", question.type);
    console.log("QuestionSettingsSidebar - Question:", question);

    switch (question.type) {
      case "text_question_short":
      case "text_question_long":
      case "text_question_email":
        return (
          <TextQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "single_select":
      case "multi_select":
        return (
          <MultiChoiceQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "combobox":
        return (
          <ComboboxQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "range_slider":
        return (
          <ScaleQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "number_descriptive":
        return (
          <NumberQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "matrix":
        return (
          <MatrixQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "prioritize":
        return (
          <PriorityQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "select_single_image":
      case "select_multi_image":
        return (
          <ImageChoiceQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "grading":
        return (
          <RatingQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "email":
        return (
          <TextQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      case "question_group":
        return (
          <div className="p-4 text-sm text-gray-500">
            تنظیمات برای این نوع سوال در دسترس نیست.
          </div>
        );
      case "statement":
        return (
          <DescriptionQuestionSettings
            question={question}
            onUpdateField={onUpdateField}
          />
        );
      default:
        console.log("QuestionSettingsSidebar - Unknown type:", question.type);
        return (
          <div className="p-4 text-sm text-gray-500">
            تنظیمات برای این نوع سوال در دسترس نیست.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 text-right">
      <div>
        <Label className="text-sm font-medium">توضیحات</Label>
        <Textarea
          value={question.description || ""}
          onChange={(e) => onUpdateField("description", e.target.value)}
          className="mt-1 text-right"
          rows={3}
        />
      </div>

      {/* Required toggle (hidden for statement and question_group) */}
      {!["statement", "question_group"].includes(question.type) && (
        <div className="flex items-center justify-between">
          <Switch
            checked={question.required || false}
            onCheckedChange={(checked) => onUpdateField("required", checked)}
          />
          <Label className="text-sm font-medium">اجباری</Label>
        </div>
      )}

      {renderQuestionTypeSettings()}

      {!["statement"].includes(question.type) && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Switch
              checked={isMediaEnabled}
              onCheckedChange={(checked) => {
                setIsMediaEnabled(checked);
                onUpdateField("hasMedia", checked);
                onUpdateField("mediaType", checked ? "image" : undefined);
                onUpdateField("mediaUrl", undefined);
                onUpdateField("attachment", undefined);
                onUpdateField("attachment_type", undefined);
              }}
            />
            <Label className="text-sm font-medium">آپلود تصویر</Label>
          </div>

          {isMediaEnabled && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    try {
                      const formData = new FormData();
                      formData.append("image", file);

                      const response = await fetch(
                        `${BASE_URL}/api/v1/uploader/images/`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "access_token"
                            )}`,
                          },
                          body: formData,
                        }
                      );

                      if (!response.ok) {
                        throw new Error("خطا در آپلود تصویر");
                      }

                      const data = await response.json();
                      if (data.info.status === 201) {
                        const full = data.data.full_url || data.data.image_url;
                        onUpdateField("hasMedia", true);
                        onUpdateField("mediaUrl", data.data.image_url);
                        onUpdateField("attachment", data.data.image_url);
                        // store absolute url for preview before save
                        // @ts-ignore
                        onUpdateField("full_url", full);
                        onUpdateField("attachment_type", "image");
                        toast.success("تصویر با موفقیت آپلود شد");
                      } else {
                        throw new Error(data.info.message);
                      }
                    } catch (error) {
                      console.error("Error uploading image:", error);
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "خطا در آپلود تصویر"
                      );
                    }
                  };
                  input.click();
                }}
              >
                <ImagePlus className="w-4 h-4 ml-2" />
                انتخاب تصویر
              </Button>

              {/* Preview uploaded media (image / video) */}
              {(question as any).full_url ||
              question.mediaUrl ||
              question.attachment
                ? (() => {
                    const attachmentPath =
                      (question as any).full_url ||
                      question.mediaUrl ||
                      question.attachment;
                    const apiBase = import.meta.env.VITE_API_BASE_URL;
                    const attachmentSrc = attachmentPath
                      ? attachmentPath.startsWith("http")
                        ? attachmentPath
                        : `${apiBase}/${attachmentPath}`
                      : null;

                    if (!attachmentSrc) return null;

                    const isVideoAttachment =
                      question.attachment_type === "video" ||
                      /\.(mp4|webm|ogg)(\?.*)?$/i.test(attachmentPath);

                    return (
                      <div className="relative mt-3">
                        {isVideoAttachment ? (
                          <video
                            src={attachmentSrc}
                            controls
                            className="w-full max-h-48 border rounded-md"
                          />
                        ) : (
                          <img
                            src={attachmentSrc}
                            alt="attachment"
                            className="w-full max-h-48 object-contain border rounded-md"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateField("hasMedia", false);
                            onUpdateField("mediaUrl", undefined);
                            onUpdateField("attachment", undefined);
                            onUpdateField("attachment_type", undefined);
                            // @ts-ignore
                            onUpdateField("full_url", undefined);
                            // keep media section open for re-upload
                            setIsMediaEnabled(true);
                          }}
                          className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })()
                : null}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionSettingsSidebar;
