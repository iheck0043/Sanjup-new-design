import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  generateAISurvey,
  checkAISurveyStatus,
  type AISurveyRequest,
} from "@/lib/api";

interface AISurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSurveyCreated?: (surveyId: string) => void;
}

const AISurveyModal: React.FC<AISurveyModalProps> = ({
  open,
  onOpenChange,
  onSurveyCreated,
}) => {
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    target: "",
    category: "",
    preferred_question_type: [] as string[],
    question_count: "",
    sample_topics: "",
    tone: "",
    brand_name: "",
    competitors: "",
  });

  // Options
  const categories = [
    "تست محصول و تجربه کاربری",
    "تحلیل رقبا",
    "رضایت مشتری",
    "افکارسنجی",
    "ارزیابی عملکرد کمپین تبلیغاتی",
    "ارزیابی محصول/ ارزیابی برند",
    "اعتبار سنجی ایده یا محصول جدید",
    "رفتار خرید",
    "تحلیل نیازها و ترجیحات مشتری",
    "سایر",
  ];

  const questionCountOptions = [
    { title: "1 تا 5", value: "1-5" },
    { title: "6 تا 10", value: "6-10" },
    { title: "11 تا 15", value: "11-15" },
    { title: "16 تا 20", value: "16-20" },
    { title: "20 تا 30", value: "20-30" },
  ];

  const styleOptions = [
    { title: "رسمی", value: "formal" },
    { title: "نیمه‌رسمی", value: "semi-formal" },
    { title: "دوستانه", value: "informal" },
  ];

  const questionTypes = [
    { id: "single_select", label: "سوال چند گزینه ای" },
    { id: "multi_select", label: "سوال چند گزینه ای چند انتخابی" },
    { id: "text_question_short", label: "سوال متنی کوتاه" },
    { id: "text_question_long", label: "سوال متنی بلند" },
    { id: "range_slider", label: "سوال طیفی" },
    { id: "select_single_image", label: "سوال کشویی یا لیست انتخاب" },
    { id: "prioritize", label: "سوال اولویت دهی یا رتبه‌دهی" },
    { id: "matrix", label: "سوال ماتریسی" },
  ];

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionTypeChange = (typeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferred_question_type: checked
        ? [...prev.preferred_question_type, typeId]
        : prev.preferred_question_type.filter((id) => id !== typeId),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      summary: "",
      target: "",
      category: "",
      preferred_question_type: [],
      question_count: "",
      sample_topics: "",
      tone: "",
      brand_name: "",
      competitors: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("لطفا عنوان نظرسنجی را وارد کنید");
      return;
    }
    if (!formData.summary.trim()) {
      toast.error("لطفا هدف نظرسنجی را وارد کنید");
      return;
    }
    if (!formData.category) {
      toast.error("لطفا دسته بندی نظرسنجی را انتخاب کنید");
      return;
    }
    if (!formData.question_count) {
      toast.error("لطفا تعداد سوالات را انتخاب کنید");
      return;
    }

    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setIsSubmitting(true);
    setIsGenerating(true);

    try {
      // Prepare payload with only non-empty values
      const payload: AISurveyRequest = {
        title: formData.title,
        summary: formData.summary,
        category: formData.category,
        question_count: formData.question_count,
      };

      if (formData.target) payload.target = formData.target;
      if (formData.preferred_question_type.length > 0) {
        payload.preferred_question_type = formData.preferred_question_type;
      }
      if (formData.sample_topics)
        payload.sample_topics = formData.sample_topics;
      if (formData.tone) payload.tone = formData.tone;
      if (formData.brand_name) payload.brand_name = formData.brand_name;
      if (formData.competitors) payload.competitors = formData.competitors;

      // Generate AI survey
      const generateResponse = await generateAISurvey(payload, accessToken);

      if (generateResponse.data?.id) {
        // Wait 10 seconds then check status
        setTimeout(async () => {
          try {
            const statusResponse = await checkAISurveyStatus(
              generateResponse.data.id,
              accessToken
            );

            if (statusResponse.data?.questionnaire) {
              toast.success("نظرسنجی با موفقیت ایجاد شد");
              onSurveyCreated?.(statusResponse.data.questionnaire);
              onOpenChange(false);
              resetForm();
            } else {
              toast.info(
                "نظرسنجی شما در حال ساخت است. لطفا لحظاتی دیگر به صفحه نظرسنجی‌ها مراجعه کنید."
              );
              onOpenChange(false);
              resetForm();
            }
          } catch (error) {
            console.error("Error checking survey status:", error);
            toast.error("متاسفانه در بررسی وضعیت نظرسنجی مشکلی پیش آمد");
          } finally {
            setIsSubmitting(false);
            setIsGenerating(false);
          }
        }, 10000);
      }
    } catch (error) {
      console.error("Error generating AI survey:", error);
      toast.error(
        "متاسفانه در ایجاد نظرسنجی مشکلی پیش آمد. لطفا دوباره تلاش کنید."
      );
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh]">
          {/* Header */}
          <div className="pb-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 px-6 py-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right mb-1">
                  طراحی نظرسنجی با هوش مصنوعی
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 text-right">
                  ایجاد نظرسنجی هوشمند و پیشرفته با کمک AI
                </p>
              </div>
            </div>
            {/* Loading Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl flex items-center justify-center z-50 rounded-2xl">
                <div className="text-center">
                  <div className="relative mb-6">
                    <Loader2 className="h-16 w-16 animate-spin text-purple-500 mx-auto" />
                    <div
                      className="absolute inset-3 h-10 w-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"
                      style={{
                        animationDirection: "reverse",
                        animationDuration: "1.5s",
                      }}
                    ></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    هوش مصنوعی در حال طراحی نظرسنجی شما...
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 text-sm">
                    لطفا صبر کنید، این فرآیند چند لحظه طول می‌کشد
                  </p>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alert */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <div className="text-gray-800 dark:text-slate-200">
              <p className="text-sm font-medium">
                لطفا اطلاعات مورد نیاز برای طراحی نظرسنجی با هوش مصنوعی را وارد
                کنید
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                فیلدهای ستاره‌دار اجباری هستند
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-slate-900">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                عنوان نظرسنجی <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="عنوان مناسب برای نظرسنجی خود را وارد کنید"
                required
                className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label
                htmlFor="summary"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                هدف نظرسنجی <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="توضیح کوتاه در مورد اینکه این نظرسنجی برای چه چیزی هست"
                required
                rows={3}
                className="text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 resize-none placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white block">
                دسته بندی نظرسنجی <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400">
                  <SelectValue placeholder="دسته بندی را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target */}
            <div className="space-y-2">
              <Label
                htmlFor="target"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                مخاطب هدف
              </Label>
              <Input
                id="target"
                value={formData.target}
                onChange={(e) => handleInputChange("target", e.target.value)}
                placeholder="گروهی که قراره به سوالات پاسخ بدن"
                className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Question Types */}
            <Card className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm">
              <CardContent className="p-4">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-4 block">
                  نوع سوالاتی که می‌خواد داشته باشه
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center space-x-3 space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Checkbox
                        id={type.id}
                        checked={formData.preferred_question_type.includes(
                          type.id
                        )}
                        onCheckedChange={(checked) =>
                          handleQuestionTypeChange(type.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 dark:data-[state=checked]:bg-slate-500 dark:data-[state=checked]:border-slate-500 border-gray-400 dark:border-slate-500"
                      />
                      <Label
                        htmlFor={type.id}
                        className="text-xs text-gray-700 dark:text-slate-200 cursor-pointer"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Question Count and Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white block">
                  تعداد سوالات مورد نظر <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.question_count}
                  onValueChange={(value) =>
                    handleInputChange("question_count", value)
                  }
                >
                  <SelectTrigger className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder="تعداد سوالات را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg">
                    {questionCountOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white block">
                  استایل و لحن سوال‌ها
                </Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => handleInputChange("tone", value)}
                >
                  <SelectTrigger className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder="لحن سوالات را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg">
                    {styleOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sample Topics */}
            <div className="space-y-2">
              <Label
                htmlFor="sample_topics"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                سوال نمونه یا موضوعاتی که دوست داره توش باشه
              </Label>
              <Textarea
                id="sample_topics"
                value={formData.sample_topics}
                onChange={(e) =>
                  handleInputChange("sample_topics", e.target.value)
                }
                placeholder="مثال: می‌خوام حتماً سوالی درباره‌ی برند آگاهی توش باشه"
                rows={3}
                className="text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 resize-none placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Brand and Competitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="brand_name"
                  className="text-sm font-semibold text-gray-900 dark:text-white block"
                >
                  اسم شرکت / برند
                </Label>
                <Input
                  id="brand_name"
                  value={formData.brand_name}
                  onChange={(e) =>
                    handleInputChange("brand_name", e.target.value)
                  }
                  placeholder="نام شرکت یا برند خود را وارد کنید"
                  className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="competitors"
                  className="text-sm font-semibold text-gray-900 dark:text-white block"
                >
                  اسم رقبا
                </Label>
                <Input
                  id="competitors"
                  value={formData.competitors}
                  onChange={(e) =>
                    handleInputChange("competitors", e.target.value)
                  }
                  placeholder="نام رقبای اصلی را وارد کنید"
                  className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-purple-50/30 dark:from-slate-800 dark:to-slate-700 px-6 py-4 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              بستن
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال طراحی...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  طراحی با هوش مصنوعی
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AISurveyModal;
