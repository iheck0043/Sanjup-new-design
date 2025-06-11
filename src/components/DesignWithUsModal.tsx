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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold">درخواست طراحی نظرسنجی</h2>
            <div className="w-8" /> {/* Spacer */}
          </div>

          {/* Alert */}
          <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-center gap-3 text-blue-800">
              <Users className="h-5 w-5" />
              <p className="text-sm">
                برای طراحی نظرسنجی شما، لطفا به چند سوال زیر پاسخ بدهید
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                دسته بندی نظرسنجی شما <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="دسته بندی" />
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

            {/* Goals */}
            <div>
              <Label htmlFor="goals" className="text-sm font-medium mb-2 block">
                اهداف اصلی خود را بنویسید{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                placeholder="اهداف اصلی خود را به طور مفصل شرح دهید"
                rows={4}
                maxLength={100}
                required
              />
            </div>

            {/* Audience */}
            <div>
              <Label
                htmlFor="audience"
                className="text-sm font-medium mb-2 block"
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
              />
            </div>

            {/* Brand */}
            <div>
              <Label htmlFor="brand" className="text-sm font-medium mb-2 block">
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
              />
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
