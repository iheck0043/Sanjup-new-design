import React, { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Progress } from "./ui/progress";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  uploadFile,
  generateAISurveyFromFile,
  importPorslineSurvey,
} from "@/lib/api";

interface UploadSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSurveyCreated: (surveyId: string) => void;
}

const UploadSurveyModal: React.FC<UploadSurveyModalProps> = ({
  open,
  onOpenChange,
  onSurveyCreated,
}) => {
  const { accessToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importType, setImportType] = useState<"porsline" | "word">("word");
  const [pollLink, setPollLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const resetForm = () => {
    setImportType("word");
    setPollLink("");
    setUploadProgress(0);
    setUploadedFileUrl("");
    setIsGenerating(false);
    setIsDragActive(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "فقط فایل‌های ورد (.doc, .docx) قابل قبول هستند";
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      return "حجم فایل بیشتر از 2 مگابایت می باشد";
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await uploadFile(formData, accessToken);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response?.data?.full_url) {
        setUploadedFileUrl(response.data.full_url);
        toast.success("فایل با موفقیت آپلود شد");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("خطا در بارگذاری فایل");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedFileUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const transformPorslineUrl = (url: string): string => {
    const surveyId = url.split("/").pop();
    return `https://survey.porsline.ir/api/surveys/${surveyId}/responders/`;
  };

  const createQuestionnaireFromFile = async () => {
    if (!uploadedFileUrl || !accessToken) return;

    setIsGenerating(true);
    try {
      const response = await generateAISurveyFromFile(
        uploadedFileUrl,
        accessToken
      );

      if (response?.data?.id) {
        toast.success("نظرسنجی در حال ساخت است", {
          description: "لطفا لحظاتی دیگر به صفحه نظرسنجی‌ها مراجعه کنید",
          duration: 5000,
        });

        handleClose();
        // Navigate to surveys page instead of specific questionnaire
        // since it's still being processed
        window.location.href = "/surveys";
      }
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      toast.error("خطا در ساخت نظرسنجی");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    if (importType === "porsline") {
      if (!pollLink.trim()) {
        toast.error("لطفا لینک نظرسنجی را وارد کنید");
        return;
      }

      setIsLoading(true);
      try {
        const transformedUrl = transformPorslineUrl(pollLink);
        const response = await importPorslineSurvey(
          transformedUrl,
          accessToken
        );

        if (response?.data?.id) {
          toast.success("نظرسنجی با موفقیت ایمپورت شد", {
            description: "در حال انتقال به صفحه طراحی نظرسنجی...",
            duration: 2000,
          });

          handleClose();
          onSurveyCreated(response.data.id);
        }
      } catch (error) {
        console.error("Error importing poll:", error);
        toast.error("خطا در ایمپورت نظرسنجی");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Word file import
      if (!uploadedFileUrl) {
        toast.error("لطفا ابتدا فایل ورد را آپلود کنید");
        return;
      }
      await createQuestionnaireFromFile();
    }
  };

  const isFormValid = () => {
    if (importType === "porsline") {
      return pollLink.trim() !== "";
    } else {
      return uploadedFileUrl !== "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh]">
          {/* Header */}
          <div className="pb-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right mb-1">
                  بارگذاری نظرسنجی
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 text-right">
                  ایمپورت از پرس‌لاین یا فایل ورد
                </p>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <div className="text-gray-800 dark:text-slate-200">
              <p className="text-sm font-medium">
                لطفا روش بارگذاری نظرسنجی را انتخاب کنید
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                از پرس‌لاین یا فایل ورد ایمپورت کنید
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-slate-900">
            {/* Import Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white block">
                روش بارگذاری
              </Label>
              <RadioGroup
                value={importType}
                onValueChange={(value: "porsline" | "word") =>
                  setImportType(value)
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <RadioGroupItem
                    value="porsline"
                    id="porsline"
                    className="data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 dark:data-[state=checked]:bg-slate-500 dark:data-[state=checked]:border-slate-500"
                  />
                  <Label
                    htmlFor="porsline"
                    className="cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    بارگذاری از پرس لاین
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <RadioGroupItem
                    value="word"
                    id="word"
                    className="data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 dark:data-[state=checked]:bg-slate-500 dark:data-[state=checked]:border-slate-500"
                  />
                  <Label
                    htmlFor="word"
                    className="cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    بارگذاری از فایل ورد
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Porsline Import Form */}
            {importType === "porsline" && (
              <div className="space-y-3">
                <Label
                  htmlFor="pollLink"
                  className="text-sm font-semibold text-gray-900 dark:text-white block"
                >
                  لینک نظرسنجی <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pollLink"
                  value={pollLink}
                  onChange={(e) => setPollLink(e.target.value)}
                  placeholder="لینک نظرسنجی پرس لاین را وارد کنید"
                  maxLength={500}
                  required
                  className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Word File Import Form */}
            {importType === "word" && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white block">
                  فایل ورد <span className="text-red-500">*</span>
                </Label>

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                    isDragActive
                      ? "border-gray-400 bg-gray-50 dark:bg-slate-700"
                      : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-500"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!uploadedFileUrl ? (
                    <div className="space-y-6">
                      {isLoading ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-600 dark:text-slate-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              در حال آپلود فایل...
                            </p>
                            <Progress
                              value={uploadProgress}
                              className="w-full h-2 bg-gray-200 dark:bg-slate-700"
                            />
                            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                              {uploadProgress}%
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto">
                            <Upload className="h-6 w-6 text-gray-600 dark:text-slate-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              آپلود فایل ورد
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              فایل را انتخاب کنید یا اینجا رها کنید
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">
                              فقط فایل‌های ورد (.doc, .docx) قابل قبول هستند
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 h-9 px-4 text-sm font-medium bg-white dark:bg-slate-700 text-gray-700 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200"
                          >
                            <FileText className="h-4 w-4" />
                            انتخاب فایل
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!isGenerating ? (
                        <>
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              فایل با موفقیت آپلود شد
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              حالا می‌توانید نظرسنجی را بسازید
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetUpload}
                            className="flex items-center gap-2 h-9 px-4 text-sm font-medium bg-white dark:bg-slate-700 text-gray-700 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200"
                          >
                            <Upload className="h-4 w-4" />
                            آپلود فایل جدید
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-600 dark:text-slate-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              هوش مصنوعی در حال ساخت نظرسنجی
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              لطفا صبر کنید، این فرآیند چند لحظه طول می‌کشد
                            </p>

                            {/* Progress dots */}
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-orange-50/30 dark:from-slate-800 dark:to-slate-700 px-6 py-4 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isGenerating}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              بستن
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading || isGenerating}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading || isGenerating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isGenerating ? "در حال ساخت..." : "در حال پردازش..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  ساخت نظرسنجی
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSurveyModal;
