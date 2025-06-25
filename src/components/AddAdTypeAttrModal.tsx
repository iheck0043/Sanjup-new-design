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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, Monitor, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface AdAttribute {
  id: string;
  name: string;
  question: Array<{
    id: string;
    question: string;
    question_type: string;
    dynamic_part?: string;
    options?: Array<{
      value: string;
    }>;
  }>;
}

interface AddAdTypeAttrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  questionnaire?: any;
}

const AddAdTypeAttrModal: React.FC<AddAdTypeAttrModalProps> = ({
  isOpen,
  onClose,
  onSave,
  questionnaire,
}) => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("templates");
  const [adTypeAttributes, setAdTypeAttributes] = useState<AdAttribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dynamicParts, setDynamicParts] = useState<{ [key: string]: string }>(
    {}
  );

  // New attribute form
  const [newAttrForm, setNewAttrForm] = useState({
    attribute: "",
    title: "",
    questionType: "attribute",
    options: [
      { value: "", attribute: "", priority: 1, type: "text" },
      { value: "", attribute: "", priority: 2, type: "text" },
      { value: "", attribute: "", priority: 3, type: "text" },
      { value: "", attribute: "", priority: 4, type: "text" },
      { value: "", attribute: "", priority: 5, type: "text" },
    ],
    is_required: true,
  });

  const questionTypes = [
    { label: "متنی", value: "attribute_text_question" },
    { label: "چند گزینه‌ای", value: "attribute" },
  ];

  const fetchAdTypeAttributes = async () => {
    if (!accessToken || !questionnaire?.questionnaire_type) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/ad_questionnaire/ad-type-attributes/${questionnaire.questionnaire_type}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.info?.status === 200) {
          setAdTypeAttributes(data.data?.attributes || []);
        }
      }
    } catch (error) {
      console.error("Error fetching ad type attributes:", error);
    }
  };

  const fetchQuestions = async () => {
    if (!accessToken || !id) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions-list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.info?.status === 200) {
          const existingQuestions = data.data;

          // Pre-select attributes that already exist and populate dynamic parts
          const existingAttrIds: string[] = [];
          const dynamicPartsMap: { [key: string]: string } = {};

          existingQuestions.forEach((question: any) => {
            if (question.attribute_question) {
              // Find the attribute that contains this question
              adTypeAttributes.forEach((attr) => {
                const matchingQuestion = attr.question.find(
                  (q) => q.id === question.attribute_question
                );
                if (matchingQuestion) {
                  existingAttrIds.push(attr.id);
                  if (question.dynamic_part) {
                    dynamicPartsMap[question.attribute_question] =
                      question.dynamic_part;
                  }
                }
              });
            }
          });

          setSelectedAttributes(existingAttrIds);
          setDynamicParts(dynamicPartsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const toggleAttributeSelection = (attributeId: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDynamicPartChange = (questionId: string, value: string) => {
    setDynamicParts((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const renderDynamicTitle = (title: string, questionId: string) => {
    const parts = title.split("{}");
    return (
      <div className="flex items-center flex-wrap justify-end" dir="rtl">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span className="text-right">{part}</span>
            {index < parts.length - 1 && (
              <Input
                className="mx-2 w-32 h-8 text-sm text-right"
                placeholder="..."
                value={dynamicParts[questionId] || ""}
                onChange={(e) =>
                  handleDynamicPartChange(questionId, e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const saveTemplateAttributes = async () => {
    if (!accessToken || !id) return;

    setLoading(true);
    try {
      const selectedAttrs = adTypeAttributes.filter((attr) =>
        selectedAttributes.includes(attr.id)
      );

      const result = selectedAttrs.flatMap((attr, index) => {
        return attr.question.map((q, qIndex) => ({
          dynamic_part: dynamicParts[q.id] || null,
          attribute_question: q.id,
          order: 3 + index + qIndex,
        }));
      });

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/batch-questions/${id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(result),
        }
      );

      if (response.ok) {
        toast.success("ویژگی‌ها با موفقیت اضافه شدند");
        onSave();
        onClose();
      } else {
        throw new Error("خطا در ذخیره ویژگی‌ها");
      }
    } catch (error) {
      console.error("Error saving template attributes:", error);
      toast.error("خطا در ذخیره ویژگی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const saveNewAttribute = async () => {
    if (!accessToken || !id) return;

    // Validate form
    if (!newAttrForm.attribute || !newAttrForm.title) {
      toast.error("لطفا تمام فیلدهای الزامی را پر کنید");
      return;
    }

    if (newAttrForm.questionType === "attribute") {
      const hasEmptyOptions = newAttrForm.options.some(
        (opt) => !opt.value.trim()
      );
      if (hasEmptyOptions) {
        toast.error("لطفا تمام گزینه‌ها را پر کنید");
        return;
      }
    }

    setLoading(true);
    try {
      const data: any = {
        attribute: newAttrForm.attribute,
        title: newAttrForm.title,
        is_required: newAttrForm.is_required,
        type: newAttrForm.questionType,
        order: 3, // Will be reordered later
      };

      if (newAttrForm.questionType === "attribute") {
        data.options = newAttrForm.options
          .filter((opt) => opt.value.trim())
          .map((opt) => ({
            ...opt,
            attribute: newAttrForm.attribute,
          }));
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
        toast.success("ویژگی جدید با موفقیت ایجاد شد");

        // Reset form
        setNewAttrForm({
          attribute: "",
          title: "",
          questionType: "attribute",
          options: [
            { value: "", attribute: "", priority: 1, type: "text" },
            { value: "", attribute: "", priority: 2, type: "text" },
            { value: "", attribute: "", priority: 3, type: "text" },
            { value: "", attribute: "", priority: 4, type: "text" },
            { value: "", attribute: "", priority: 5, type: "text" },
          ],
          is_required: true,
        });

        onSave();
        onClose();
      } else {
        throw new Error("خطا در ایجاد ویژگی جدید");
      }
    } catch (error) {
      console.error("Error saving new attribute:", error);
      toast.error("خطا در ایجاد ویژگی جدید");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "templates") {
      saveTemplateAttributes();
    } else {
      saveNewAttribute();
    }
  };

  const getQuestionTypeText = () => {
    switch (newAttrForm.questionType) {
      case "attribute_text_question":
        return "متن سوال را وارد کنید";
      case "attribute":
        return "متن سوال و گزینه‌های خود را وارد کنید";
      default:
        return "متن سوال و گزینه‌های خود را وارد کنید";
    }
  };

  useEffect(() => {
    if (isOpen && questionnaire) {
      fetchAdTypeAttributes();
    }
  }, [isOpen, questionnaire]);

  useEffect(() => {
    if (isOpen && adTypeAttributes.length > 0) {
      fetchQuestions();
    }
  }, [isOpen, adTypeAttributes]);

  return (
    <Dialog  open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col"
        dir="rtl"
      >
        <DialogHeader  className="text-right pb-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="text-left">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-start gap-3">
              افزودن ویژگی تبلیغ
              <div className="w-10 h-10 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-400 text-right mt-2">
              ویژگی‌های مورد نظر خود را از نمونه‌های آماده انتخاب کنید یا ویژگی جدید بسازید
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mt-6 flex-1 flex flex-col"
            dir="rtl"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-12 flex-shrink-0">
              <TabsTrigger 
                value="templates" 
                className="text-right rounded-md font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Monitor className="w-4 h-4 ml-2" />
                نمونه‌های آماده
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="text-right rounded-md font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-slate-800 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Plus className="w-4 h-4 ml-2" />
                ساخت جدید
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6 min-h-0">
              <TabsContent value="templates" className="mt-0 h-full">
                <div className="overflow-y-auto h-full max-h-[50vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <div className="space-y-4 pr-2">
                    {adTypeAttributes.length > 0 ? (
                      adTypeAttributes.map((attr) => (
                        <Collapsible
                          key={attr.id}
                          open={expandedItems.includes(attr.id)}
                          onOpenChange={() => toggleExpanded(attr.id)}
                        >
                          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 py-5 border-r-4 border-transparent hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200">
                                <div className="flex items-center justify-between" dir="rtl">
                                  <div className="flex items-center gap-4">
                                    <Checkbox
                                      checked={selectedAttributes.includes(attr.id)}
                                      onCheckedChange={() => toggleAttributeSelection(attr.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700 w-5 h-5"
                                    />
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-1 font-medium text-sm">
                                      {attr.name}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 mr-6 text-right">
                                    {attr.question.map((q, qIndex) => (
                                      <div key={qIndex} className="mb-2 text-right">
                                        <div className="text-gray-800 dark:text-gray-200 font-medium">
                                          {renderDynamicTitle(q.question, q.id)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                      {expandedItems.includes(attr.id) ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0 pb-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700" dir="rtl">
                                {attr.question[0]?.question_type === "single_select" && attr.question[0]?.options ? (
                                  <div className="text-right">
                                    <div className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                      گزینه‌های سوال:
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {attr.question[0].options.map((option, oIndex) => (
                                        <div
                                          key={oIndex}
                                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-right hover:border-slate-300 dark:hover:border-slate-500 transition-colors duration-200"
                                        >
                                          • {option.value}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <MessageSquare className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                      </div>
                                      این سوال از نوع متنی است
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Monitor className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          هنوز ویژگی‌ای تعریف نشده
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          برای این نوع تست هنوز ویژگی‌ای تعریف نشده است
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="new" className="mt-0 h-full">
                <div className="overflow-y-auto h-full max-h-[50vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                    <CardContent className="p-8 space-y-8" dir="rtl">
                      <div className="text-right">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block text-right flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          نام ویژگی را وارد کنید
                        </Label>
                        <Input
                          value={newAttrForm.attribute}
                          onChange={(e) =>
                            setNewAttrForm((prev) => ({
                              ...prev,
                              attribute: e.target.value,
                            }))
                          }
                          placeholder="مثال: کیفیت تصویر، جذابیت رنگ"
                          className="max-w-md text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg"
                          dir="rtl"
                        />
                      </div>

                      <div className="text-right">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block text-right flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          نوع سوال را انتخاب کنید
                        </Label>
                        <Select
                          value={newAttrForm.questionType}
                          onValueChange={(value) =>
                            setNewAttrForm((prev) => ({
                              ...prev,
                              questionType: value,
                            }))
                          }
                          dir="rtl"
                        >
                          <SelectTrigger className="max-w-md text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg" dir="rtl">
                            <SelectValue placeholder="نوع سوال را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent dir="rtl" className="rounded-lg">
                            {questionTypes.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="text-right hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-right">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block text-right flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          {getQuestionTypeText()}
                        </Label>
                        <Input
                          value={newAttrForm.title}
                          onChange={(e) =>
                            setNewAttrForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="متن سوال را وارد کنید"
                          className="text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg"
                          dir="rtl"
                        />
                      </div>

                      {newAttrForm.questionType === "attribute" && (
                        <div className="space-y-4 text-right">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                            گزینه‌های سوال:
                          </Label>
                          <div className="space-y-3">
                            {newAttrForm.options.map((option, index) => (
                              <div key={index} className="relative">
                                <Input
                                  value={option.value}
                                  onChange={(e) => {
                                    const newOptions = [...newAttrForm.options];
                                    newOptions[index].value = e.target.value;
                                    setNewAttrForm((prev) => ({
                                      ...prev,
                                      options: newOptions,
                                    }));
                                  }}
                                  placeholder={`گزینه ${
                                    ["اول", "دوم", "سوم", "چهارم", "پنجم"][index] ||
                                    index + 1
                                  }`}
                                  className="max-w-md text-right h-12 border-gray-300 dark:border-gray-600 focus:border-slate-500 dark:focus:border-slate-400 rounded-lg pr-12"
                                  dir="rtl"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800" dir="rtl">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 h-12"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ذخیره...
              </div>
            ) : (
              "ذخیره ویژگی"
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

export default AddAdTypeAttrModal;
