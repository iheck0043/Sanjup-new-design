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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold">بارگذاری نظرسنجی</h2>
            <div className="w-8" /> {/* Spacer */}
          </div>

          {/* Alert */}
          <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-center gap-3 text-blue-800">
              <Info className="h-5 w-5" />
              <p className="text-sm">
                لطفا روش بارگذاری نظرسنجی را انتخاب کنید
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Import Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-4 block">
                روش بارگذاری
              </Label>
              <RadioGroup
                value={importType}
                onValueChange={(value: "porsline" | "word") =>
                  setImportType(value)
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="porsline" id="porsline" />
                  <Label htmlFor="porsline" className="cursor-pointer">
                    بارگذاری از پرس لاین
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="word" id="word" />
                  <Label htmlFor="word" className="cursor-pointer">
                    بارگذاری از فایل ورد
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Porsline Import Form */}
            {importType === "porsline" && (
              <div>
                <Label
                  htmlFor="pollLink"
                  className="text-sm font-medium mb-2 block"
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
                />
              </div>
            )}

            {/* Word File Import Form */}
            {importType === "word" && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  فایل ورد <span className="text-red-500">*</span>
                </Label>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
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
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="space-y-3">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              در حال آپلود فایل...
                            </p>
                            <Progress
                              value={uploadProgress}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                              {uploadProgress}%
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 mx-auto text-gray-400" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              آپلود فایل ورد
                            </p>
                            <p className="text-xs text-gray-500">
                              فایل را انتخاب کنید یا اینجا رها کنید
                            </p>
                            <p className="text-xs text-gray-400">
                              فقط فایل‌های ورد (.doc, .docx) قابل قبول هستند
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            آپلود فایل
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!isGenerating ? (
                        <>
                          <CheckCircle2 className="h-10 w-10 mx-auto text-green-600" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              فایل با موفقیت آپلود شد
                            </p>
                            <p className="text-xs text-gray-500">
                              حالا می‌توانید نظرسنجی را بسازید
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetUpload}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            آپلود فایل جدید
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              هوش مصنوعی در حال ساخت نظرسنجی
                            </p>
                            <p className="text-xs text-gray-500">
                              لطفا صبر کنید...
                            </p>
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
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || isGenerating}
              >
                بستن
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || isLoading || isGenerating}
                className="flex items-center gap-2"
              >
                {isLoading || isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isGenerating ? "در حال ساخت..." : "در حال پردازش..."}
                  </>
                ) : (
                  "ساخت نظرسنجی"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSurveyModal;
