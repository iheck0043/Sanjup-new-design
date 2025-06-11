import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface QuestionOption {
  value: string;
  type: string;
  priority: number;
}

interface QuestionForm {
  title: string;
  type: string;
  options: QuestionOption[];
  order: number;
  is_required: boolean;
  isMultiSelectQuestion: boolean;
  range_count: number;
  right_label?: string;
  middle_label?: string;
  left_label?: string;
}

interface AddCustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  questionnaire?: any;
  existingQuestions?: Array<{
    id: string;
    order: number;
  }>;
}

const AddCustomQuestionModal: React.FC<AddCustomQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  questionnaire,
  existingQuestions = [],
}) => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    title: "",
    type: "multi",
    options: [{ value: "", type: "text", priority: 1 }],
    order: 0,
    is_required: false,
    isMultiSelectQuestion: false,
    range_count: 5,
    right_label: "",
    middle_label: "",
    left_label: "",
  });

  const questionTypes = [
    { name: "سوال چند گزینه ای", value: "multi" },
    { name: "سوال متنی", value: "text_question" },
    { name: "سوال اولویت دهی", value: "prioritize" },
    { name: "سوال طیفی", value: "range_slider" },
  ];

  const validateForm = () => {
    if (!questionForm.title.trim()) {
      toast.error("متن سوال الزامی است");
      return false;
    }

    if (questionForm.type === "multi" || questionForm.type === "prioritize") {
      const hasEmptyOptions = questionForm.options.some(
        (opt) => !opt.value.trim()
      );
      if (hasEmptyOptions) {
        toast.error("لطفا تمام گزینه‌ها را پر کنید");
        return false;
      }
    }

    if (questionForm.type === "range_slider") {
      if (!questionForm.right_label || questionForm.right_label.length < 3) {
        toast.error("برچسب راست باید حداقل 3 کاراکتر باشد");
        return false;
      }
      if (!questionForm.left_label || questionForm.left_label.length < 3) {
        toast.error("برچسب چپ باید حداقل 3 کاراکتر باشد");
        return false;
      }
      if (!questionForm.middle_label || questionForm.middle_label.length < 3) {
        toast.error("برچسب وسط باید حداقل 3 کاراکتر باشد");
        return false;
      }
    }

    return true;
  };

  const createQuestionData = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Calculate next order based on existing questions
      const maxOrder =
        existingQuestions.length > 0
          ? Math.max(...existingQuestions.map((q) => q.order))
          : 2; // Start from 3 (after statement orders 1,2)
      const nextOrder = maxOrder + 1;

      const data: any = {
        title: questionForm.title,
        is_required: questionForm.is_required,
        order: nextOrder,
      };

      if (questionForm.type === "multi" || questionForm.type === "prioritize") {
        if (questionForm.type === "multi") {
          data.type = questionForm.isMultiSelectQuestion
            ? "multi_select"
            : "single_select";
          data.is_option_sortable = true;
          data.options = questionForm.options.filter((opt) => opt.value.trim());
        } else {
          data.type = questionForm.type;
          data.is_option_sortable = true;
          data.options = questionForm.options.filter((opt) => opt.value.trim());
        }
      } else {
        data.type = questionForm.type;
        if (questionForm.type === "text_question") {
          data.style = "short";
        }
        if (questionForm.type === "range_slider") {
          data.right_label = questionForm.right_label;
          data.left_label = questionForm.left_label;
          data.middle_label = questionForm.middle_label;
          data.range_count = questionForm.range_count;
          data.options = [];
          for (let i = 0; i < questionForm.range_count; i++) {
            data.options.push({
              priority: 1,
              score: 0,
              value: i + 1,
              type: "integer",
            });
          }
        }
      }

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/single-question-create/${id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        toast.success("سوال با موفقیت اضافه شد");
        resetForm();
        onSave();
        onClose();
      } else {
        throw new Error("خطا در ایجاد سوال");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("خطا در ایجاد سوال");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionForm({
      title: "",
      type: "multi",
      options: [{ value: "", type: "text", priority: 1 }],
      order: 0,
      is_required: false,
      isMultiSelectQuestion: false,
      range_count: 5,
      right_label: "",
      middle_label: "",
      left_label: "",
    });
  };

  const addOption = (index: number) => {
    const newOptions = [...questionForm.options];
    newOptions.splice(index + 1, 0, {
      value: "",
      type: "text",
      priority: questionForm.options.length + 1,
    });
    setQuestionForm((prev) => ({ ...prev, options: newOptions }));
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length > 1) {
      const newOptions = questionForm.options.filter((_, i) => i !== index);
      setQuestionForm((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index].value = value;
    setQuestionForm((prev) => ({ ...prev, options: newOptions }));
  };

  const getQuestionTypeDescription = () => {
    switch (questionForm.type) {
      case "multi":
        return "متن سوال و گزینه های خود را وارد کنید";
      case "prioritize":
        return "متن سوال و گزینه های خود را وارد کنید";
      default:
        return "متن سوال خود را وارد کنید";
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">
            افزودن سوال سفارشی
          </DialogTitle>
        </DialogHeader>

        <div className="border-t pt-4">
          <div className="flex flex-col lg:flex-row gap-6 max-h-[70vh] overflow-y-auto">
            {/* Left Panel - Settings */}
            <div className="lg:w-1/3 space-y-6 lg:border-l lg:pl-6">
              <div>
                <Label className="text-sm text-gray-600 mb-3 block">
                  نوع سوال را انتخاب کنید
                </Label>
                <Select
                  value={questionForm.type}
                  onValueChange={(value) =>
                    setQuestionForm((prev) => ({ ...prev, type: value }))
                  }
                  dir="rtl"
                >
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue placeholder="نوع سوال" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {questionTypes.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="text-right"
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-gray-600 mb-4 block">
                  تنظیمات
                </Label>

                <div className="flex items-center gap-3 mb-4">
                  <Switch
                    checked={questionForm.is_required}
                    onCheckedChange={(checked) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        is_required: checked,
                      }))
                    }
                  />
                  <Label className="text-sm">سوال اجباری</Label>
                </div>

                {questionForm.type === "multi" && (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={questionForm.isMultiSelectQuestion}
                      onCheckedChange={(checked) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          isMultiSelectQuestion: checked,
                        }))
                      }
                    />
                    <Label className="text-sm">سوال چند انتخابی</Label>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="lg:w-2/3 space-y-6">
              <div>
                <Label className="text-sm text-gray-600 mb-3 block">
                  {getQuestionTypeDescription()}
                </Label>
                <Input
                  value={questionForm.title}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="متن سوال"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              {/* Options for multi and prioritize */}
              {(questionForm.type === "multi" ||
                questionForm.type === "prioritize") && (
                <div className="space-y-3">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder="متن گزینه را وارد کنید"
                        className="flex-1 text-right"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(index)}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="flex-shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Range Slider Configuration */}
              {questionForm.type === "range_slider" && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      گام های طیف (1 تا {questionForm.range_count})
                    </Label>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="3"
                        max="11"
                        step="1"
                        value={questionForm.range_count}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            range_count: parseInt(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        dir="ltr"
                      />
                      <div className="flex justify-between text-xs text-blue-700">
                        <span>راست</span>
                        <span>وسط</span>
                        <span>چپ</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-4 block">
                      برچسب های طیف
                    </Label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label className="w-12 text-sm">راست</Label>
                        <Input
                          value={questionForm.right_label}
                          onChange={(e) =>
                            setQuestionForm((prev) => ({
                              ...prev,
                              right_label: e.target.value,
                            }))
                          }
                          placeholder="برچسب راست"
                          maxLength={25}
                          className="flex-1 text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-12 text-sm">وسط</Label>
                        <Input
                          value={questionForm.middle_label}
                          onChange={(e) =>
                            setQuestionForm((prev) => ({
                              ...prev,
                              middle_label: e.target.value,
                            }))
                          }
                          placeholder="برچسب وسط"
                          maxLength={25}
                          className="flex-1 text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-12 text-sm">چپ</Label>
                        <Input
                          value={questionForm.left_label}
                          onChange={(e) =>
                            setQuestionForm((prev) => ({
                              ...prev,
                              left_label: e.target.value,
                            }))
                          }
                          placeholder="برچسب چپ"
                          maxLength={25}
                          className="flex-1 text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" dir="rtl">
          <Button
            onClick={createQuestionData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            بازگشت
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomQuestionModal;
