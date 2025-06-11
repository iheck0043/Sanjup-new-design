import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReactSortable } from "react-sortablejs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import FormHeader from "../components/FormHeader";
import { useAuth } from "../lib/auth-context";
import AddAdTypeAttrModal from "../components/AddAdTypeAttrModal";
import AddCustomQuestionModal from "../components/AddCustomQuestionModal";
import { debounce } from "lodash";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface AdTestQuestion {
  id: string;
  type: string;
  title: string;
  order: number;
  attribute?: string;
  dynamic_part?: string;
  is_required?: boolean;
  options?: Array<{
    id?: number;
    value: string;
    option_kind?: string;
  }>;
  right_label?: string;
  left_label?: string;
  middle_label?: string;
  chosen?: boolean; // Required for ReactSortable
}

interface AdTestAttribute {
  id: string;
  type: string;
  title: string;
  attribute: string;
  dynamic_part?: string;
  order: number;
  options?: Array<{
    id?: number;
    value: string;
  }>;
  chosen?: boolean; // Required for ReactSortable
}

const AdTestQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<AdTestQuestion[]>([]);
  const [attributes, setAttributes] = useState<AdTestAttribute[]>([]);
  const [allQuestions, setAllQuestions] = useState<AdTestQuestion[]>([]);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [expandedAttributes, setExpandedAttributes] = useState<string[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [isAddAttrModalOpen, setIsAddAttrModalOpen] = useState(false);
  const [isAddCustomQuestionModalOpen, setIsAddCustomQuestionModalOpen] =
    useState(false);

  // Refs to hold current values during drag operations
  const currentAttributesRef = useRef<AdTestAttribute[]>([]);
  const currentQuestionsRef = useRef<AdTestQuestion[]>([]);

  const billboardSteps = [
    { id: 1, title: "تعیین محتوا", path: `/adtest/${id}` },
    { id: 2, title: "سوالات", path: `/adtest/${id}/questions` },
    { id: 3, title: "انتخاب مخاطب", path: `/adtest/${id}/audience` },
    { id: 4, title: "گزارش نتایج", path: `/adtest/${id}/results` },
  ];

  const typeToString: { [key: string]: string } = {
    single_select: "چند گزینه ای تک انتخابی",
    multi_select: "چند گزینه ای چند انتخابی",
    text_question: "متنی",
    range_slider: "طیفی",
    prioritize: "اولویت دهی",
  };

  const fetchQuestionnaire = async () => {
    if (!accessToken || !id) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/sanjup/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پرسشنامه");
      }

      const data = await response.json();
      if (data.info.status === 200) {
        setQuestionnaire(data.data);
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      toast.error("خطا در دریافت اطلاعات پرسشنامه");
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

      if (!response.ok) {
        throw new Error("خطا در دریافت سوالات");
      }

      const data = await response.json();
      if (data.info.status === 200) {
        const questionsList = data.data;

        // Store all questions
        setAllQuestions(questionsList);

        // Separate attributes and regular questions for display
        const attributeQuestions = questionsList.filter(
          (q: AdTestQuestion) =>
            q.type === "attribute" || q.type === "attribute_text_question"
        );

        const regularQuestions = questionsList.filter(
          (q: AdTestQuestion) =>
            q.type !== "attribute" &&
            q.type !== "attribute_text_question" &&
            q.type !== "statement"
        );

        setAttributes(attributeQuestions);
        setQuestions(regularQuestions);

        // Update refs with current data
        currentAttributesRef.current = attributeQuestions;
        currentQuestionsRef.current = regularQuestions;
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("خطا در دریافت سوالات");
    }
  };

  const fetchAdTypeAttributes = async (questionnaireType: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/ad_questionnaire/ad-type-attributes/${questionnaireType}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Handle ad type attributes if needed
      }
    } catch (error) {
      console.error("Error fetching ad type attributes:", error);
    }
  };

  const removeQuestion = async (
    index: number,
    isAttribute: boolean = false
  ) => {
    if (!accessToken || !id) return;

    setRemovingIndex(index);
    setApiLoading(true);

    try {
      const questionId = isAttribute
        ? attributes[index].id
        : questions[index].id;

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در حذف سوال");
      }

      toast.success("سوال با موفقیت حذف شد");
      await fetchQuestions();
    } catch (error) {
      console.error("Error removing question:", error);
      toast.error("خطا در حذف سوال");
    } finally {
      setRemovingIndex(null);
      setApiLoading(false);
    }
  };

  const updateDynamicPart = useCallback(
    debounce(async (value: string, index: number) => {
      if (!accessToken || !attributes[index]) return;

      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${attributes[index].id}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              dynamic_part: value,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی");
        }

        console.log("Dynamic part updated successfully");
      } catch (error) {
        console.error("Error updating dynamic part:", error);
        toast.error("خطا در بروزرسانی");
      }
    }, 1000),
    [accessToken, attributes]
  );

  const reorderQuestions = async (questionsToReorder?: AdTestQuestion[]) => {
    const questionsData = questionsToReorder || allQuestions;

    if (!accessToken || !id || questionsData.length === 0) return;

    console.log(
      "Current questions order:",
      questionsData.map((q) => ({ id: q.id, type: q.type }))
    );

    try {
      // Create payload with proper ordering using existing data
      let isFirstStatement = true;
      let itemIndex = 3;
      const payload: Array<{ id: string; order: number }> = [];

      // Use provided questionsData instead of allQuestions state
      questionsData.forEach((item, index) => {
        let order;
        if (item.type === "statement") {
          if (isFirstStatement) {
            order = 1; // اولین statement
            isFirstStatement = false;
          } else {
            order = 2; // بقیه statements
          }
        } else {
          order = itemIndex;
          itemIndex += 1;
        }

        payload.push({
          id: item.id,
          order,
        });
      });

      console.log("Payload being sent:", payload);

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/reorder/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload), // Send array directly
        }
      );

      if (response.ok) {
        await fetchQuestions();
      }
    } catch (error) {
      console.error("Error reordering questions:", error);
    }
  };

  const handleAttributesReorder = async (newAttributes: AdTestAttribute[]) => {
    // Update both state and ref - no API call during drag
    setAttributes(newAttributes);
    currentAttributesRef.current = newAttributes;
  };

  const handleQuestionsReorder = async (newQuestions: AdTestQuestion[]) => {
    // Update both state and ref - no API call during drag
    console.log("newQuestions:", newQuestions);
    setQuestions(newQuestions);
    currentQuestionsRef.current = newQuestions;
  };

  const handleDragEnd = async () => {
    console.log("handleDragEnd called");
    console.log("currentAttributesRef.current:", currentAttributesRef.current);
    console.log("currentQuestionsRef.current:", currentQuestionsRef.current);

    // Use ref values to get the most up-to-date data
    const statements = allQuestions.filter((q) => q.type === "statement");
    const updatedAllQuestions = [
      ...statements,
      ...currentAttributesRef.current,
      ...currentQuestionsRef.current,
    ];

    console.log("updatedAllQuestions being set:", updatedAllQuestions);
    setAllQuestions(updatedAllQuestions);

    // Call reorder API with the updated questions directly
    setTimeout(() => {
      console.log(
        "About to call reorderQuestions with updatedAllQuestions:",
        updatedAllQuestions
      );
      reorderQuestions(updatedAllQuestions);
    }, 100);
  };

  const toggleExpanded = (id: string, isAttribute: boolean) => {
    if (isAttribute) {
      setExpandedAttributes((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setExpandedQuestions((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const renderDynamicTitle = (
    title: string,
    dynamicPart: string,
    attributeIndex: number
  ) => {
    const parts = title.split("{}");
    return (
      <div className="flex items-center flex-wrap">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <Input
                className="mx-2 w-32 h-8 text-sm text-center border-blue-300 focus:border-blue-500"
                placeholder="..."
                value={dynamicPart || ""}
                onChange={(e) => {
                  const newAttributes = [...attributes];
                  newAttributes[attributeIndex].dynamic_part = e.target.value;
                  setAttributes(newAttributes);
                  updateDynamicPart(e.target.value, attributeIndex);
                }}
                dir="rtl"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const prevStep = () => {
    navigate(`/adtest/${id}`);
  };

  const nextStep = () => {
    navigate(`/adtest/${id}/audience`);
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        if (accessToken && id) {
          await fetchQuestionnaire();
          await fetchQuestions();

          if (questionnaire?.questionnaire_type) {
            await fetchAdTypeAttributes(questionnaire.questionnaire_type);
          }
        }
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [accessToken, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-x-hidden"
      dir="rtl"
    >
      <FormHeader
        formTitle={questionnaire?.title || "تست تبلیغات"}
        setFormTitle={() => {}}
        steps={billboardSteps}
        backPath={`/adtest/${id}`}
      />

      {/* Main Content */}
      <div className="flex-1 mt-20 p-6 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              سؤالاتی که پس از نمایش محتوای شما از کاربران پرسیده خواهد شد:
            </h2>
          </div>

          {/* Ad Type Attributes Section */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <ReactSortable
                list={attributes}
                setList={handleAttributesReorder}
                animation={200}
                handle=".drag-handle"
                ghostClass="opacity-50"
                onEnd={handleDragEnd}
              >
                {attributes.map((attribute, index) => (
                  <div key={attribute.id} className="mb-4">
                    <Collapsible
                      open={expandedAttributes.includes(attribute.id)}
                      onOpenChange={() => toggleExpanded(attribute.id, true)}
                    >
                      <Card className="border border-gray-200">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 relative">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <Badge
                                  variant="secondary"
                                  className="bg-gray-100"
                                >
                                  {attribute.attribute}
                                </Badge>
                                <div className="flex items-center">
                                  {renderDynamicTitle(
                                    attribute.title,
                                    attribute.dynamic_part || "",
                                    index
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <div className="drag-handle cursor-move p-1">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                                {expandedAttributes.includes(attribute.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </div>

                            {!attribute.dynamic_part && (
                              <Badge
                                variant="destructive"
                                className="mt-2 w-fit"
                              >
                                جای خالی را باید با کلمه مناسب سوال تست خود آن
                                را پر کنید. مثل: تبلیغ، محصول، ویدیو و …
                              </Badge>
                            )}
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {attribute.type === "attribute" &&
                                  attribute.options && (
                                    <div>
                                      <div className="mb-2 text-sm font-medium">
                                        گزینه های سوال:
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {attribute.options.map(
                                          (option, oIndex) => (
                                            <Badge
                                              key={oIndex}
                                              variant="outline"
                                            >
                                              {option.value}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {attribute.type ===
                                  "attribute_text_question" && (
                                  <div className="text-sm text-gray-600">
                                    سوال متنی است
                                  </div>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index, true)}
                                disabled={removingIndex === index && apiLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                {removingIndex === index && apiLoading ? (
                                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </div>
                ))}
              </ReactSortable>

              <div className="mt-6">
                <Button
                  onClick={() => setIsAddAttrModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن ویژگی تست تبلیغ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Questions Section */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-700">
                  با افزودن سوال سفارشی، می‌توانید پرسش‌هایی را طراحی کنید که
                  دقیقاً متناسب با نیازهای خاص شما باشند.
                </p>
                <Button
                  onClick={() => setIsAddCustomQuestionModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن سوال سفارشی
                </Button>
              </div>

              <ReactSortable
                list={questions}
                setList={handleQuestionsReorder}
                animation={200}
                handle=".drag-handle"
                ghostClass="opacity-50"
                onEnd={handleDragEnd}
              >
                {questions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <Collapsible
                      open={expandedQuestions.includes(question.id)}
                      onOpenChange={() => toggleExpanded(question.id, false)}
                    >
                      <Card className="border border-gray-200">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 relative">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium">
                                  {question.title}
                                </h3>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <div className="drag-handle cursor-move p-1">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                                {expandedQuestions.includes(question.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-4">
                                <div>
                                  <span className="text-sm text-gray-600">
                                    نوع سوال:{" "}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {typeToString[question.type] ||
                                      question.type}
                                  </span>
                                </div>

                                {(question.type === "single_select" ||
                                  question.type === "multi_select" ||
                                  question.type === "prioritize") &&
                                  question.options && (
                                    <div>
                                      <div className="mb-2 text-sm font-medium">
                                        گزینه های سوال:
                                      </div>
                                      <ul className="space-y-1">
                                        {question.options.map(
                                          (option, oIndex) => (
                                            <li
                                              key={oIndex}
                                              className="text-sm text-gray-600"
                                            >
                                              • {option.value}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4 ml-1" />
                                  ویرایش
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(index, false)}
                                  disabled={
                                    removingIndex === index && apiLoading
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {removingIndex === index && apiLoading ? (
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </div>
                ))}
              </ReactSortable>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-6 left-6 flex items-center gap-4">
        <Button
          onClick={prevStep}
          variant="outline"
          className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          size="lg"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          مرحله قبل
        </Button>
        <Button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          مرحله بعد
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>
      </div>

      {/* Add Attribute Modal */}
      <AddAdTypeAttrModal
        isOpen={isAddAttrModalOpen}
        onClose={() => setIsAddAttrModalOpen(false)}
        onSave={() => {
          fetchQuestions();
          setIsAddAttrModalOpen(false);
        }}
        questionnaire={questionnaire}
      />

      {/* Add Custom Question Modal */}
      <AddCustomQuestionModal
        isOpen={isAddCustomQuestionModalOpen}
        onClose={() => setIsAddCustomQuestionModalOpen(false)}
        onSave={() => {
          fetchQuestions();
          setIsAddCustomQuestionModalOpen(false);
        }}
        questionnaire={questionnaire}
        existingQuestions={[...attributes, ...questions]}
      />
    </div>
  );
};

export default AdTestQuestions;
