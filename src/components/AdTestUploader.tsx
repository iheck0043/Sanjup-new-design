import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Upload, Trash2, Edit, Play, Image as ImageIcon, Edit2, Check, X } from "lucide-react";
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
  
  // Video management states
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  // Ref to store debounce timeouts for title updates
  const titleUpdateTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Filter statement questions that are not the first one (order !== 1) and have attachments
  const statementQuestions = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.attachment
  );

  const isVideoTest = adTestType === "video";
  const isBillboardOrLogoTest =
    adTestType === "billboard" || adTestType === "logo";

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

  // Helper function to get display title without prefix
  const getDisplayTitle = (title: string) => {
    const match = title.match(/^\[.*?\]\s*/);
    return match ? title.slice(match[0].length) : title;
  };

  // File upload configuration
  const maxSize = isVideoTest ? 209715200 : 20971520; // 200MB for video, 20MB for images
  const acceptedFiles = isVideoTest
    ? { "video/mp4": [".mp4"], "video/mkv": [".mkv"] }
    : { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

  // For video tests, convert questions to video format
  const uploadedVideos = isVideoTest ? statementQuestions.map(q => ({
    id: q.id,
    name: q.title || "ویدیو بدون نام",
    url: q.attachment || "",
    type: "video/mp4",
    title: getDisplayTitle(q.title)
  })) : [];

  // Select first video by default
  useEffect(() => {
    if (isVideoTest && uploadedVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(uploadedVideos[0].id);
    }
  }, [uploadedVideos, selectedVideo, isVideoTest]);

  // Dropzone setup
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

  // Video management functions
  const handleEditVideo = (videoId: string) => {
    const video = uploadedVideos.find(v => v.id === videoId);
    if (video) {
      setEditingVideo(videoId);
      setEditingTitle(video.title || "");
    }
  };

  const handleSaveEdit = async () => {
    if (editingVideo && editingTitle.trim()) {
      const prefix = getQuestionPrefix() + " ";
      const newTitle = prefix + editingTitle.trim();
      
      try {
        await updateQuestionTitle(editingVideo, newTitle);
        setEditingVideo(null);
        setEditingTitle("");
        onQuestionsUpdate();
        toast.success("عنوان ویدئو بروزرسانی شد");
      } catch (error) {
        toast.error("خطا در بروزرسانی عنوان");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditingTitle("");
  };

  const handleDeleteVideo = async (videoId: string) => {
    const videoIndex = statementQuestions.findIndex(q => q.id === videoId);
    if (videoIndex !== -1) {
      await removeQuestion(videoIndex);
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

        // Use XMLHttpRequest for proper progress tracking
        const xhr = new XMLHttpRequest();
        
        // Set up progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        // Create promise to handle the request
        const response = await new Promise<Response>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Create a Response-like object
              const response = {
                ok: true,
                status: xhr.status,
                json: () => Promise.resolve(JSON.parse(xhr.responseText))
              } as Response;
              resolve(response);
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error'));
          
          xhr.open('POST', `${BASE_URL}/api/v1/uploader/videos/`);
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
          xhr.send(formData);
        });

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
      {/* Video Upload for Video Tests */}
      {isVideoTest && (
        <div className="mb-8">
          {/* Upload Area */}
          <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 border border-gray-600/50 shadow-xl">
            {isUploading && (
              <div className="flex items-center justify-end space-x-2 space-x-reverse mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">در حال آپلود...</span>
              </div>
            )}

            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`relative cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "transform scale-[1.02]"
                  : "hover:transform hover:scale-[1.01]"
              } ${isUploading ? "pointer-events-none opacity-75" : ""}`}
            >
              <input {...getInputProps()} />
              <div className={`
                relative bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border-2 border-dashed transition-all duration-300 backdrop-blur-sm
                ${isDragActive 
                  ? "border-red-400 bg-red-500/10 shadow-lg shadow-red-500/20" 
                  : "border-gray-500 hover:border-red-500/50 hover:bg-red-500/5"
                }
              `}>
                <div className="flex flex-col items-center justify-center py-6 px-8">
                  {/* Icon */}
                  <div className="relative mb-4">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg
                      ${isDragActive 
                        ? "bg-red-600 shadow-red-500/30" 
                        : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                      }
                    `}>
                      {isUploading ? (
                        <div className="relative">
                          <div className="w-10 h-10 border-4 border-red-200 border-t-white rounded-full animate-spin"></div>
                          {uploadProgress > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                              {uploadProgress}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {/* Glow Effect */}
                    <div className={`
                      absolute inset-0 w-16 h-16 rounded-2xl transition-all duration-300
                      ${isDragActive 
                        ? "bg-red-400/20 blur-xl" 
                        : "bg-red-600/20 blur-lg hover:bg-red-500/30"
                      }
                    `}></div>
                  </div>

                  {/* Text */}
                  <div className="text-center space-y-1">
                    <h3 className={`
                      text-base font-bold transition-colors duration-300
                      ${isDragActive ? "text-red-300" : "text-white"}
                    `}>
                      {isDragActive 
                        ? "فایل را اینجا رها کنید" 
                        : isUploading 
                          ? "در حال آپلود ویدئو..." 
                          : "ویدئو تبلیغاتی خود را آپلود کنید"
                      }
                    </h3>
                    {!isUploading && (
                      <p className={`
                        text-xs transition-colors duration-300 leading-relaxed
                        ${isDragActive ? "text-red-200" : "text-gray-300"}
                      `}>
                        فرمت‌های پشتیبانی شده: MP4, MKV • حداکثر حجم: ۲۰۰ مگابایت
                      </p>
                    )}
                    {!isDragActive && !isUploading && (
                      <div className="flex items-center justify-center space-x-4 space-x-reverse mt-2">
                        <div className="flex items-center space-x-2 space-x-reverse text-gray-400 text-xs">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>کلیک کنید یا فایل را بکشید</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isUploading && uploadProgress > 0 && (
                    <div className="w-full max-w-md mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">پیشرفت آپلود</span>
                        <span className="text-xs text-red-400 font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Header for non-video tests */}
      {!isVideoTest && (
        <>
          {/* Compact Drop Zone for Billboard, Regular for others */}
          <div className={`flex justify-center ${adTestType === "billboard" ? "mb-0" : "mb-8"}`}>
            <div
              {...getRootProps()}
              className={`w-full cursor-pointer transition-all duration-300 ${
                adTestType === "billboard" ? "max-w-full" : "max-w-2xl"
              } ${
                isDragActive
                  ? "transform scale-[1.02]"
                  : "hover:transform hover:scale-[1.01]"
              } ${isUploading ? "pointer-events-none opacity-75" : ""}`}
            >
              <input {...getInputProps()} />
              <div className={`
                relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed transition-all duration-300 shadow-lg
                ${isDragActive 
                  ? "border-blue-400 bg-blue-50 shadow-blue-500/20" 
                  : "border-gray-300 hover:border-blue-400/50 hover:bg-blue-50/30"
                }
              `}>
                {adTestType === "billboard" ? (
                  /* Compact Billboard Upload */
                  <div className="flex items-center justify-between p-4">
                    {/* Left side - Icon and Text */}
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="relative">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md
                          ${isDragActive 
                            ? "bg-blue-500 shadow-blue-500/30" 
                            : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
                          }
                        `}>
                          {isUploading ? (
                            <div className="w-6 h-6 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <ImageIcon className="w-6 h-6 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className={`
                          text-base font-semibold transition-colors duration-300
                          ${isDragActive ? "text-blue-600" : "text-gray-800"}
                        `}>
                          {isDragActive 
                            ? "فایل را اینجا رها کنید" 
                            : isUploading 
                              ? "در حال آپلود..." 
                              : "آپلود بیلبورد جدید"
                          }
                        </h3>
                        {!isUploading && (
                          <p className={`
                            text-xs transition-colors duration-300
                            ${isDragActive ? "text-blue-700" : "text-gray-500"}
                          `}>
                            PNG, JPG • حداکثر ۲۰ مگابایت
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Upload indicator */}
                    {!isUploading && (
                      <div className="text-gray-400 text-xs">
                        کلیک یا کشیدن
                      </div>
                    )}
                    
                    {/* Progress bar for billboard */}
                    {isUploading && (
                      <div className="text-blue-600 text-xs font-medium">
                        آپلود...
                      </div>
                    )}
                  </div>
                ) : adTestType === "logo" ? (
                  /* Compact Logo Upload */
                  <div className="flex items-center justify-between p-4">
                    {/* Left side - Icon and Text */}
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="relative">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md
                          ${isDragActive 
                            ? "bg-purple-500 shadow-purple-500/30" 
                            : "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
                          }
                        `}>
                          {isUploading ? (
                            <div className="w-6 h-6 border-2 border-purple-200 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <ImageIcon className="w-6 h-6 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className={`
                          text-base font-semibold transition-colors duration-300
                          ${isDragActive ? "text-purple-600" : "text-gray-800"}
                        `}>
                          {isDragActive 
                            ? "فایل را اینجا رها کنید" 
                            : isUploading 
                              ? "در حال آپلود..." 
                              : "آپلود لوگو جدید"
                          }
                        </h3>
                        {!isUploading && (
                          <p className={`
                            text-xs transition-colors duration-300
                            ${isDragActive ? "text-purple-700" : "text-gray-500"}
                          `}>
                            PNG, JPG • حداکثر ۲۰ مگابایت
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Upload indicator */}
                    {!isUploading && (
                      <div className="text-gray-400 text-xs">
                        کلیک یا کشیدن
                      </div>
                    )}
                    
                    {/* Progress bar for logo */}
                    {isUploading && (
                      <div className="text-purple-600 text-xs font-medium">
                        آپلود...
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular Upload for other types */
                  <div className="flex flex-col items-center justify-center py-16 px-8">
                    {/* Icon */}
                    <div className="relative mb-8">
                      <div className={`
                        w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg
                        ${isDragActive 
                          ? "bg-blue-500 shadow-blue-500/30" 
                          : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
                        }
                      `}>
                        {isUploading ? (
                          <div className="relative">
                            <div className="w-14 h-14 border-4 border-blue-200 border-t-white rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <ImageIcon className="w-12 h-12 text-white" />
                        )}
                      </div>
                      {/* Glow Effect */}
                      <div className={`
                        absolute inset-0 w-24 h-24 rounded-2xl transition-all duration-300
                        ${isDragActive 
                          ? "bg-blue-400/20 blur-xl" 
                          : "bg-blue-500/20 blur-lg hover:bg-blue-400/30"
                        }
                      `}></div>
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-3">
                      <h3 className={`
                        text-xl font-bold transition-colors duration-300
                        ${isDragActive ? "text-blue-600" : "text-gray-800"}
                      `}>
                        {isDragActive 
                          ? "فایل را اینجا رها کنید" 
                          : isUploading 
                            ? "در حال آپلود تصویر..." 
                            : "تصویر تبلیغاتی خود را آپلود کنید"
                        }
                      </h3>
                      {!isUploading && (
                        <p className={`
                          text-sm transition-colors duration-300 leading-relaxed max-w-md
                          ${isDragActive ? "text-blue-700" : "text-gray-600"}
                        `}>
                          فرمت‌های پشتیبانی شده: PNG, JPG • حداکثر حجم: ۲۰ مگابایت • حداکثر ۷ فایل
                        </p>
                      )}
                      {!isDragActive && !isUploading && (
                        <div className="flex items-center justify-center space-x-4 space-x-reverse mt-6">
                          <div className="flex items-center space-x-2 space-x-reverse text-gray-500 text-sm">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            <span>کلیک کنید یا فایل را بکشید و رها کنید</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Uploaded Content Grid - Only for non-video, non-billboard, and non-logo tests */}
      {!isVideoTest && adTestType !== "billboard" && adTestType !== "logo" && statementQuestions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {statementQuestions.map((question, index) => (
            <Card key={question.id} className="overflow-hidden">
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={question.attachment || ""}
                  alt={`محتوا ${index + 1}`}
                  className="w-full h-full object-contain"
                />
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
                      input.accept = "image/jpeg,image/png";
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

      {/* Empty State - Only for non-video, non-billboard, and non-logo tests */}
      {!isVideoTest && adTestType !== "billboard" && adTestType !== "logo" && statementQuestions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
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
