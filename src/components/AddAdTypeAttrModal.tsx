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
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-bold text-right">
            افزودن ویژگی
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          dir="rtl"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="text-right">
              نمونه آماده
            </TabsTrigger>
            <TabsTrigger value="new" className="text-right">
              ساخت جدید
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="templates" className="mt-0">
              <div className="space-y-4">
                {adTypeAttributes.length > 0 ? (
                  adTypeAttributes.map((attr) => (
                    <Collapsible
                      key={attr.id}
                      open={expandedItems.includes(attr.id)}
                      onOpenChange={() => toggleExpanded(attr.id)}
                    >
                      <Card className="border border-gray-200">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 py-4">
                            <div
                              className="flex items-center justify-between"
                              dir="rtl"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedAttributes.includes(attr.id)}
                                  onCheckedChange={() =>
                                    toggleAttributeSelection(attr.id)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Badge className="bg-blue-50 text-blue-800 border-blue-200">
                                  {attr.name}
                                </Badge>
                              </div>
                              <div className="flex-1 ml-4 text-right">
                                {attr.question.map((q, qIndex) => (
                                  <div key={qIndex} className="mb-2 text-right">
                                    {renderDynamicTitle(q.question, q.id)}
                                  </div>
                                ))}
                              </div>
                              {expandedItems.includes(attr.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0" dir="rtl">
                            {attr.question[0]?.question_type ===
                              "single_select" && attr.question[0]?.options ? (
                              <div className="text-right">
                                <div className="mb-2 text-sm font-medium text-right">
                                  گزینه های سوال:
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                  {attr.question[0].options.map(
                                    (option, oIndex) => (
                                      <div
                                        key={oIndex}
                                        className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 text-right"
                                      >
                                        {option.value}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="pl-5 text-sm text-gray-600 text-right">
                                سوال متنی است
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    هنوز ویژگی‌ای برای این نوع تست تعریف نشده است
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              <Card>
                <CardContent className="p-6 space-y-6" dir="rtl">
                  <div className="text-right">
                    <Label className="text-sm text-gray-600 mb-2 block text-right">
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
                      placeholder="نام ویژگی"
                      className="max-w-md text-right"
                      dir="rtl"
                    />
                  </div>

                  <div className="text-right">
                    <Label className="text-sm text-gray-600 mb-2 block text-right">
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
                      <SelectTrigger className="max-w-md text-right" dir="rtl">
                        <SelectValue placeholder="نوع سوال" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {questionTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="text-right"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-right">
                    <Label className="text-sm text-gray-600 mb-2 block text-right">
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
                      className="text-right"
                      dir="rtl"
                    />
                  </div>

                  {newAttrForm.questionType === "attribute" && (
                    <div className="space-y-3 text-right">
                      <Label className="text-sm text-gray-600 text-right">
                        گزینه‌های سوال:
                      </Label>
                      {newAttrForm.options.map((option, index) => (
                        <Input
                          key={index}
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
                          className="max-w-md text-right"
                          dir="rtl"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t" dir="rtl">
          <Button
            onClick={handleSave}
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

export default AddAdTypeAttrModal;
