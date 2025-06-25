import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormHeader from "../components/FormHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  Edit,
  Trash2,
  Edit2,
  Check,
  X,
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
  const [selectedBillboard, setSelectedBillboard] = useState<string | null>(null);
  const [editingBillboard, setEditingBillboard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  
  // Video states
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editingVideoTitle, setEditingVideoTitle] = useState<string>("");

  // Logo states
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [editingLogo, setEditingLogo] = useState<string | null>(null);
  const [editingLogoTitle, setEditingLogoTitle] = useState<string>("");

  // Brand states
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingBrandTitle, setEditingBrandTitle] = useState<string>("");

  // Slogan states
  const [selectedSlogan, setSelectedSlogan] = useState<string | null>(null);
  const [editingSlogan, setEditingSlogan] = useState<string | null>(null);
  const [editingSloganTitle, setEditingSloganTitle] = useState<string>("");

  // Filter statement questions that are not the first one (order !== 1) and have attachments
  const billboardImages = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.attachment
  );
  
  // Filter video questions
  const videoFiles = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.attachment && q.attachment_type === "video"
  );

  // Filter logo questions
  const logoImages = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.attachment && q.attachment_type === "image"
  );

  // Filter brand questions (text-based)
  const brandTexts = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.title && !q.attachment
  );

  // Filter slogan questions (text-based)
  const sloganTexts = questions.filter(
    (q) => q.type === "statement" && q.order !== 1 && q.title && !q.attachment
  );

  // Set selected billboard to first one if not already set
  useEffect(() => {
    if (selectedAdTestType === "billboard" && billboardImages.length > 0 && !selectedBillboard) {
      setSelectedBillboard(billboardImages[0].id);
    }
  }, [selectedAdTestType, billboardImages, selectedBillboard]);

  // Set selected video to first one if not already set
  useEffect(() => {
    if (selectedAdTestType === "video" && videoFiles.length > 0 && !selectedVideo) {
      setSelectedVideo(videoFiles[0].id);
    }
  }, [selectedAdTestType, videoFiles, selectedVideo]);

  // Set selected logo to first one if not already set
  useEffect(() => {
    if (selectedAdTestType === "logo" && logoImages.length > 0 && !selectedLogo) {
      setSelectedLogo(logoImages[0].id);
    }
  }, [selectedAdTestType, logoImages, selectedLogo]);

  // Set selected brand to first one if not already set
  useEffect(() => {
    if (selectedAdTestType === "brand" && brandTexts.length > 0 && !selectedBrand) {
      setSelectedBrand(brandTexts[0].id);
    }
  }, [selectedAdTestType, brandTexts, selectedBrand]);

  // Set selected slogan to first one if not already set
  useEffect(() => {
    if (selectedAdTestType === "slogan" && sloganTexts.length > 0 && !selectedSlogan) {
      setSelectedSlogan(sloganTexts[0].id);
    }
  }, [selectedAdTestType, sloganTexts, selectedSlogan]);

  // Helper function to get display title without prefix
  const getDisplayTitle = (title: string) => {
    const match = title.match(/^\[.*?\]\s*/);
    return match ? title.slice(match[0].length) : title;
  };

  // Billboard management functions
  const handleEditBillboard = (billboardId: string) => {
    const billboard = billboardImages.find(b => b.id === billboardId);
    if (billboard) {
      setEditingBillboard(billboardId);
      setEditingTitle(getDisplayTitle(billboard.title) || "");
    }
  };

  const handleSaveBillboardEdit = async () => {
    if (editingBillboard && editingTitle.trim()) {
      const prefix = "[5] ";
      const newTitle = prefix + editingTitle.trim();
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${editingBillboard}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی عنوان");
        }

        setEditingBillboard(null);
        setEditingTitle("");
        handleQuestionsUpdate();
        toast.success("عنوان بیلبورد بروزرسانی شد");
      } catch (error) {
        toast.error("خطا در بروزرسانی عنوان");
      }
    }
  };

  const handleCancelBillboardEdit = () => {
    setEditingBillboard(null);
    setEditingTitle("");
  };

  const handleDeleteBillboard = async (billboardId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${billboardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        handleQuestionsUpdate();
        if (selectedBillboard === billboardId) {
          setSelectedBillboard(null);
        }
        toast.success("بیلبورد حذف شد");
      } else {
        throw new Error("خطا در حذف بیلبورد");
      }
    } catch (error) {
      toast.error("خطا در حذف بیلبورد");
    }
  };

  // Video management functions
  const handleEditVideo = (videoId: string) => {
    const video = videoFiles.find(v => v.id === videoId);
    if (video) {
      setEditingVideo(videoId);
      setEditingVideoTitle(getDisplayTitle(video.title) || "");
    }
  };

  const handleSaveVideoEdit = async () => {
    if (editingVideo && editingVideoTitle.trim()) {
      const prefix = "[5] ";
      const newTitle = prefix + editingVideoTitle.trim();
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${editingVideo}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی عنوان");
        }

        setEditingVideo(null);
        setEditingVideoTitle("");
        handleQuestionsUpdate();
        toast.success("عنوان ویدئو بروزرسانی شد");
      } catch (error) {
        toast.error("خطا در بروزرسانی عنوان");
      }
    }
  };

  const handleCancelVideoEdit = () => {
    setEditingVideo(null);
    setEditingVideoTitle("");
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        handleQuestionsUpdate();
        if (selectedVideo === videoId) {
          setSelectedVideo(null);
        }
        toast.success("ویدئو حذف شد");
      } else {
        throw new Error("خطا در حذف ویدئو");
      }
    } catch (error) {
      toast.error("خطا در حذف ویدئو");
    }
  };

  // Logo management functions
  const handleEditLogo = (logoId: string) => {
    const logo = logoImages.find(l => l.id === logoId);
    if (logo) {
      setEditingLogo(logoId);
      setEditingLogoTitle(getDisplayTitle(logo.title) || "");
    }
  };

  const handleSaveLogoEdit = async () => {
    if (editingLogo && editingLogoTitle.trim()) {
      const prefix = "[5] ";
      const newTitle = prefix + editingLogoTitle.trim();
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${editingLogo}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی عنوان");
        }

        setEditingLogo(null);
        setEditingLogoTitle("");
        handleQuestionsUpdate();
        toast.success("عنوان لوگو بروزرسانی شد");
      } catch (error) {
        toast.error("خطا در بروزرسانی عنوان");
      }
    }
  };

  const handleCancelLogoEdit = () => {
    setEditingLogo(null);
    setEditingLogoTitle("");
  };

  const handleDeleteLogo = async (logoId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${logoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        handleQuestionsUpdate();
        if (selectedLogo === logoId) {
          setSelectedLogo(null);
        }
        toast.success("لوگو حذف شد");
      } else {
        throw new Error("خطا در حذف لوگو");
      }
    } catch (error) {
      toast.error("خطا در حذف لوگو");
    }
  };

  // Brand management functions
  const handleEditBrand = (brandId: string) => {
    const brand = brandTexts.find(b => b.id === brandId);
    if (brand) {
      setEditingBrand(brandId);
      setEditingBrandTitle(getDisplayTitle(brand.title) || "");
    }
  };

  const handleSaveBrandEdit = async () => {
    if (editingBrand && editingBrandTitle.trim()) {
      const prefix = "[brand] ";
      const newTitle = prefix + editingBrandTitle.trim();
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${editingBrand}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی عنوان");
        }

        setEditingBrand(null);
        setEditingBrandTitle("");
        handleQuestionsUpdate();
        toast.success("نام برند بروزرسانی شد");
      } catch (error) {
        toast.error("خطا در بروزرسانی نام برند");
      }
    }
  };

  const handleCancelBrandEdit = () => {
    setEditingBrand(null);
    setEditingBrandTitle("");
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${brandId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        handleQuestionsUpdate();
        if (selectedBrand === brandId) {
          setSelectedBrand(null);
        }
        toast.success("نام برند حذف شد");
      } else {
        throw new Error("خطا در حذف نام برند");
      }
    } catch (error) {
      toast.error("خطا در حذف نام برند");
    }
  };

  // Slogan management functions
  const handleEditSlogan = (sloganId: string) => {
    const slogan = sloganTexts.find(s => s.id === sloganId);
    if (slogan) {
      setEditingSlogan(sloganId);
      setEditingSloganTitle(getDisplayTitle(slogan.title) || "");
    }
  };

  const handleSaveSloganEdit = async () => {
    if (editingSlogan && editingSloganTitle.trim()) {
      const prefix = "[slogan] ";
      const newTitle = prefix + editingSloganTitle.trim();
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/questionnaire/${editingSlogan}/questions/update/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در بروزرسانی عنوان");
        }

        setEditingSlogan(null);
        setEditingSloganTitle("");
        handleQuestionsUpdate();
        toast.success("شعار برند بروزرسانی شد");
      } catch (error) {
        toast.error("خطا در بروزرسانی شعار برند");
      }
    }
  };

  const handleCancelSloganEdit = () => {
    setEditingSlogan(null);
    setEditingSloganTitle("");
  };

  const handleDeleteSlogan = async (sloganId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${sloganId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        handleQuestionsUpdate();
        if (selectedSlogan === sloganId) {
          setSelectedSlogan(null);
        }
        toast.success("شعار برند حذف شد");
      } else {
        throw new Error("خطا در حذف شعار برند");
      }
    } catch (error) {
      toast.error("خطا در حذف شعار برند");
    }
  };

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



  const handleQuestionsUpdate = () => {
    fetchQuestions();
  };



  const nextStep = () => {
    if (!selectedAdTestType) {
      toast.error("لطفا نوع تست تبلیغ را انتخاب کنید");
      return;
    }
    navigate(`/adtest/${id}/questions`);
  };

  const renderAdTestContent = () => {
    if (!selectedAdTestType) {
      return (
                      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ArrowLeft className="w-8 h-8 text-gray-400 dark:text-gray-300 transform rotate-180" />
            </div>
                          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              نوع تست تبلیغ را انتخاب کنید
            </h3>
            <p className="text-sm text-gray-500">
              برای شروع، نوع تست مورد نظر خود را از sidebar انتخاب کنید
            </p>
          </div>
        </div>
      );
    }

    // Billboard Test - شبیه بیلبورد واقعی
    if (selectedAdTestType === "billboard") {

      return (
        
          <div className="flex gap-6">
            {/* Right Side - Upload and Management */}
            <div className="w-[500px]">
              {/* Billboard Management Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">بیلبوردهای آپلود شده</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">مدیریت محتوای بیلبورد</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {billboardImages.length} بیلبورد
                  </div>
                </div>

                {/* Upload Area */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-blue-100 dark:border-blue-800">
            <AdTestUploader
                    key={selectedAdTestType}
              adTestType={selectedAdTestType as "billboard" | "video" | "logo"}
              questions={questions}
                    onQuestionsUpdate={handleQuestionsUpdate}
            />
          </div>

                {/* Billboard List */}
                <div>
                  {billboardImages.length > 0 ? (
                    <div className="space-y-3">
                      {billboardImages.map((billboard, index) => (
                        <div
                          key={billboard.id}
                          className={`
                            bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all duration-200
                            ${selectedBillboard === billboard.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-4 space-x-reverse">
                            {/* Billboard Thumbnail */}
                            <div 
                              onClick={() => setSelectedBillboard(billboard.id)}
                              className="relative w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                            >
                              <img 
                                src={billboard.attachment || ""}
                                alt={getDisplayTitle(billboard.title)}
                                className="w-full h-full object-cover"
                              />
                              {selectedBillboard === billboard.id && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                                </div>
                              )}
                            </div>

                            {/* Billboard Info */}
                            <div className="flex-1 min-w-0">
                              {editingBillboard === billboard.id ? (
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Input
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="عنوان بیلبورد"
                                    dir="rtl"
                                  />
                                  <Button
                                    onClick={handleSaveBillboardEdit}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={handleCancelBillboardEdit}
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="text-gray-900 dark:text-white font-medium truncate">
                                    {getDisplayTitle(billboard.title) || "بیلبورد بدون نام"}
                                  </h4>
                                  <p className="text-gray-500 text-sm">
                                    تصویر بیلبورد • {billboard.attachment_type || 'image'}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {editingBillboard !== billboard.id && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Button
                                  onClick={() => handleEditBillboard(billboard.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-400 text-gray-600 hover:bg-gray-100"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteBillboard(billboard.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Monitor className="w-6 h-6 text-blue-500" />
                      </div>
                      <h4 className="text-gray-600 font-medium mb-1">هنوز بیلبوردی آپلود نشده</h4>
                      <p className="text-gray-500 text-sm">تصویر بیلبورد خود را از بالا آپلود کنید</p>
                    </div>
                  )}
                </div>
                
              
              </div>
            </div>

                          {/* Left Side - Billboard Display */}
              <div className="flex-1">
                <div className="sticky top-6  bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 rounded-3xl p-8 shadow-2xl h-[600px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20 rounded-3xl"></div>
                  <div className="relative h-full">
                  {/* Billboard Support Posts */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-16 bg-gray-600 rounded-full shadow-lg"></div>
                    <div className="w-8 h-4 bg-gray-700 rounded-full -mt-2 -ml-2.5"></div>
                  </div>
                  
                  {/* Billboard Content Area */}
                  <div className="bg-white rounded-2xl p-4 h-full shadow-inner flex flex-col">
                    {(() => {
                      const selectedBillboardData = billboardImages.find(b => b.id === selectedBillboard);
                      return selectedBillboardData ? (
                        // نمایش بیلبورد انتخاب شده
                        <div className="h-full flex flex-col">
                          <div className="flex-1 relative rounded-xl overflow-hidden">
                            <img 
                              src={selectedBillboardData.attachment || ""}
                              alt={getDisplayTitle(selectedBillboardData.title)}
                              className="w-full h-full object-contain"
                            />
                            {/* Billboard Title Overlay */}
                            <div className="absolute top-4 left-4 right-4">
                              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                                <h3 className="text-white font-bold text-lg">
                                  تبلیغات محیطی (بیلبورد)
                                </h3>
                                <p className="text-gray-300 text-sm">
                                  {getDisplayTitle(selectedBillboardData.title)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // حالت پیش‌فرض
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 h-full flex flex-col items-center justify-center">
                          <Monitor className="w-16 h-16 text-blue-600 mb-4" />
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            تبلیغات محیطی (بیلبورد)
                          </h3>
                          <p className="text-gray-600 text-center">
                            تصویر بیلبورد خود را از سمت راست بارگذاری کنید
                          </p>
        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Billboard Brand Strip */}
                  <div className="absolute -bottom-3 left-4 right-4 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">OUTDOOR ADVERTISING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      
      );
    }

    // Video Test - شبیه ویدئو پلیر واقعی
    if (selectedAdTestType === "video") {
      return (
        <div className="flex gap-6">
          {/* Right Side - Upload and Management */}
          <div className="w-[500px]">
            {/* Video Management Section */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">ویدئوهای آپلود شده</h3>
                    <p className="text-gray-600 text-sm">مدیریت محتوای ویدئویی</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {videoFiles.length} ویدئو
                </div>
              </div>

              {/* Upload Area */}
              <div className=" mb-6 shadow-sm ">
                <AdTestUploader
                  key={selectedAdTestType}
                  adTestType={selectedAdTestType as "billboard" | "video" | "logo"}
              questions={questions}
                  onQuestionsUpdate={handleQuestionsUpdate}
                />
              </div>

              {/* Video List */}
              <div>
                {videoFiles.length > 0 ? (
                  <div className="space-y-3">
                    {videoFiles.map((video, index) => (
                      <div
                        key={video.id}
                        className={`
                          bg-white rounded-xl p-4 border-2 transition-all duration-200
                          ${selectedVideo === video.id 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          {/* Video Thumbnail */}
                          <div 
                            onClick={() => setSelectedVideo(video.id)}
                            className="relative w-20 h-12 bg-gray-900 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center"
                          >
                            <Play className="w-6 h-6 text-white" />
                            {selectedVideo === video.id && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            {editingVideo === video.id ? (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Input
                                  value={editingVideoTitle}
                                  onChange={(e) => setEditingVideoTitle(e.target.value)}
                                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                                  placeholder="عنوان ویدئو"
                                  dir="rtl"
                                />
                                <Button
                                  onClick={handleSaveVideoEdit}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={handleCancelVideoEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-400 text-gray-600 hover:bg-gray-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-gray-900 font-medium truncate">
                                  {getDisplayTitle(video.title) || "ویدئو بدون نام"}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  فایل ویدئویی • {video.attachment_type || 'video'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {editingVideo !== video.id && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Button
                                onClick={() => handleEditVideo(video.id)}
                                size="sm"
                                variant="outline"
                                className="border-gray-400 text-gray-600 hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteVideo(video.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Play className="w-6 h-6 text-red-500" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-1">هنوز ویدئویی آپلود نشده</h4>
                    <p className="text-gray-500 text-sm">فایل ویدئو خود را از بالا آپلود کنید</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Side - Video Player Display */}
          <div className="flex-1">
            <div className="sticky top-6 bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-3xl p-8 shadow-2xl h-[600px]">
              <div className="relative h-full">
                {/* Video Player Area */}
                <div className="bg-black rounded-2xl h-full shadow-inner flex flex-col relative overflow-hidden">
                  {(() => {
                    const selectedVideoData = videoFiles.find(v => v.id === selectedVideo);
                    return selectedVideoData ? (
                      // نمایش ویدئو انتخاب شده
                      <div className="h-full flex flex-col relative">
                        <video 
                          src={selectedVideoData.attachment || ""}
                          controls
                          className="w-full h-full object-contain rounded-2xl"
                          poster=""
                        />
                        {/* Video Title Overlay */}
                        <div className="absolute top-4 left-4 right-4">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                            <h3 className="text-white font-bold text-lg">
                              تبلیغات ویدیویی
                            </h3>
                            <p className="text-gray-300 text-sm">
                              {getDisplayTitle(selectedVideoData.title)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // حالت پیش‌فرض
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                          <Play className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          تبلیغات ویدیویی
                        </h3>
                        <p className="text-gray-400 text-center">
                          فایل ویدئو خود را از سمت راست بارگذاری کنید
                        </p>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Video Player Controls Strip */}
                <div className="absolute -bottom-3 left-4 right-4 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">VIDEO ADVERTISING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Logo Test - شبیه showcase لوگو
    if (selectedAdTestType === "logo") {
    return (
        <div className="flex gap-6">
          {/* Right Side - Upload and Management */}
          <div className="w-[500px]">
            {/* Logo Management Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">لوگوهای آپلود شده</h3>
                    <p className="text-gray-600 text-sm">مدیریت محتوای لوگو</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {logoImages.length} لوگو
                </div>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-purple-100">
                <AdTestUploader
                  key={selectedAdTestType}
                  adTestType={selectedAdTestType as "billboard" | "video" | "logo"}
                  questions={questions}
                  onQuestionsUpdate={handleQuestionsUpdate}
                />
              </div>

              {/* Logo List */}
              <div>
                {logoImages.length > 0 ? (
                  <div className="space-y-3">
                    {logoImages.map((logo, index) => (
                      <div
                        key={logo.id}
                        className={`
                          bg-white rounded-xl p-4 border-2 transition-all duration-200
                          ${selectedLogo === logo.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          {/* Logo Thumbnail */}
                          <div 
                            onClick={() => setSelectedLogo(logo.id)}
                            className="relative w-20 h-12 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                          >
                            <img 
                              src={logo.attachment || ""}
                              alt={getDisplayTitle(logo.title)}
                              className="w-full h-full object-contain"
                            />
                            {selectedLogo === logo.id && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          {/* Logo Info */}
                          <div className="flex-1 min-w-0">
                            {editingLogo === logo.id ? (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Input
                                  value={editingLogoTitle}
                                  onChange={(e) => setEditingLogoTitle(e.target.value)}
                                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                                  placeholder="عنوان لوگو"
                                  dir="rtl"
                                />
                                <Button
                                  onClick={handleSaveLogoEdit}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={handleCancelLogoEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-400 text-gray-600 hover:bg-gray-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-gray-900 font-medium truncate">
                                  {getDisplayTitle(logo.title) || "لوگو بدون نام"}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  تصویر لوگو • {logo.attachment_type || 'image'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {editingLogo !== logo.id && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Button
                                onClick={() => handleEditLogo(logo.id)}
                                size="sm"
                                variant="outline"
                                className="border-gray-400 text-gray-600 hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteLogo(logo.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Palette className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-1">هنوز لوگویی آپلود نشده</h4>
                    <p className="text-gray-500 text-sm">تصویر لوگو خود را از بالا آپلود کنید</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Side - Logo Display */}
          <div className="flex-1">
            <div className="sticky top-6 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 rounded-3xl p-8 shadow-2xl h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20 rounded-3xl"></div>
              <div className="relative h-full">
                {/* Logo Showcase Area */}
                <div className="h-full flex flex-col">
                  {(() => {
                    const selectedLogoData = logoImages.find(l => l.id === selectedLogo);
                    return selectedLogoData ? (
                      // نمایش لوگو انتخاب شده
                      <div className="h-full flex flex-col">
                        {/* Logo Title */}
                        <div className="mb-6">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                            <h3 className="text-white font-bold text-lg">
                              تبلیغات لوگو برند
            </h3>
                            <p className="text-gray-300 text-sm">
                              {getDisplayTitle(selectedLogoData.title)}
                            </p>
                          </div>
                        </div>

                        {/* Logo Display - White Background Only */}
                        <div className="flex-1 flex items-center justify-center">
                          <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-200 max-w-md w-full">
                            <div className="text-center mb-4">
                              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                نمایش لوگو
                              </span>
                            </div>
                            <div className="flex items-center justify-center min-h-[200px]">
                              <img 
                                src={selectedLogoData.attachment || ""}
                                alt={getDisplayTitle(selectedLogoData.title)}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // حالت پیش‌فرض
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                          <Palette className="w-10 h-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          تبلیغات لوگو برند
                        </h3>
                        <p className="text-gray-300 text-center">
                          لوگوی برند خود را از سمت راست بارگذاری کنید
                        </p>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Logo Brand Strip */}
                <div className="absolute -bottom-3 left-4 right-4 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-white">BRAND LOGO SHOWCASE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Brand Name Test - شبیه نمایش نام برند
    if (selectedAdTestType === "brand") {
      return (
        <div className="flex gap-6">
          {/* Right Side - Upload and Management */}
          <div className="w-[500px]">
            {/* Brand Management Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building className="w-5 h-5 text-white" />
              </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">نام‌های برند</h3>
                    <p className="text-gray-600 text-sm">مدیریت نام‌های برند</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {brandTexts.length} نام برند
                </div>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-green-100">
                <BrandSloganInput
                  key={selectedAdTestType}
                  adTestType={selectedAdTestType as "brand" | "slogan"}
                  questions={questions}
                  onQuestionsUpdate={handleQuestionsUpdate}
                />
              </div>

              {/* Brand List */}
              <div>
                {brandTexts.length > 0 ? (
                  <div className="space-y-3">
                    {brandTexts.map((brand, index) => (
                      <div
                        key={brand.id}
                        className={`
                          bg-white rounded-xl p-4 border-2 transition-all duration-200
                          ${selectedBrand === brand.id 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          {/* Brand Preview */}
                          <div 
                            onClick={() => setSelectedBrand(brand.id)}
                            className="relative w-20 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center"
                          >
                            <span className="text-xs font-bold text-green-800 truncate px-2">
                              {getDisplayTitle(brand.title) || "نام برند"}
                            </span>
                            {selectedBrand === brand.id && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          {/* Brand Info */}
                          <div className="flex-1 min-w-0">
                            {editingBrand === brand.id ? (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Input
                                  value={editingBrandTitle}
                                  onChange={(e) => setEditingBrandTitle(e.target.value)}
                                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                                  placeholder="نام برند"
                                  dir="rtl"
                                />
                                <Button
                                  onClick={handleSaveBrandEdit}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={handleCancelBrandEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-400 text-gray-600 hover:bg-gray-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-gray-900 font-medium truncate">
                                  {getDisplayTitle(brand.title) || "نام برند"}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  نام برند • متن
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {editingBrand !== brand.id && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Button
                                onClick={() => handleEditBrand(brand.id)}
                                size="sm"
                                variant="outline"
                                className="border-gray-400 text-gray-600 hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteBrand(brand.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-1">هنوز نام برندی اضافه نشده</h4>
                    <p className="text-gray-500 text-sm">نام برند خود را از بالا اضافه کنید</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Side - Brand Display */}
          <div className="flex-1">
            <div className="sticky top-6 bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 rounded-3xl p-8 shadow-2xl h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-transparent to-emerald-400/20 rounded-3xl"></div>
              <div className="relative h-full">
                {/* Brand Display Area */}
                <div className="h-full flex flex-col">
                  {(() => {
                    const selectedBrandData = brandTexts.find(b => b.id === selectedBrand);
                    return selectedBrandData ? (
                      // نمایش نام برند انتخاب شده
                      <div className="h-full flex flex-col">
                        {/* Brand Title */}
                        <div className="mb-6">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                            <h3 className="text-white font-bold text-lg">
                              تبلیغات نام برند
                            </h3>
                            <p className="text-gray-300 text-sm">
                              نمایش هویت برند
              </p>
            </div>
          </div>

                        {/* Brand Name Display */}
                        <div className="flex-1 flex items-center justify-center">
                          <div className="bg-white rounded-xl p-12 shadow-lg border border-green-200 max-w-md w-full">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-gray-800 mb-4 tracking-wide">
                                {getDisplayTitle(selectedBrandData.title) || "نام برند"}
        </div>
                              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-4 rounded-full"></div>
                              <div className="text-sm text-gray-600 uppercase tracking-widest">
                                هویت برند شما
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // حالت پیش‌فرض
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                          <Building className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          تبلیغات نام برند
                        </h3>
                        <p className="text-gray-300 text-center">
                          نام برند خود را از سمت راست اضافه کنید
                        </p>
      </div>
    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Slogan Test - شبیه نمایش شعار
    if (selectedAdTestType === "slogan") {
      return (
        <div className="flex gap-6">
          {/* Right Side - Upload and Management */}
          <div className="w-[500px]">
            {/* Slogan Management Section */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">شعارهای برند</h3>
                    <p className="text-gray-600 text-sm">مدیریت شعارهای برند</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {sloganTexts.length} شعار
                </div>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-orange-100">
                <BrandSloganInput
                  key={selectedAdTestType}
                  adTestType={selectedAdTestType as "brand" | "slogan"}
                  questions={questions}
                  onQuestionsUpdate={handleQuestionsUpdate}
                />
              </div>

              {/* Slogan List */}
              <div>
                {sloganTexts.length > 0 ? (
                  <div className="space-y-3">
                    {sloganTexts.map((slogan, index) => (
                      <div
                        key={slogan.id}
                        className={`
                          bg-white rounded-xl p-4 border-2 transition-all duration-200
                          ${selectedSlogan === slogan.id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          {/* Slogan Preview */}
                          <div 
                            onClick={() => setSelectedSlogan(slogan.id)}
                            className="relative w-20 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center"
                          >
                            <span className="text-xs font-medium text-orange-800 truncate px-2 italic">
                              "{getDisplayTitle(slogan.title) || "شعار"}"
                            </span>
                            {selectedSlogan === slogan.id && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          {/* Slogan Info */}
                          <div className="flex-1 min-w-0">
                            {editingSlogan === slogan.id ? (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Input
                                  value={editingSloganTitle}
                                  onChange={(e) => setEditingSloganTitle(e.target.value)}
                                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                                  placeholder="شعار برند"
                                  dir="rtl"
                                />
                                <Button
                                  onClick={handleSaveSloganEdit}
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={handleCancelSloganEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-400 text-gray-600 hover:bg-gray-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-gray-900 font-medium truncate">
                                  {getDisplayTitle(slogan.title) || "شعار برند"}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  شعار برند • متن
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {editingSlogan !== slogan.id && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Button
                                onClick={() => handleEditSlogan(slogan.id)}
                                size="sm"
                                variant="outline"
                                className="border-gray-400 text-gray-600 hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSlogan(slogan.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-orange-500" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-1">هنوز شعاری اضافه نشده</h4>
                    <p className="text-gray-500 text-sm">شعار برند خود را از بالا اضافه کنید</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Side - Slogan Display */}
          <div className="flex-1">
            <div className="sticky top-6 bg-gradient-to-b from-orange-900 via-orange-800 to-yellow-900 rounded-3xl p-8 shadow-2xl h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-transparent to-yellow-400/20 rounded-3xl"></div>
              <div className="relative h-full">
                {/* Slogan Display Area */}
                <div className="h-full flex flex-col">
                  {(() => {
                    const selectedSloganData = sloganTexts.find(s => s.id === selectedSlogan);
                    return selectedSloganData ? (
                      // نمایش شعار انتخاب شده
                      <div className="h-full flex flex-col">
                        {/* Slogan Title */}
                        <div className="mb-6">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                            <h3 className="text-white font-bold text-lg">
                              تبلیغات شعار برند
                            </h3>
                            <p className="text-gray-300 text-sm">
                              صدای برند شما
                            </p>
                          </div>
                        </div>

                        {/* Slogan Display */}
                        <div className="flex-1 flex items-center justify-center">
                          <div className="bg-white rounded-xl p-12 shadow-lg border border-orange-200 max-w-lg w-full">
                            <div className="text-center">
                              <div className="text-2xl font-semibold text-gray-800 mb-4 italic leading-relaxed">
                                "{getDisplayTitle(selectedSloganData.title) || "شعار برند شما"}"
                              </div>
                              <div className="w-32 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400 mx-auto mb-4 rounded-full"></div>
                              <div className="text-sm text-gray-600 uppercase tracking-widest">
                                صدای برند شما
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // حالت پیش‌فرض
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="w-10 h-10 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          تبلیغات شعار برند
                        </h3>
                        <p className="text-gray-300 text-center">
                          شعار برند خود را از سمت راست اضافه کنید
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
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
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col overflow-x-hidden"
      dir="rtl"
    >
      <FormHeader
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        steps={billboardSteps}
        backPath="/surveys"
      />

      {/* Main Layout */}
      <div className="flex-1 mt-20 flex">
        {/* Ad Test Type Selection Sidebar - Fixed Left Side */}
        <div className="w-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l border-gray-200/70 dark:border-gray-700/70 h-[calc(100vh-80px)] fixed top-20 right-0 flex flex-col z-10">
          <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                <Building className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
              نوع تست تبلیغ خود را انتخاب کنید
            </h2>
            </div>
            <p className="text-xs text-gray-500">نوع تست مورد نظر را انتخاب کنید</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
            {adTestItems.map((item) => (
                <div
                key={item.id}
                  className={`flex items-center p-2.5 rounded-lg border cursor-pointer hover:shadow-sm hover:scale-[1.02] transition-all ${
                  selectedAdTestType === item.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => toggleType(item.value)}
              >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">
                      {React.cloneElement(item.icon as React.ReactElement, {
                        className: selectedAdTestType === item.value 
                          ? "w-4 h-4 text-blue-600" 
                          : "w-4 h-4 text-gray-600"
                      })}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">
                    {item.name}
                    </span>
                  {selectedAdTestType === item.value && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                  </div>
                </div>
            ))}
          </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 mr-96 overflow-y-auto h-[calc(100vh-80px)]  ">
          <div className="w-full max-w-[1200px] p-4 pb-32 mx-auto ">
            {/* Header for main content */}
            <div className="text-center lg:text-right mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                تست تبلیغات
              </h2>
              <p className="text-gray-600">
                محتوای تست تبلیغاتی خود را تنظیم کنید
              </p>
          </div>

          {/* Content Based on Selection */}
          {renderAdTestContent()}
          </div>
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
