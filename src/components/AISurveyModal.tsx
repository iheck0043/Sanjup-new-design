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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold">طراحی نظرسنجی با هوش مصنوعی</h2>
            <div className="w-8" /> {/* Spacer */}
            {/* Loading Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    هوش مصنوعی در حال طراحی نظرسنجی شما...
                  </h3>
                  <p className="text-gray-600">لطفا صبر کنید</p>
                </div>
              </div>
            )}
          </div>

          {/* Alert */}
          <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-center gap-3 text-blue-800">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm">
                لطفا اطلاعات مورد نیاز برای طراحی نظرسنجی با هوش مصنوعی را وارد
                کنید
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                عنوان نظرسنجی (اجباری) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="عنوان مناسب برای نظرسنجی خود را وارد کنید"
                required
              />
            </div>

            {/* Summary */}
            <div>
              <Label
                htmlFor="summary"
                className="text-sm font-medium mb-2 block"
              >
                هدف نظرسنجی (اجباری) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="توضیح کوتاه در مورد اینکه این نظرسنجی برای چه چیزی هست"
                required
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                دسته بندی نظرسنجی (اجباری){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="دسته بندی را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target */}
            <div>
              <Label
                htmlFor="target"
                className="text-sm font-medium mb-2 block"
              >
                مخاطب هدف
              </Label>
              <Input
                id="target"
                value={formData.target}
                onChange={(e) => handleInputChange("target", e.target.value)}
                placeholder="گروهی که قراره به سوالات پاسخ بدن"
              />
            </div>

            {/* Question Types */}
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-4 block">
                  نوع سوالاتی که می‌خواد داشته باشه
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <Checkbox
                        id={type.id}
                        checked={formData.preferred_question_type.includes(
                          type.id
                        )}
                        onCheckedChange={(checked) =>
                          handleQuestionTypeChange(type.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={type.id} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Question Count and Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  تعداد سوالات مورد نظر (اجباری){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.question_count}
                  onValueChange={(value) =>
                    handleInputChange("question_count", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="تعداد سوالات را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCountOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  استایل و لحن سوال‌ها
                </Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => handleInputChange("tone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="لحن سوالات را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sample Topics */}
            <div>
              <Label
                htmlFor="sample_topics"
                className="text-sm font-medium mb-2 block"
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
              />
            </div>

            {/* Brand and Competitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="brand_name"
                  className="text-sm font-medium mb-2 block"
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
                />
              </div>

              <div>
                <Label
                  htmlFor="competitors"
                  className="text-sm font-medium mb-2 block"
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
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                بستن
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال طراحی...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    طراحی با هوش مصنوعی
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AISurveyModal;
