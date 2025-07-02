import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface DesignWithUsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DesignWithUsModal: React.FC<DesignWithUsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    category: "",
    goals: "",
    audience: "",
    brand: "",
  });

  // Categories (same as in Vue code)
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      category: "",
      goals: "",
      audience: "",
      brand: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.category) {
      toast.error("لطفا دسته بندی نظرسنجی را انتخاب کنید");
      return;
    }
    if (!formData.goals.trim()) {
      toast.error("لطفا اهداف اصلی خود را بنویسید");
      return;
    }
    if (!formData.audience.trim()) {
      toast.error("لطفا مخاطب محصول/خدمات خود را وارد کنید");
      return;
    }
    if (!formData.brand.trim()) {
      toast.error("لطفا نام سازمان یا برند خود را وارد کنید");
      return;
    }

    setIsSubmitting(true);

    try {
      // WordPress Gravity Forms API credentials
      const consumerKey = "ck_9bd91c163c5062fa1a0de5b1f1f2cbdedb3a8914";
      const consumerSecret = "cs_5e4e90c55695d499b12c6a92a45a28bc9d7f0c2e";

      // Base64 encode credentials
      const encodedCredentials = btoa(`${consumerKey}:${consumerSecret}`);

      // Prepare form data
      const submitData = {
        input_1: formData.category,
        input_3: formData.goals,
        input_4: formData.audience,
        input_8: formData.brand,
        input_9: userData?.phone || "",
        input_10: userData?.first_name || "",
        input_11: userData?.last_name || "",
      };

      // Submit to WordPress Gravity Forms
      const response = await fetch(
        "https://sanjup.co/wp-json/gf/v2/forms/2/submissions",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Success
      toast.success("درخواست شما با موفقیت ارسال شد", {
        description: "از تماس با ما متشکریم به زودی با شما در تماس خواهیم بود",
        duration: 5000,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("خطا در ارسال درخواست. لطفا دوباره تلاش کنید");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="pb-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right mb-1">
                  درخواست طراحی نظرسنجی
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 text-right">
                  همکاری با تیم متخصص و با تجربه سنجاپ
                </p>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <div className="text-gray-800 dark:text-slate-200">
              <p className="text-sm font-medium">
                برای طراحی نظرسنجی شما، لطفا به چند سوال زیر پاسخ بدهید
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                تمام فیلدها اجباری هستند
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-slate-900">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white block">
                دسته بندی نظرسنجی شما <span className="text-red-500">*</span>
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

            {/* Goals */}
            <div className="space-y-2">
              <Label
                htmlFor="goals"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                اهداف اصلی خود را بنویسید{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                placeholder="اهداف اصلی خود را به طور مفصل شرح دهید"
                rows={5}
                maxLength={100}
                required
                className="text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 resize-none placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label
                htmlFor="audience"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                مخاطب محصول/خدمات شما چه کسانی هستند؟{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="audience"
                value={formData.audience}
                onChange={(e) => handleInputChange("audience", e.target.value)}
                placeholder="گروه هدف و مخاطبان خود را معرفی کنید"
                maxLength={100}
                required
                className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label
                htmlFor="brand"
                className="text-sm font-semibold text-gray-900 dark:text-white block"
              >
                نام سازمان یا برند شما چیست؟{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="نام شرکت، سازمان یا برند خود را وارد کنید"
                maxLength={100}
                required
                className="h-10 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-slate-800 dark:to-slate-700 px-6 py-4 rounded-b-2xl">
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
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال ارسال...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ارسال درخواست
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignWithUsModal;
