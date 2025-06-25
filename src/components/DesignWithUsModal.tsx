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
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-[85vh]">
          {/* Luxury Header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 dark:from-indigo-900/20 dark:to-indigo-800/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">درخواست طراحی نظرسنجی</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">همکاری با تیم متخصص سنجاپ</p>
              </div>
            </div>
            <div className="w-12" /> {/* Spacer */}
          </div>

          {/* Luxury Alert */}
          <div className="p-8 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4 text-indigo-800 dark:text-indigo-200">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-base font-medium">
                  برای طراحی نظرسنجی شما، لطفا به چند سوال زیر پاسخ بدهید
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                  تمام فیلدها اجباری هستند
                </p>
              </div>
            </div>
          </div>

          {/* Luxury Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-br from-slate-50/30 to-white dark:from-slate-900/30 dark:to-slate-800/30">
            {/* Category */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-900 dark:text-white block">
                دسته بندی نظرسنجی شما <span className="text-indigo-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500">
                  <SelectValue placeholder="دسته بندی را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-base">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Goals */}
            <div className="space-y-3">
              <Label htmlFor="goals" className="text-base font-semibold text-slate-900 dark:text-white block">
                اهداف اصلی خود را بنویسید <span className="text-indigo-500">*</span>
              </Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                placeholder="اهداف اصلی خود را به طور مفصل شرح دهید"
                rows={5}
                maxLength={100}
                required
                className="text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Audience */}
            <div className="space-y-3">
              <Label htmlFor="audience" className="text-base font-semibold text-slate-900 dark:text-white block">
                مخاطب محصول/خدمات شما چه کسانی هستند؟ <span className="text-indigo-500">*</span>
              </Label>
              <Input
                id="audience"
                value={formData.audience}
                onChange={(e) => handleInputChange("audience", e.target.value)}
                placeholder="گروه هدف و مخاطبان خود را معرفی کنید"
                maxLength={100}
                required
                className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500"
              />
            </div>

            {/* Brand */}
            <div className="space-y-3">
              <Label htmlFor="brand" className="text-base font-semibold text-slate-900 dark:text-white block">
                نام سازمان یا برند شما چیست؟ <span className="text-indigo-500">*</span>
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="نام شرکت، سازمان یا برند خود را وارد کنید"
                maxLength={100}
                required
                className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Luxury Footer */}
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-8 bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-12 px-8 text-lg font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                بستن
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  "ارسال درخواست"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignWithUsModal;
