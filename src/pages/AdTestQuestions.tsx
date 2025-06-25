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
  Monitor,
  Play,
  Palette,
  Building,
  MessageSquare,
  X,
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

  // Get ad test type info
  const getAdTestTypeInfo = () => {
    const adTestType = questionnaire?.questionnaire_type;
    
    switch (adTestType) {
      case "billboard":
        return {
          name: "تست تبلیغات محیطی (بیلبورد)",
          icon: <Monitor className="w-6 h-6 text-slate-600" />,
          color: "slate",
          bgGradient: "from-gray-50 to-slate-50",
          description: "ارزیابی تأثیر و کیفیت تبلیغات محیطی"
        };
      case "video":
        return {
          name: "تست تبلیغات ویدیویی",
          icon: <Play className="w-6 h-6 text-slate-600" />,
          color: "slate",
          bgGradient: "from-gray-50 to-slate-50",
          description: "ارزیابی تأثیر و کیفیت تبلیغات ویدیویی"
        };
      case "logo":
        return {
          name: "تست لوگو",
          icon: <Palette className="w-6 h-6 text-slate-600" />,
          color: "slate",
          bgGradient: "from-gray-50 to-slate-50",
          description: "ارزیابی تأثیر و کیفیت طراحی لوگو"
        };
      case "brand":
        return {
          name: "تست نام برند",
          icon: <Building className="w-6 h-6 text-slate-600" />,
          color: "slate",
          bgGradient: "from-gray-50 to-slate-50",
          description: "ارزیابی تأثیر و کیفیت نام برند"
        };
      case "slogan":
        return {
          name: "تست شعار برند",
          icon: <MessageSquare className="w-6 h-6 text-slate-600" />,
          color: "slate",
          bgGradient: "from-gray-50 to-slate-50",
          description: "ارزیابی تأثیر و کیفیت شعار برند"
        };
      default:
        return {
          name: "تست تبلیغات",
          icon: <Monitor className="w-6 h-6 text-slate-600" />,
          color: "slate",
          bgGradient: "from-gray-50 to-slate-50",
          description: "ارزیابی تأثیر و کیفیت تبلیغات"
        };
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-slate-600 dark:border-t-slate-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">در حال بارگذاری سؤالات...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-x-hidden"
      dir="rtl"
    >
      <FormHeader
        formTitle={questionnaire?.title || "تست تبلیغات"}
        setFormTitle={() => {}}
        steps={billboardSteps}
        backPath={`/adtest/${id}`}
      />

      {/* Fixed Header Sidebar */}
      {isSidebarVisible && (
                  <div className="fixed top-16 right-0 w-80 h-[calc(100vh-64px)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 overflow-y-auto">
        <div className="p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  {React.cloneElement(getAdTestTypeInfo().icon, { className: "w-4 h-4 text-slate-600" })}
                </div>
                <div className="text-center">
                  <h1 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                    {getAdTestTypeInfo().name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {getAdTestTypeInfo().description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xs font-medium text-gray-900 dark:text-white mb-1 text-center leading-relaxed">
                سؤالاتی که پس از نمایش محتوای شما از کاربران پرسیده خواهد شد
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-xs text-center leading-relaxed">
                این سؤالات به شما کمک می‌کنند تا تأثیر و کیفیت {questionnaire?.questionnaire_type === "billboard" ? "بیلبورد" : 
                questionnaire?.questionnaire_type === "video" ? "ویدیو" :
                questionnaire?.questionnaire_type === "logo" ? "لوگو" :
                questionnaire?.questionnaire_type === "brand" ? "نام برند" :
                questionnaire?.questionnaire_type === "slogan" ? "شعار برند" : "تبلیغ"} خود را بهتر درک کنید
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-4 space-y-2">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">ویژگی‌های تست</span>
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{attributes.length}</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">سؤالات سفارشی</span>
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Toggle Sidebar Button - Hidden for now */}
      {/* <div className="fixed top-24 right-4 z-50">
        <Button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white shadow-lg"
        >
          {isSidebarVisible ? (
            <X className="w-4 h-4" />
          ) : (
            <Edit className="w-4 h-4" />
          )}
        </Button>
      </div> */}

      {/* Main Content */}
      <div className={`flex-1 mt-16 p-4 pb-24 transition-all duration-300 ${isSidebarVisible ? 'pr-80' : 'pr-0'}`}>
        <div className="max-w-4xl mx-auto">

          {/* Ad Type Attributes Section */}
          <Card className="mb-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
            <CardHeader className="bg-slate-700 dark:bg-slate-800 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-7 h-7 bg-slate-600 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    {React.cloneElement(getAdTestTypeInfo().icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">ویژگی‌های تست تبلیغ</CardTitle>
                    <p className="text-slate-200 text-xs">سؤالات مربوط به ویژگی‌های خاص این نوع تبلیغ</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsAddAttrModalOpen(true)}
                  className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  variant="outline"
                >
                  <Plus className="w-3.5 h-3.5 ml-1.5" />
                  افزودن ویژگی تست
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {attributes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    {React.cloneElement(getAdTestTypeInfo().icon, { className: "w-6 h-6 text-gray-400" })}
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    هنوز ویژگی تست تبلیغی اضافه نشده
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    ویژگی‌های تست تبلیغ به شما کمک می‌کنند تا جنبه‌های مختلف {questionnaire?.questionnaire_type === "billboard" ? "بیلبورد" : 
                    questionnaire?.questionnaire_type === "video" ? "ویدیو" :
                    questionnaire?.questionnaire_type === "logo" ? "لوگو" :
                    questionnaire?.questionnaire_type === "brand" ? "نام برند" :
                    questionnaire?.questionnaire_type === "slogan" ? "شعار برند" : "تبلیغ"} خود را ارزیابی کنید
                  </p>
                </div>
              ) : (
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
                      <Card className={`border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                        expandedAttributes.includes(attribute.id) 
                          ? 'ring-2 ring-slate-200 dark:ring-slate-700' 
                          : ''
                      }`}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className={`cursor-pointer relative transition-all duration-200 ${
                            expandedAttributes.includes(attribute.id)
                              ? 'bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 space-x-reverse">
                                {/* Icon based on ad type */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  expandedAttributes.includes(attribute.id)
                                    ? 'bg-slate-100 dark:bg-slate-700'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                } transition-all duration-300`}>
                                  {React.cloneElement(getAdTestTypeInfo().icon, { 
                                    className: `w-5 h-5 ${
                                      expandedAttributes.includes(attribute.id)
                                        ? 'text-slate-600'
                                        : 'text-gray-500'
                                    } transition-all duration-200`
                                  })}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                    <Badge
                                      variant="secondary"
                                      className={`${
                                        expandedAttributes.includes(attribute.id)
                                          ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                      } transition-all duration-200 font-medium`}
                                    >
                                      {attribute.attribute}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`text-sm font-medium ${
                                      expandedAttributes.includes(attribute.id)
                                        ? 'text-gray-900'
                                        : 'text-gray-700'
                                    } transition-all duration-300`}>
                                      {renderDynamicTitle(
                                        attribute.title,
                                        attribute.dynamic_part || "",
                                        index
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <div className="drag-handle cursor-move p-2 rounded-lg hover:bg-white/50 transition-all duration-200">
                                  <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </div>
                                <div className={`p-2 rounded-lg transition-all duration-200 ${
                                  expandedAttributes.includes(attribute.id)
                                    ? 'bg-slate-100 dark:bg-slate-800'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                                }`}>
                                  {expandedAttributes.includes(attribute.id) ? (
                                    <ChevronUp className={`w-4 h-4 ${
                                      expandedAttributes.includes(attribute.id)
                                        ? 'text-slate-600 dark:text-slate-400'
                                        : 'text-gray-500'
                                    } transition-all duration-200`} />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500 transition-all duration-200" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {!attribute.dynamic_part && (
                              <div className="mt-3 pt-3 border-t border-red-100">
                                <div className="flex items-start space-x-2 space-x-reverse">
                                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  </div>
                                  <p className="text-xs text-red-600 leading-relaxed">
                                    جای خالی را باید با کلمه مناسب سوال تست خود پر کنید.
                                    <br />
                                    <span className="font-medium">مثال:</span> تبلیغ، محصول، ویدیو، لوگو و …
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0 bg-slate-50/30 dark:bg-slate-800/30">
                            <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {attribute.type === "attribute" &&
                                    attribute.options && (
                                      <div>
                                        <div className="flex items-center space-x-2 space-x-reverse mb-3">
                                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                          </div>
                                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            گزینه‌های سوال
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          {attribute.options.map(
                                            (option, oIndex) => (
                                              <div
                                                key={oIndex}
                                                className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                              >
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                                                  <span>{option.value}</span>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {attribute.type === "attribute_text_question" && (
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">سوال متنی</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">کاربران پاسخ آزاد می‌دهند</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(index, true)}
                                  disabled={removingIndex === index && apiLoading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 ml-4"
                                >
                                  {removingIndex === index && apiLoading ? (
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                  ) : (
                                    <div className="flex items-center space-x-1 space-x-reverse">
                                      <Trash2 className="w-4 h-4" />
                                      <span className="text-xs font-medium">حذف</span>
                                    </div>
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
              )}

              <div className="mt-6 text-center">
                <Button
                  onClick={() => setIsAddAttrModalOpen(true)}
                  className={`${getAdTestTypeInfo().color === "blue" ? "bg-blue-600 hover:bg-blue-700" :
                    getAdTestTypeInfo().color === "red" ? "bg-red-600 hover:bg-red-700" :
                    getAdTestTypeInfo().color === "purple" ? "bg-purple-600 hover:bg-purple-700" :
                    getAdTestTypeInfo().color === "green" ? "bg-green-600 hover:bg-green-700" :
                    getAdTestTypeInfo().color === "orange" ? "bg-orange-600 hover:bg-orange-700" :
                    "bg-gray-600 hover:bg-gray-700"} text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  <Plus className="w-5 h-5 ml-2" />
                  افزودن ویژگی تست تبلیغ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Questions Section */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="bg-slate-700 dark:bg-slate-800 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-7 h-7 bg-slate-600 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <Edit className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">سؤالات سفارشی</CardTitle>
                    <p className="text-slate-200 text-xs">سؤالات اختصاصی متناسب با نیازهای شما</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsAddCustomQuestionModalOpen(true)}
                  className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  variant="outline"
                >
                  <Plus className="w-3.5 h-3.5 ml-1.5" />
                  افزودن سوال سفارشی
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  با افزودن سوال سفارشی، می‌توانید پرسش‌هایی را طراحی کنید که
                  دقیقاً متناسب با نیازهای خاص شما باشند.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Edit className="w-8 h-8 text-gray-400 dark:text-gray-300" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    هنوز سؤال سفارشی‌ای اضافه نشده
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    با افزودن سؤالات سفارشی، می‌توانید اطلاعات بیشتری از کاربران جمع‌آوری کنید
                  </p>
                  <Button
                    onClick={() => setIsAddCustomQuestionModalOpen(true)}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 ml-1.5" />
                    افزودن اولین سؤال سفارشی
                  </Button>
                </div>
              ) : (
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
                                          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 relative border-l-4 border-l-transparent hover:border-l-slate-500 dark:hover:border-l-slate-400 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {question.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {typeToString[question.type] || question.type}
                              </p>
                            </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <div className="drag-handle cursor-move p-1">
                                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-300" />
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
                                  className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-all duration-200"
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
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className={`fixed bottom-6 left-6 flex items-center justify-between z-50 transition-all duration-300 ${isSidebarVisible ? 'right-96' : 'right-6'}`}>
        <Button
          onClick={prevStep}
          variant="outline"
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-200 px-6 py-3"
          size="lg"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          مرحله قبل
        </Button>
        <Button
          onClick={nextStep}
          className="bg-slate-700 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all duration-200 px-6 py-3"
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
