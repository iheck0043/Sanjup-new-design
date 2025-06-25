import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { Question, ApiQuestion } from "../pages/QuestionnaireForm";

interface SubCondition {
  id: string;
  sourceQuestionId: string; // سوال منبع
  operator: "equals" | "not_equals" | "contains" | "not_contains"; // نوع مقایسه
  valueType: "option" | "text"; // نوع پاسخ: گزینه یا متن
  optionValue?: string; // اگر valueType === "option"
  textValue?: string; // اگر valueType === "text"
}

interface ComplexCondition {
  id: string;
  subConditions: SubCondition[];
  logicalOperator: "AND" | "OR"; // عملگر منطقی بین شرط‌های فرعی
  targetQuestionId: string; // سوال مقصد
}

interface ConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ApiQuestion | null;
  questions: ApiQuestion[];
  onUpdateQuestion: (id: string, updates: Partial<ApiQuestion>) => void;
}

const ConditionalLogicModal: React.FC<ConditionalLogicModalProps> = ({
  isOpen,
  onClose,
  question,
  questions,
  onUpdateQuestion,
}) => {
  const [conditions, setConditions] = useState<ComplexCondition[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("🔄 ConditionalLogicModal - Question changed:", question?.id);
    console.log("🔍 Full question object:", question);
    console.log("🔍 Modal isOpen prop:", isOpen);
    console.log(
      "📋 Available questions:",
      questions.map((q) => ({ id: q.id, type: q.type, options: q.options }))
    );
    console.log("📋 Question mappings:", question?.mappings);
    console.log("📋 Question has mappings?", !!question?.mappings);
    console.log("📋 Mappings length:", question?.mappings?.length || 0);

    if (question?.mappings && question.mappings.length > 0) {
      console.log("🔍 Found mappings for question:", question.id);
      console.log("📋 Raw mappings:", question.mappings);

      // تبدیل mappings موجود به فرمت کامپوننت
      const convertedConditions: ComplexCondition[] = question.mappings.map(
        (mapping, index) => {
          console.log(`🔄 Processing mapping ${index + 1}:`, mapping);

          return {
            id: mapping.id?.toString() || `mapping-${index}`,
            subConditions: mapping.conditions.map((condition, condIndex) => {
              console.log(
                `  🔍 Processing condition ${condIndex + 1}:`,
                condition
              );

              // پیدا کردن option value بر اساس target_option ID
              let optionValue = "";
              if (condition.target_option) {
                const sourceQuestion = questions.find(
                  (q) =>
                    q.id.toString() === condition.target_question.toString()
                );
                console.log(
                  "  📋 Found source question:",
                  sourceQuestion?.id,
                  sourceQuestion?.type
                );

                if (sourceQuestion?.options) {
                  console.log(
                    "  📋 Source question options:",
                    sourceQuestion.options
                  );
                  const targetOption = sourceQuestion.options.find(
                    (opt) => opt.id === condition.target_option
                  );
                  console.log("  🎯 Found target option:", targetOption);

                  if (targetOption) {
                    optionValue =
                      targetOption.value ||
                      targetOption.text ||
                      targetOption.label ||
                      "";
                    console.log("  ✅ Final option value:", optionValue);
                  }
                }
              }

              const subCondition: SubCondition = {
                id: condition.id?.toString() || `cond-${index}-${condIndex}`,
                sourceQuestionId: condition.target_question.toString(),
                operator:
                  condition.comparison_type === "equal"
                    ? ("equals" as const)
                    : condition.comparison_type === "not_equal"
                    ? ("not_equals" as const)
                    : condition.comparison_type === "contains"
                    ? ("contains" as const)
                    : condition.comparison_type === "not_contains"
                    ? ("not_contains" as const)
                    : ("equals" as const),
                valueType: condition.target_option
                  ? ("option" as const)
                  : ("text" as const),
                optionValue: optionValue,
                textValue: condition.target_text || "",
              };

              console.log("  ✅ Created sub-condition:", subCondition);
              return subCondition;
            }),
            logicalOperator:
              mapping.conditions.length > 1 &&
              mapping.conditions[0]?.operator === "or"
                ? "OR"
                : "AND",
            targetQuestionId: mapping.next_question.toString(),
          };
        }
      );
      console.log("✅ Final converted conditions:", convertedConditions);
      setConditions(convertedConditions);
    } else if (question?.conditions) {
      // تبدیل شرط‌های قدیمی به فرمت جدید (برای سازگاری)
      const convertedConditions: ComplexCondition[] = question.conditions.map(
        (oldCondition, index) => ({
          id: oldCondition.id || `condition-${index}`,
          subConditions: [
            {
              id: `sub-${index}-0`,
              sourceQuestionId: question.id,
              operator: "equals" as const,
              valueType: "option" as const,
              optionValue: oldCondition.sourceOption,
            },
          ],
          logicalOperator: "AND" as const,
          targetQuestionId: oldCondition.targetQuestionId,
        })
      );
      setConditions(convertedConditions);
    } else {
      console.log("📋 No existing conditions found, starting fresh");
      setConditions([]);
    }
  }, [question, questions]);

  if (!question) {
    console.log(
      "❌ ConditionalLogicModal: No question provided, returning null"
    );
    return null;
  }

  console.log("✅ ConditionalLogicModal: Question available, rendering modal");

  // سوالات قابل انتخاب برای منبع (خود سوال + سوالات قبلی)
  const sourceQuestions = questions.filter((q, index) => {
    const currentIndex = questions.findIndex((iq) => iq.id === question.id);
    return index <= currentIndex;
  });

  // سوالات قابل انتخاب برای مقصد (سوالات بعدی)
  const targetQuestions = questions.filter((q, index) => {
    const currentIndex = questions.findIndex((iq) => iq.id === question.id);
    return index > currentIndex;
  });

  const hasTargetQuestions = targetQuestions && targetQuestions.length > 0;

  const addCondition = () => {
    const newCondition: ComplexCondition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      subConditions: [
        {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          sourceQuestionId: question.id,
          operator: "equals",
          valueType: "option",
          optionValue: "",
          textValue: "",
        },
      ],
      logicalOperator: "AND",
      targetQuestionId: "",
    };
    setConditions((prev) => [...prev, newCondition]);
  };

  const removeCondition = (conditionId: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== conditionId));
  };

  const addSubCondition = (conditionId: string) => {
    const newSubCondition: SubCondition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sourceQuestionId: question.id,
      operator: "equals",
      valueType: "option",
      optionValue: "",
      textValue: "",
    };

    setConditions((prev) =>
      prev.map((c) =>
        c.id === conditionId
          ? { ...c, subConditions: [...c.subConditions, newSubCondition] }
          : c
      )
    );
  };

  const removeSubCondition = (conditionId: string, subConditionId: string) => {
    setConditions((prev) =>
      prev.map((c) =>
        c.id === conditionId
          ? {
              ...c,
              subConditions: c.subConditions.filter(
                (sc) => sc.id !== subConditionId
              ),
            }
          : c
      )
    );
  };

  const updateCondition = (
    conditionId: string,
    field: keyof ComplexCondition,
    value: any
  ) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === conditionId ? { ...c, [field]: value } : c))
    );
  };

  const updateSubCondition = (
    conditionId: string,
    subConditionId: string,
    field: keyof SubCondition,
    value: any
  ) => {
    setConditions((prev) =>
      prev.map((c) =>
        c.id === conditionId
          ? {
              ...c,
              subConditions: c.subConditions.map((sc) =>
                sc.id === subConditionId ? { ...sc, [field]: value } : sc
              ),
            }
          : c
      )
    );
  };

  const getQuestionOptions = (questionId: string) => {
    console.log("🔍 Getting options for question:", questionId);
    const sourceQuestion = questions.find(
      (q) => q.id.toString() === questionId.toString()
    );
    console.log("🔍 Found question:", sourceQuestion);

    if (!sourceQuestion) {
      console.log("❌ Source question not found for ID:", questionId);
      return [];
    }

    console.log("📋 Question type:", sourceQuestion.type);
    console.log("📋 Question options:", sourceQuestion.options);

    // برای سوالات درجه‌بندی و طیفی
    if (
      sourceQuestion.type === "درجه بندی" ||
      sourceQuestion.type === "طیفی" ||
      sourceQuestion.type === "grading" ||
      sourceQuestion.type === "range_slider"
    ) {
      const ratingMax =
        (sourceQuestion as any).ratingMax || (sourceQuestion as any).count || 5;
      const ratingOptions = Array.from({ length: ratingMax }, (_, i) => ({
        id: null, // برای rating options ID نداریم
        value: (i + 1).toString(),
        label:
          sourceQuestion.type === "range_slider" ||
          sourceQuestion.type === "طیفی"
            ? `مقیاس ${i + 1}`
            : `${i + 1} ستاره`,
      }));
      console.log("⭐ Rating options:", ratingOptions);
      return ratingOptions;
    }

    // برای سوالات چندگزینه‌ای
    if (sourceQuestion.options && sourceQuestion.options.length > 0) {
      const processedOptions = sourceQuestion.options.map((option) => {
        console.log("🔍 Processing option:", option);
        const optionValue =
          typeof option === "string"
            ? option
            : (option as any).value ||
              (option as any).label ||
              (option as any).text ||
              "";
        const optionLabel =
          typeof option === "string"
            ? option
            : (option as any).label ||
              (option as any).text ||
              (option as any).value ||
              "";

        // استخراج ID گزینه
        const optionId =
          typeof option === "string"
            ? null
            : (option as any).id || (option as any).option_id || null;

        const result = {
          id: optionId,
          value: optionValue.toString(),
          label: optionLabel.toString(),
        };
        console.log("✅ Processed option:", result);
        return result;
      });
      console.log("📋 All processed options:", processedOptions);
      return processedOptions;
    }

    // برای سوالات بله/خیر
    if (sourceQuestion.type === "yes_no") {
      const yesNoOptions = [
        { id: null, value: "yes", label: "بله" },
        { id: null, value: "no", label: "خیر" },
      ];
      console.log("✅ Yes/No options:", yesNoOptions);
      return yesNoOptions;
    }

    // اگر گزینه‌ای وجود نداشت
    console.log("❌ No options found for this question type");
    return [];
  };

  const handleSave = () => {
    // فیلتر کردن شرط‌های معتبر
    const validConditions = conditions.filter(
      (condition) =>
        condition.targetQuestionId &&
        condition.targetQuestionId !== "no-questions" &&
        condition.subConditions.length > 0 &&
        condition.subConditions.every((sub) =>
          sub.valueType === "option"
            ? sub.optionValue && sub.optionValue !== "no-options"
            : sub.textValue && sub.textValue.trim() !== ""
        )
    );

    // تبدیل به فرمت API
    const apiFormat = validConditions.map((condition) => {
      const conditionsArray = condition.subConditions.map((subCondition) => {
        // تبدیل comparison_type
        let comparisonType = "";
        switch (subCondition.operator) {
          case "equals":
            comparisonType = "equal";
            break;
          case "not_equals":
            comparisonType = "not_equal";
            break;
          case "contains":
            comparisonType = "contains";
            break;
          case "not_contains":
            comparisonType = "not_contains";
            break;
          default:
            comparisonType = "equal";
        }

        // تبدیل operator
        const operator = condition.logicalOperator === "AND" ? "and" : "or";

        // پیدا کردن ID گزینه انتخاب شده
        let targetOptionId = null;
        if (subCondition.valueType === "option" && subCondition.optionValue) {
          const questionOptions = getQuestionOptions(
            subCondition.sourceQuestionId
          );
          const selectedOption = questionOptions.find(
            (opt) => opt.value === subCondition.optionValue
          );
          // استفاده از type assertion برای دسترسی به id
          const optionWithId = selectedOption as any;
          targetOptionId = optionWithId?.id
            ? parseInt(optionWithId.id.toString())
            : null;

          console.log("🔍 Finding option ID:", {
            selectedValue: subCondition.optionValue,
            foundOption: selectedOption,
            targetOptionId: targetOptionId,
          });
        }

        return {
          comparison_type: comparisonType,
          operator: operator,
          target_option: targetOptionId,
          target_question: parseInt(subCondition.sourceQuestionId),
          target_text:
            subCondition.valueType === "text" && subCondition.textValue
              ? subCondition.textValue
              : "",
        };
      });

      return {
        conditions: conditionsArray,
        next_question: parseInt(condition.targetQuestionId),
        question: parseInt(question.id.toString()),
        valid: true,
      };
    });

    console.log("🔄 Original conditions:", validConditions);
    console.log(
      "🚀 API Format for Django:",
      JSON.stringify(apiFormat, null, 2)
    );

    if (apiFormat.length === 0) {
      console.log("⚠️ No valid conditions to save");
      // ذخیره فرمت قدیمی برای سازگاری
      onUpdateQuestion(question.id, {
        complexConditions: validConditions,
      } as any);
      onClose();
      return;
    }

    console.log(`✅ Ready to send ${apiFormat.length} condition(s) to API`);

    // ارسال به API
    const saveConditionsToAPI = async () => {
      setIsSaving(true);
      try {
        const BASE_URL = import.meta.env.VITE_BASE_URL;
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/mapping/create/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(apiFormat),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Conditions saved successfully:", result);

          // ذخیره فرمت قدیمی برای سازگاری محلی
          onUpdateQuestion(question.id, {
            complexConditions: validConditions,
          } as any);

          onClose();
        } else {
          const errorText = await response.text();
          console.error("❌ Failed to save conditions:", errorText);
          alert("خطا در ذخیره شرط‌ها. لطفاً دوباره تلاش کنید.");
        }
      } catch (error) {
        console.error("❌ Error saving conditions:", error);
        alert("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
      } finally {
        setIsSaving(false);
      }
    };

    // اجرای تابع async
    saveConditionsToAPI();
  };

  const operatorLabels = {
    equals: "برابر است با",
    not_equals: "برابر نیست با",
    contains: "شامل باشد",
    not_contains: "شامل نباشد",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        dir="rtl"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold">شرط‌گذاری پیشرفته</h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">
              سوال:{" "}
              {(question as any).label ||
                question.title ||
                question.text ||
                "سوال بدون عنوان"}
            </Label>
          </div>

          <div className="space-y-6">
            {(() => {
              console.log("🎨 Rendering conditions in UI:", conditions);
              return null;
            })()}
            {conditions.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                هنوز شرطی تعریف نشده است
              </div>
            )}
            {conditions.map((condition, conditionIndex) => (
              <div
                key={condition.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-sm">
                    شرط {conditionIndex + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* انتخاب عملگر منطقی کلی */}
                {condition.subConditions.length > 1 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <Label className="text-sm font-medium mb-2 block">
                      برای اجرای این شرط:
                    </Label>
                    <Select
                      value={condition.logicalOperator}
                      onValueChange={(value) =>
                        updateCondition(condition.id, "logicalOperator", value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">
                          همه شرط‌های فرعی برقرار باشند
                        </SelectItem>
                        <SelectItem value="OR">
                          یکی از شرط‌های فرعی برقرار باشد
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* شرط‌های فرعی */}
                <div className="space-y-3">
                  {condition.subConditions.map((subCondition, subIndex) => (
                    <div
                      key={subCondition.id}
                      className="bg-white p-3 rounded border"
                    >
                      <div className="grid grid-cols-12 gap-2 items-end">
                        {/* سوال منبع */}
                        <div className="col-span-3">
                          <Label className="text-xs">اگر پاسخ سوال:</Label>
                          <Select
                            value={subCondition.sourceQuestionId}
                            onValueChange={(value) =>
                              updateSubCondition(
                                condition.id,
                                subCondition.id,
                                "sourceQuestionId",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="انتخاب سوال" />
                            </SelectTrigger>
                            <SelectContent>
                              {sourceQuestions.map((q) => (
                                <SelectItem key={q.id} value={q.id.toString()}>
                                  {(q as any).label ||
                                    q.title ||
                                    q.text ||
                                    `سوال ${q.id}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* عملگر مقایسه */}
                        <div className="col-span-2">
                          <Label className="text-xs">شرط:</Label>
                          <Select
                            value={subCondition.operator}
                            onValueChange={(value) =>
                              updateSubCondition(
                                condition.id,
                                subCondition.id,
                                "operator",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(operatorLabels).map(
                                ([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* نوع پاسخ */}
                        <div className="col-span-2">
                          <Label className="text-xs">نوع پاسخ:</Label>
                          <Select
                            value={subCondition.valueType}
                            onValueChange={(value) => {
                              updateSubCondition(
                                condition.id,
                                subCondition.id,
                                "valueType",
                                value
                              );
                              // Reset values when type changes
                              updateSubCondition(
                                condition.id,
                                subCondition.id,
                                "optionValue",
                                ""
                              );
                              updateSubCondition(
                                condition.id,
                                subCondition.id,
                                "textValue",
                                ""
                              );
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option">گزینه</SelectItem>
                              <SelectItem value="text">متن</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* مقدار پاسخ */}
                        <div className="col-span-4">
                          <Label className="text-xs">مقدار:</Label>
                          {subCondition.valueType === "option" ? (
                            <Select
                              value={subCondition.optionValue || ""}
                              onValueChange={(value) =>
                                updateSubCondition(
                                  condition.id,
                                  subCondition.id,
                                  "optionValue",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="انتخاب گزینه" />
                              </SelectTrigger>
                              <SelectContent>
                                {(() => {
                                  const options = getQuestionOptions(
                                    subCondition.sourceQuestionId
                                  );
                                  console.log(
                                    "🎯 Options for display:",
                                    options
                                  );

                                  if (options.length === 0) {
                                    return (
                                      <SelectItem value="no-options" disabled>
                                        گزینه‌ای برای این سوال وجود ندارد
                                      </SelectItem>
                                    );
                                  }

                                  return options.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ));
                                })()}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={subCondition.textValue || ""}
                              onChange={(e) =>
                                updateSubCondition(
                                  condition.id,
                                  subCondition.id,
                                  "textValue",
                                  e.target.value
                                )
                              }
                              placeholder="متن مورد نظر"
                              className="h-8"
                            />
                          )}
                        </div>

                        {/* دکمه حذف شرط فرعی */}
                        <div className="col-span-1">
                          {condition.subConditions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeSubCondition(
                                  condition.id,
                                  subCondition.id
                                )
                              }
                              className="text-red-500 hover:text-red-700 w-8 h-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* دکمه افزودن شرط فرعی */}
                <div className="mt-3">
                  <Button
                    onClick={() => addSubCondition(condition.id)}
                    variant="outline"
                    size="sm"
                    className="border-dashed"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن شرط فرعی
                  </Button>
                </div>

                {/* سوال مقصد */}
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <Label className="text-sm font-medium">برو به سوال:</Label>
                  <Select
                    value={condition.targetQuestionId}
                    onValueChange={(value) =>
                      updateCondition(condition.id, "targetQuestionId", value)
                    }
                    disabled={!hasTargetQuestions}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="انتخاب سوال مقصد" />
                    </SelectTrigger>
                    <SelectContent>
                      {hasTargetQuestions ? (
                        targetQuestions.map((targetQuestion) => (
                          <SelectItem
                            key={targetQuestion.id}
                            value={targetQuestion.id.toString()}
                          >
                            {(targetQuestion as any).label ||
                              targetQuestion.title ||
                              targetQuestion.text ||
                              `سوال ${targetQuestion.id}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          key="no-questions"
                          value="no-questions"
                          disabled
                        >
                          هیچ سوال مقصدی موجود نیست
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {/* دکمه افزودن شرط جدید */}
            <Button
              onClick={addCondition}
              variant="outline"
              className="w-full border-dashed"
              disabled={!hasTargetQuestions}
            >
              <Plus className="w-4 h-4 ml-2" />
              افزودن شرط جدید
            </Button>
          </div>

          {/* دکمه‌های عمل */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              {isSaving ? "در حال ذخیره..." : "ذخیره شرط‌ها"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSaving}
            >
              انصراف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalLogicModal;
