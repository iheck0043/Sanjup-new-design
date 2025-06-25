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
import { Plus, Minus, X } from "lucide-react";
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
        className="max-w-6xl max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col"
        dir="rtl"
      >
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="text-left">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-start gap-3">
              افزودن سوال سفارشی
              <div className="w-10 h-10 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-400 text-right mt-2">
              سوال سفارشی خود را طراحی کنید و به مجموعه سوالات اضافه کنید
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 pt-6">
          <div className="flex flex-col xl:flex-row gap-8 flex-1 min-h-0">
            {/* Left Panel - Settings */}
            <div className="xl:w-1/3 flex-shrink-0">
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 h-fit">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                      نوع سوال را انتخاب کنید
                    </Label>
                    <Select
                      value={questionForm.type}
                      onValueChange={(value) =>
                        setQuestionForm((prev) => ({ ...prev, type: value }))
                      }
                      dir="rtl"
                    >
                      <SelectTrigger className="text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg" dir="rtl">
                        <SelectValue placeholder="نوع سوال" />
                      </SelectTrigger>
                      <SelectContent dir="rtl" className="rounded-lg">
                        {questionTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="text-right hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 block flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                      تنظیمات سوال
                    </Label>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={questionForm.is_required}
                            onCheckedChange={(checked) =>
                              setQuestionForm((prev) => ({
                                ...prev,
                                is_required: checked,
                              }))
                            }
                            className="data-[state=checked]:bg-slate-700"
                          />
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">سوال اجباری</Label>
                        </div>
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                        </div>
                      </div>

                      {questionForm.type === "multi" && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={questionForm.isMultiSelectQuestion}
                              onCheckedChange={(checked) =>
                                setQuestionForm((prev) => ({
                                  ...prev,
                                  isMultiSelectQuestion: checked,
                                }))
                              }
                              className="data-[state=checked]:bg-slate-700"
                            />
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">سوال چند انتخابی</Label>
                          </div>
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">+</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Form */}
            <div className="xl:w-2/3 flex-1 min-h-0">
              <div className="overflow-y-auto h-full max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
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
                        placeholder="متن سوال را اینجا وارد کنید"
                        className="text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg"
                        dir="rtl"
                      />
                    </div>

                    {/* Options for multi and prioritize */}
                    {(questionForm.type === "multi" || questionForm.type === "prioritize") && (
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          گزینه‌های سوال
                        </Label>
                        <div className="space-y-3">
                          {questionForm.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="relative flex-1">
                                <Input
                                  value={option.value}
                                  onChange={(e) => updateOption(index, e.target.value)}
                                  placeholder="متن گزینه را وارد کنید"
                                  className="text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg pr-12"
                                  dir="rtl"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                  {index + 1}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(index)}
                                className="flex-shrink-0 h-12 w-12 rounded-lg border-gray-300 dark:border-gray-600 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-slate-400 dark:hover:border-slate-500"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeOption(index)}
                                  className="flex-shrink-0 h-12 w-12 rounded-lg border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Range Slider Configuration */}
                    {questionForm.type === "range_slider" && (
                      <div className="space-y-8">
                        <div className="bg-gray-50 dark:bg-gray-750 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                            تعداد گام‌های طیف (1 تا {questionForm.range_count})
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
                              className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                              dir="ltr"
                            />
                            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">راست</span>
                              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">وسط</span>
                              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">چپ</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-750 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 block flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                            برچسب‌های طیف
                          </Label>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                <span className="text-slate-600 dark:text-slate-400 text-sm font-bold">راست</span>
                              </div>
                              <Input
                                value={questionForm.right_label}
                                onChange={(e) =>
                                  setQuestionForm((prev) => ({
                                    ...prev,
                                    right_label: e.target.value,
                                  }))
                                }
                                placeholder="برچسب راست (مثال: بسیار خوب)"
                                maxLength={25}
                                className="flex-1 text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg"
                                dir="rtl"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">وسط</span>
                              </div>
                              <Input
                                value={questionForm.middle_label}
                                onChange={(e) =>
                                  setQuestionForm((prev) => ({
                                    ...prev,
                                    middle_label: e.target.value,
                                  }))
                                }
                                placeholder="برچسب وسط (مثال: متوسط)"
                                maxLength={25}
                                className="flex-1 text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg"
                                dir="rtl"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">چپ</span>
                              </div>
                              <Input
                                value={questionForm.left_label}
                                onChange={(e) =>
                                  setQuestionForm((prev) => ({
                                    ...prev,
                                    left_label: e.target.value,
                                  }))
                                }
                                placeholder="برچسب چپ (مثال: بسیار بد)"
                                maxLength={25}
                                className="flex-1 text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800" dir="rtl">
          <Button
            onClick={createQuestionData}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 h-12"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ذخیره...
              </div>
            ) : (
              "ذخیره سوال"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-medium h-12"
          >
            انصراف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomQuestionModal;
