import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import type { Question } from "../../../../pages/QuestionnaireForm";

interface DescriptionQuestionSettingsProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const DescriptionQuestionSettings: React.FC<
  DescriptionQuestionSettingsProps
> = ({ question, onUpdateField }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">آپلود رسانه</Label>
          <Switch
            checked={question.hasMedia || false}
            onCheckedChange={(checked) => {
              onUpdateField("hasMedia", checked);
              if (!checked) {
                onUpdateField("mediaType", undefined);
                onUpdateField("mediaUrl", undefined);
              } else if (!question.mediaType) {
                onUpdateField("mediaType", "image");
              }
            }}
          />
        </div>

        {question.hasMedia && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">نوع رسانه</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={question.mediaType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onUpdateField("mediaType", "image");
                  onUpdateField("mediaUrl", undefined);
                }}
              >
                تصویر
              </Button>
              <Button
                type="button"
                variant={question.mediaType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onUpdateField("mediaType", "video");
                  onUpdateField("mediaUrl", undefined);
                }}
              >
                ویدئو
              </Button>
            </div>

            {question.mediaType && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept =
                      question.mediaType === "image" ? "image/*" : "video/*";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const formData = new FormData();
                          formData.append(
                            question.mediaType === "image" ? "image" : "video",
                            file
                          );

                          const endpoint =
                            question.mediaType === "image"
                              ? "images"
                              : "videos";
                          const response = await fetch(
                            `${
                              import.meta.env.VITE_API_BASE_URL
                            }/api/v1/uploader/${endpoint}/`,
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
                            throw new Error(
                              `خطا در آپلود ${
                                question.mediaType === "image"
                                  ? "تصویر"
                                  : "ویدئو"
                              }`
                            );
                          }

                          const data = await response.json();
                          if (data.info.status === 201) {
                            const mediaUrl =
                              data.data[`${question.mediaType}_url`];
                            onUpdateField("mediaUrl", mediaUrl);
                            onUpdateField("attachment", mediaUrl);
                            onUpdateField(
                              "attachment_type",
                              question.mediaType
                            );
                            toast.success(
                              `${
                                question.mediaType === "image"
                                  ? "تصویر"
                                  : "ویدئو"
                              } با موفقیت آپلود شد`
                            );
                          } else {
                            throw new Error(data.info.message);
                          }
                        } catch (error) {
                          console.error(
                            `Error uploading ${question.mediaType}:`,
                            error
                          );
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : `خطا در آپلود ${
                                  question.mediaType === "image"
                                    ? "تصویر"
                                    : "ویدئو"
                                }`
                          );
                        }
                      }
                    };
                    input.click();
                  }}
                >
                  <ImagePlus className="w-4 h-4 ml-2" />
                  آپلود {question.mediaType === "image" ? "تصویر" : "ویدئو"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionQuestionSettings;
