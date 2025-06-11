import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Upload, Trash2, Edit, Play, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth-context";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface AdTestQuestion {
  id: string;
  type: string;
  title: string;
  attachment?: string;
  attachment_type?: string;
  order: number;
}

interface AdTestUploaderProps {
  adTestType: "billboard" | "video" | "logo" | "brand" | "slogan";
  questions: AdTestQuestion[];
  onQuestionsUpdate: () => void;
}

const AdTestUploader: React.FC<AdTestUploaderProps> = ({
  adTestType,
  questions,
  onQuestionsUpdate,
}) => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  // Ref to store debounce timeouts for title updates
  const titleUpdateTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Filter statement questions that are not the first one (order !== 1) and have attachments
  const statementQuestions = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.attachment
  );

  const isVideoTest = adTestType === "video";
  const isBillboardOrLogoTest =
    adTestType === "billboard" || adTestType === "logo";

  // File upload configuration
  const maxSize = isVideoTest ? 209715200 : 20971520; // 200MB for video, 20MB for images
  const acceptedFiles = isVideoTest
    ? { "video/mp4": [".mp4"], "video/mkv": [".mkv"] }
    : { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

  // Helper function to get the correct prefix based on ad test type
  const getQuestionPrefix = (): string => {
    switch (adTestType) {
      case "video":
        return "[v]";
      case "billboard":
      case "logo":
        return "[5]";
      default:
        return `[${adTestType}]`;
    }
  };

  const uploadFile = async (file: File, questionIndex?: number) => {
    if (!accessToken || !id) {
      toast.error("خطا در احراز هویت");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (isVideoTest) {
        formData.append("video", file);

        // Simulate progress for video upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 5;
          });
        }, 200);

        const response = await fetch(`${BASE_URL}/api/v1/uploader/videos/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error("خطا در آپلود ویدئو");
        }

        const data = await response.json();
        const videoUrl = data.data.video_url;

        // Add or update question
        if (editingIndex !== null) {
          await updateQuestionAttachment(
            statementQuestions[editingIndex].id,
            videoUrl,
            "video"
          );
        } else {
          await addAdTestQuestion(videoUrl, "video");
        }
      } else {
        // Image upload
        formData.append("image", file);

        const response = await fetch(`${BASE_URL}/api/v1/uploader/images/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("خطا در آپلود تصویر");
        }

        const data = await response.json();
        const imageUrl = data.data.image_url;

        // Add or update question
        if (editingIndex !== null) {
          await updateQuestionAttachment(
            statementQuestions[editingIndex].id,
            imageUrl,
            "image"
          );
        } else {
          await addAdTestQuestion(imageUrl, "image");
        }
      }

      toast.success("فایل با موفقیت آپلود شد");
      setEditingIndex(null);
      onQuestionsUpdate();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addAdTestQuestion = async (
    attachmentUrl: string,
    attachmentType: string
  ) => {
    if (!accessToken || !id) return;

    try {
      // Prepare question data based on Vue.js logic - cleaner approach
      const questionData = {
        is_required: false,
        order: 2,
        type: "statement",
        title: getQuestionPrefix(),
        related_group: null,
        attachment: attachmentUrl,
        attachment_type: attachmentType,
      };

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/single-question-create/${id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(questionData),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در افزودن سوال");
      }

      const result = await response.json();
      console.log("Question created successfully:", result);
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  };

  const updateQuestionAttachment = async (
    questionId: string,
    attachmentUrl: string,
    attachmentType: string
  ) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${questionId}/questions/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            attachment: attachmentUrl,
            attachment_type: attachmentType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی سوال");
      }

      const result = await response.json();
      console.log("Question attachment updated successfully:", result);
    } catch (error) {
      console.error("Error updating question attachment:", error);
      throw error;
    }
  };

  const updateQuestionTitle = async (questionId: string, title: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${questionId}/questions/update/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ title }),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی عنوان");
      }

      const result = await response.json();
      console.log("Question title updated successfully:", result);
    } catch (error) {
      console.error("Error updating title:", error);
      // Don't throw here to prevent breaking the UI on title update failures
    }
  };

  const removeQuestion = async (questionIndex: number) => {
    if (!accessToken || !id) return;

    setRemovingIndex(questionIndex);

    try {
      const question = statementQuestions[questionIndex];
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${question.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در حذف سوال");
      }

      const result = await response.json();
      console.log("Question removed successfully:", result);

      toast.success("محتوا با موفقیت حذف شد");
      onQuestionsUpdate();
    } catch (error) {
      console.error("Error removing question:", error);
      toast.error("خطا در حذف محتوا");
    } finally {
      setRemovingIndex(null);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    [editingIndex]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles,
    maxSize,
    multiple: false,
    onDropRejected: (rejectedFiles) => {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        toast.error(
          `حجم فایل نباید بیشتر از ${isVideoTest ? "200" : "20"} مگابایت باشد`
        );
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        toast.error(
          isVideoTest
            ? "فقط فایل‌های MP4 و MKV پذیرفته می‌شوند"
            : "فقط فایل‌های PNG و JPG پذیرفته می‌شوند"
        );
      }
    },
  });

  const getDisplayTitle = (title: string) => {
    const match = title.match(/^\[.*?\]\s*/);
    return match ? title.slice(match[0].length) : title;
  };

  // Debounced function to update question title
  const debouncedUpdateTitle = useCallback(
    (questionId: string, newTitle: string) => {
      // Clear existing timeout for this question
      if (titleUpdateTimeouts.current[questionId]) {
        clearTimeout(titleUpdateTimeouts.current[questionId]);
      }

      // Set new debounced timeout
      titleUpdateTimeouts.current[questionId] = setTimeout(() => {
        updateQuestionTitle(questionId, newTitle);
        // Clean up the timeout reference
        delete titleUpdateTimeouts.current[questionId];
      }, 1500); // Wait 1.5 seconds after user stops typing
    },
    []
  );

  const handleTitleChange = (value: string, questionIndex: number) => {
    const question = statementQuestions[questionIndex];
    const prefixMatch = question.title.match(/^\[.*?\]\s*/);

    // Use consistent prefix logic with addAdTestQuestion
    const defaultPrefix = `${getQuestionPrefix()} `;
    const prefix = prefixMatch ? prefixMatch[0] : defaultPrefix;
    const newTitle = `${prefix}${value}`;

    // Use debounced update function
    debouncedUpdateTitle(question.id, newTitle);
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      Object.values(titleUpdateTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
      titleUpdateTimeouts.current = {};
    };
  }, []);

  return (
    <div className="w-full" dir="rtl">
      {/* Upload Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          لطفا محتوای خود را بارگذاری کنید:
        </h3>
      </div>

      {/* Drop Zone */}
      <div className="flex justify-center mb-8">
        <Card
          {...getRootProps()}
          className={`w-full max-w-2xl cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-blue-500 bg-blue-50 border-2"
              : "border-gray-300 border-2 border-dashed hover:border-gray-400"
          } ${isUploading ? "pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                {isUploading ? (
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    {isVideoTest && uploadProgress > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
                        {uploadProgress}%
                      </div>
                    )}
                  </div>
                ) : (
                  <Upload className="w-8 h-8 text-blue-600" />
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm leading-relaxed">
                {isVideoTest
                  ? "لطفاً هر فایل را به‌صورت جداگانه با حداکثر حجم ۲۰۰ مگابایت و در فرمت‌های MKV یا MP4 آپلود کنید. حداکثر تعداد فایل‌های قابل آپلود: ۷ فایل."
                  : "لطفاً هر فایل را به‌صورت جداگانه با حداکثر حجم ۲۰ مگابایت و در فرمت‌های PNG یا JPG آپلود کنید. حداکثر تعداد فایل‌های قابل آپلود: ۷ فایل."}
              </p>
            </div>

            {isVideoTest && uploadProgress > 0 && (
              <div className="w-full max-w-xs mt-4">
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Content Grid */}
      {statementQuestions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {statementQuestions.map((question, index) => (
            <Card key={question.id} className="overflow-hidden">
              <div className="aspect-square relative bg-gray-100">
                {isBillboardOrLogoTest ? (
                  <img
                    src={question.attachment || ""}
                    alt={`محتوا ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <video
                      src={question.attachment || ""}
                      className="max-w-full max-h-full object-contain"
                      controls={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-75" />
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                {/* Action Buttons */}
                <div className="flex justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    disabled={removingIndex === index}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingIndex(index);
                      // Trigger file selection
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = isVideoTest
                        ? "video/mp4,video/mkv"
                        : "image/jpeg,image/png";
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files[0]) {
                          uploadFile(files[0], index);
                        }
                      };
                      input.click();
                    }}
                    disabled={isUploading && editingIndex === index}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 h-auto"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    ویرایش
                  </Button>
                </div>

                {/* Title Input */}
                <Input
                  defaultValue={getDisplayTitle(question.title)}
                  onChange={(e) => handleTitleChange(e.target.value, index)}
                  className="text-xs"
                  placeholder="عنوان محتوا"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {statementQuestions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isVideoTest ? (
              <Play className="w-8 h-8 text-gray-400" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <p className="text-gray-500">
            هنوز محتوایی آپلود نشده است. فایل خود را در کادر بالا رها کنید.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdTestUploader;
