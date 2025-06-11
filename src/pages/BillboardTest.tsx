import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormHeader from "../components/FormHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Monitor,
  Play,
  Palette,
  Building,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { updateQuestionnaireType, Questionnaire } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import AdTestUploader from "../components/AdTestUploader";
import BrandSloganInput from "../components/BrandSloganInput";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface AdTestItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  value: string;
}

interface ApiQuestion {
  id: string;
  type: string;
  text: string;
  title: string;
  is_required: boolean;
  order: number;
  style?: string;
  attachment_type?: string;
  attachment?: string;
  related_group?: string;
  limit?: number;
  min_value?: number;
  max_value?: number;
  options?: Array<{
    id?: number;
    question?: number;
    depend_questionnaire?: string;
    priority: number;
    score: number;
    value: string;
    type: string;
    label?: string;
    option_kind: string;
    text?: string;
    is_other?: boolean;
    is_none?: boolean;
    is_all?: boolean;
    image_url?: string;
  }>;
  mappings?: Array<{
    id: number;
    conditions: Array<{
      id: number;
      comparison_type: string;
      target_text: string;
      operator: string;
      target_question: number;
      target_option: number | null;
    }>;
    the_end: boolean;
    question: number;
    next_question: number;
  }>;
}

const BillboardTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [formTitle, setFormTitle] = useState("تست تبلیغات");
  const [loading, setLoading] = useState(true);
  const [selectedAdTestType, setSelectedAdTestType] = useState<string>("");
  const [changingTypeDialog, setChangingTypeDialog] = useState(false);
  const [reserveSelectedAdTestType, setReserveSelectedAdTestType] =
    useState<string>("");
  const [changingTypeLoading, setChangingTypeLoading] = useState(false);
  const [hasQuestions, setHasQuestions] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );

  const billboardSteps = [
    { id: 1, title: "تعیین محتوا", path: `/adtest/${id}` },
    { id: 2, title: "سوالات", path: `/adtest/${id}/questions` },
    { id: 3, title: "انتخاب مخاطب", path: `/adtest/${id}/audience` },
    { id: 4, title: "گزارش نتایج", path: `/adtest/${id}/results` },
  ];

  const adTestItems: AdTestItem[] = [
    {
      id: 1,
      name: "تست تبلیغات محیطی(بیلبورد)",
      icon: <Monitor className="w-12 h-12 text-blue-600" />,
      value: "billboard",
    },
    {
      id: 2,
      name: "تست تبلیغات ویدیویی",
      icon: <Play className="w-12 h-12 text-red-600" />,
      value: "video",
    },
    {
      id: 3,
      name: "تست لوگو",
      icon: <Palette className="w-12 h-12 text-purple-600" />,
      value: "logo",
    },
    {
      id: 4,
      name: "تست نام برند",
      icon: <Building className="w-12 h-12 text-green-600" />,
      value: "brand",
    },
    {
      id: 5,
      name: "تست شعار برند",
      icon: <MessageSquare className="w-12 h-12 text-orange-600" />,
      value: "slogan",
    },
  ];

  const fetchQuestionnaire = async () => {
    if (!accessToken || !id) {
      return;
    }

    try {
      console.log("🔄 Fetching questionnaire for billboard test...");

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
      console.log("📋 Questionnaire API Response:", data);

      if (data.info.status === 200) {
        setQuestionnaire(data.data);
        setFormTitle(data.data.title);

        // Set selected ad test type from questionnaire_type
        if (data.data.questionnaire_type) {
          setSelectedAdTestType(data.data.questionnaire_type);
          console.log("📋 Questionnaire type:", data.data.questionnaire_type);
        }
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در دریافت اطلاعات پرسشنامه"
      );
    }
  };

  const fetchQuestions = async () => {
    if (!accessToken || !id) {
      return;
    }

    try {
      console.log("🔄 Fetching questions for billboard test...");

      const questionsResponse = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions-list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!questionsResponse.ok) {
        throw new Error("خطا در دریافت سوالات");
      }

      const questionsData = await questionsResponse.json();
      console.log("📋 Questions API Response:", questionsData);

      if (questionsData.info.status !== 200) {
        throw new Error(questionsData.info.message);
      }

      const questionsList = questionsData.data as ApiQuestion[];
      setQuestions(questionsList);

      // Update questions count based on test type
      let relevantQuestions;

      if (selectedAdTestType === "brand" || selectedAdTestType === "slogan") {
        // For brand/slogan tests, count all statement questions except the first one
        relevantQuestions = questionsList.filter(
          (q) => q.type === "statement" && q.order !== 1
        );
      } else {
        // For billboard/video/logo tests, count statement questions with order === 2
        relevantQuestions = questionsList.filter(
          (q) => q.type === "statement" && q.order === 2
        );
      }

      setQuestionsCount(relevantQuestions.length);
      setHasQuestions(relevantQuestions.length > 0);

      console.log("📋 Total questions:", questionsList.length);
      console.log("📋 Relevant questions:", relevantQuestions.length);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در دریافت سوالات"
      );
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);

      try {
        // Fetch questionnaire and questions if we have access token and id
        if (accessToken && id) {
          await fetchQuestionnaire();
          await fetchQuestions();
        }
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [accessToken, id]);

  const toggleType = async (value: string) => {
    console.log("🔄 Toggling type to:", value);
    console.log("📋 Current selected type:", selectedAdTestType);
    console.log("📋 Has questions:", hasQuestions);
    console.log("📋 Questions count:", questionsCount);
    console.log("📋 Questions list:", questions.length);

    setReserveSelectedAdTestType(value);

    // Show confirmation dialog if:
    // 1. Questions exist (either hasQuestions or actual questions in list)
    // 2. AND the new type is different from current type
    const actualQuestionsExist = questions.length > 0 || questionsCount > 0;
    const typeIsDifferent = value !== selectedAdTestType;

    console.log("📋 Actual questions exist:", actualQuestionsExist);
    console.log("📋 Type is different:", typeIsDifferent);

    if (actualQuestionsExist && typeIsDifferent) {
      console.log("✅ Showing confirmation dialog");
      setChangingTypeDialog(true);
    } else {
      console.log("❌ Not showing dialog, proceeding with change");
      setSelectedAdTestType(value);
      if (typeIsDifferent) {
        await changeType();
      }
    }
  };

  const changeType = async () => {
    if (!accessToken || !id) {
      toast.error("خطا در احراز هویت یا شناسه پرسشنامه");
      return;
    }

    setChangingTypeLoading(true);

    try {
      // Call real API to update questionnaire type
      await updateQuestionnaireType(id, reserveSelectedAdTestType, accessToken);

      setSelectedAdTestType(reserveSelectedAdTestType);
      setChangingTypeDialog(false);
      setChangingTypeLoading(false);

      // Reset questions after changing type
      setQuestionsCount(0);
      setHasQuestions(false);

      toast.success("نوع تست تبلیغ با موفقیت تغییر یافت");

      // Refresh questionnaire data to ensure it's up to date
      await fetchQuestionnaire();

      // Refetch questions after changing type
      await fetchQuestions();
    } catch (error) {
      console.error("Error updating questionnaire type:", error);
      setChangingTypeLoading(false);
      toast.error("خطا در تغییر نوع تست تبلیغ");
    }
  };

  const nextStep = () => {
    if (!selectedAdTestType) {
      toast.error("لطفا نوع تست تبلیغ را انتخاب کنید");
      return;
    }
    navigate(`/adtest/${id}/questions`);
  };

  const renderAdTestContent = () => {
    if (!selectedAdTestType) return null;

    // Show uploader for types that support file upload
    if (
      selectedAdTestType === "billboard" ||
      selectedAdTestType === "video" ||
      selectedAdTestType === "logo"
    ) {
      return (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <AdTestUploader
              key={selectedAdTestType} // Force re-mount when type changes
              adTestType={selectedAdTestType as "billboard" | "video" | "logo"}
              questions={questions}
              onQuestionsUpdate={fetchQuestions}
            />
          </div>
        </div>
      );
    }

    // For brand and slogan types, show brand/slogan input
    if (selectedAdTestType === "brand" || selectedAdTestType === "slogan") {
      return (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <BrandSloganInput
              key={selectedAdTestType} // Force re-mount when type changes
              adTestType={selectedAdTestType as "brand" | "slogan"}
              questions={questions}
              onQuestionsUpdate={fetchQuestions}
            />
          </div>
        </div>
      );
    }

    // For other types, show placeholder
    return (
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              محتوای{" "}
              {
                adTestItems.find((item) => item.value === selectedAdTestType)
                  ?.name
              }
            </h3>
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center mb-4">
                {
                  adTestItems.find((item) => item.value === selectedAdTestType)
                    ?.icon
                }
              </div>
              <p className="text-gray-600 mb-4">
                کامپوننت مخصوص {selectedAdTestType} در حال توسعه است
              </p>
              <p className="text-sm text-gray-500">
                این قسمت در آپدیت بعدی اضافه خواهد شد
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        steps={billboardSteps}
        backPath="/surveys"
      />

      {/* Main Content */}
      <div className="flex-1 mt-20 p-6 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              نوع تست تبلیغ خود را انتخاب کنید
            </h2>
            <p className="text-gray-600">
              برای شروع تست تبلیغات، ابتدا نوع تست مورد نظر خود را انتخاب کنید
            </p>
          </div>

          {/* Ad Test Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {adTestItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedAdTestType === item.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleType(item.value)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h3 className="text-sm font-medium text-gray-900 leading-tight">
                    {item.name}
                  </h3>
                  {selectedAdTestType === item.value && (
                    <div className="mt-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Based on Selection */}
          {renderAdTestContent()}
        </div>
      </div>

      {/* Fixed Next Button */}
      <div className="fixed bottom-6 left-6">
        <Button
          onClick={nextStep}
          disabled={!selectedAdTestType || questionsCount === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg disabled:bg-gray-400"
          size="lg"
        >
          مرحله بعد
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Change Type Confirmation Dialog */}
      <Dialog open={changingTypeDialog} onOpenChange={setChangingTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">هشدار!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 leading-relaxed">
              کاربر عزیز با تغییر نوع تست، محتواهایی که وارد کردید پاک می‌شود.
              آیا برای تغییر نوع تست مطمئن هستید؟
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setChangingTypeDialog(false)}
              disabled={changingTypeLoading}
            >
              لغو
            </Button>
            <Button
              onClick={changeType}
              disabled={changingTypeLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {changingTypeLoading ? "در حال تغییر..." : "تایید"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillboardTest;
