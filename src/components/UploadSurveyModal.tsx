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
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh]">
          {/* Luxury Header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-900/20 dark:to-orange-800/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">بارگذاری نظرسنجی</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">ایمپورت از منابع مختلف</p>
              </div>
            </div>
            <div className="w-12" /> {/* Spacer */}
          </div>

          {/* Luxury Alert */}
          <div className="p-8 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4 text-orange-800 dark:text-orange-200">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-base font-medium">
                  لطفا روش بارگذاری نظرسنجی را انتخاب کنید
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  از پرس‌لاین یا فایل ورد ایمپورت کنید
                </p>
              </div>
            </div>
          </div>

          {/* Luxury Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-br from-slate-50/30 to-white dark:from-slate-900/30 dark:to-slate-800/30">
            {/* Import Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-900 dark:text-white block">
                روش بارگذاری
              </Label>
              <RadioGroup
                value={importType}
                onValueChange={(value: "porsline" | "word") => setImportType(value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <RadioGroupItem 
                    value="porsline" 
                    id="porsline" 
                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 dark:data-[state=checked]:bg-orange-500 dark:data-[state=checked]:border-orange-500"
                  />
                  <Label htmlFor="porsline" className="cursor-pointer text-base font-medium text-slate-700 dark:text-slate-300">
                    بارگذاری از پرس لاین
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <RadioGroupItem 
                    value="word" 
                    id="word" 
                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 dark:data-[state=checked]:bg-orange-500 dark:data-[state=checked]:border-orange-500"
                  />
                  <Label htmlFor="word" className="cursor-pointer text-base font-medium text-slate-700 dark:text-slate-300">
                    بارگذاری از فایل ورد
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Porsline Import Form */}
            {importType === "porsline" && (
              <div className="space-y-3">
                <Label htmlFor="pollLink" className="text-base font-semibold text-slate-900 dark:text-white block">
                  لینک نظرسنجی <span className="text-orange-500">*</span>
                </Label>
                <Input
                  id="pollLink"
                  value={pollLink}
                  onChange={(e) => setPollLink(e.target.value)}
                  placeholder="لینک نظرسنجی پرس لاین را وارد کنید"
                  maxLength={500}
                  required
                  className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500"
                />
              </div>
            )}

            {/* Word File Import Form */}
            {importType === "word" && (
              <div className="space-y-4">
                <Label className="text-base font-semibold text-slate-900 dark:text-white block">
                  فایل ورد <span className="text-orange-500">*</span>
                </Label>

                <div
                  className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${
                    isDragActive
                      ? "border-orange-400 bg-orange-50/50 dark:bg-orange-900/20 scale-105"
                      : "border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 hover:border-orange-300 dark:hover:border-orange-600"
                  } backdrop-blur-sm`}
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
                        <div className="space-y-6">
                          <div className="relative">
                            <Loader2 className="h-16 w-16 animate-spin mx-auto text-orange-600 dark:text-orange-400" />
                            <div className="absolute inset-4 h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                              در حال آپلود فایل...
                            </p>
                            <Progress
                              value={uploadProgress}
                              className="w-full h-3 bg-slate-200 dark:bg-slate-700"
                            />
                            <p className="text-base text-orange-600 dark:text-orange-400 font-medium">
                              {uploadProgress}%
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                              آپلود فایل ورد
                            </p>
                            <p className="text-base text-slate-600 dark:text-slate-400">
                              فایل را انتخاب کنید یا اینجا رها کنید
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                              فقط فایل‌های ورد (.doc, .docx) قابل قبول هستند
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-3 h-12 px-8 text-lg font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200"
                          >
                            <FileText className="h-5 w-5" />
                            انتخاب فایل
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!isGenerating ? (
                        <>
                          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                              فایل با موفقیت آپلود شد
                            </p>
                            <p className="text-base text-slate-600 dark:text-slate-400">
                              حالا می‌توانید نظرسنجی را بسازید
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={resetUpload}
                            className="flex items-center gap-3 h-12 px-8 text-lg font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                          >
                            <Upload className="h-5 w-5" />
                            آپلود فایل جدید
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-6">
                          <div className="relative">
                            <Loader2 className="h-16 w-16 animate-spin mx-auto text-orange-600 dark:text-orange-400" />
                            <div className="absolute inset-4 h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                              هوش مصنوعی در حال ساخت نظرسنجی
                            </p>
                            <p className="text-base text-slate-600 dark:text-slate-400">
                              لطفا صبر کنید، این فرآیند چند لحظه طول می‌کشد
                            </p>
                            
                            {/* Progress dots */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-200"></div>
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

          {/* Luxury Footer */}
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-8 bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || isGenerating}
                className="h-12 px-8 text-lg font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                بستن
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || isLoading || isGenerating}
                className="h-12 px-8 text-lg font-semibold bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-3"
              >
                {isLoading || isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
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
