import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  TrendingUp,
  ChevronLeft,
  Sparkles,
  FileText,
  Target,
  Upload,
  User,
  LogOut,
  Settings,
  ChevronDown,
  BarChart3,
  Grid3X3,
  List,
  Monitor,
  Play,
  Palette,
  Building,
  MessageSquare,
  Crown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchQuestionnaires,
  deleteQuestionnaire,
  createQuestionnaire,
  setPublishMethods,
  questionnaireStatuses,
  type Questionnaire,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ReadySurveyModal from "@/components/ReadySurveyModal";
import AISurveyModal from "@/components/AISurveyModal";
import DesignWithUsModal from "@/components/DesignWithUsModal";
import UploadSurveyModal from "@/components/UploadSurveyModal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Helper function to convert English numbers to Persian
const toPersianNumbers = (str: string | number) => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return str.toString().replace(/[0-9]/g, (digit) => {
    return persianDigits[englishDigits.indexOf(digit)];
  });
};

const Surveys = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [status, setStatus] = useState("all");
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver>();
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isReadySurveyModalOpen, setIsReadySurveyModalOpen] = useState(false);
  const [isAISurveyModalOpen, setIsAISurveyModalOpen] = useState(false);
  const [isDesignWithUsModalOpen, setIsDesignWithUsModalOpen] = useState(false);
  const [isUploadSurveyModalOpen, setIsUploadSurveyModalOpen] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [adTestLoading, setAdTestLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add style to prevent body scroll issues and add shimmer animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      [data-radix-popper-content-wrapper] {
        z-index: 100 !important;
      }
      body[data-scroll-locked] {
        padding-right: 0 !important;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%) skewX(-12deg); }
        100% { transform: translateX(200%) skewX(-12deg); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const lastQuestionnaireRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const loadQuestionnaires = async (pageNum: number, statusFilter: string) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetchQuestionnaires(
        pageNum,
        10,
        statusFilter,
        accessToken
      );
      console.log("API Response:", response);

      if (!response || !response.data || !Array.isArray(response.data)) {
        console.error("Invalid response format:", response);
        throw new Error("Invalid response format from API");
      }

      const newQuestionnaires = response.data;
      setQuestionnaires((prev) => {
        if (pageNum === 1) return newQuestionnaires;
        return [...prev, ...newQuestionnaires];
      });

      setHasMore(response.info?.next !== null);
      setLoading(false);
    } catch (error) {
      console.error("Error loading questionnaires:", error);
      setError(
        error instanceof Error ? error.message : "خطا در دریافت پرسشنامه‌ها"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial load of questionnaires");
    setPage(1);
    loadQuestionnaires(1, status);
  }, [status]);

  useEffect(() => {
    if (page > 1) {
      console.log("Loading more questionnaires:", page);
      loadQuestionnaires(page, status);
    }
  }, [page]);

  const handleDeleteSurvey = async (id: string) => {
    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      await deleteQuestionnaire(id, accessToken);
      setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
      toast.success("نظرسنجی با موفقیت حذف شد");
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در حذف نظرسنجی"
      );
    }
  };

  const handleRawSurveyCreate = async () => {
    if (!surveyTitle.trim()) {
      toast.error("لطفا نام نظرسنجی را وارد کنید");
      return;
    }

    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setApiLoading(true);
    try {
      const response = await createQuestionnaire(
        surveyTitle,
        "usual",
        accessToken
      );

      // Set publish methods
      await setPublishMethods(response.data.id, accessToken);

      // Close modals and clear form only after success
      setIsNameModalOpen(false);
      setIsMainModalOpen(false);
      setSurveyTitle("");

      // Navigate to questionnaire page
      navigate(`/questionnaire/${response.data.id}`);
      toast.success("نظرسنجی با موفقیت ایجاد شد");
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در ایجاد نظرسنجی"
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleBillboardTestCreate = async () => {
    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setAdTestLoading(true);
    setIsMainModalOpen(false); // Close main modal but keep loading

    try {
      const response = await createQuestionnaire(
        "تست تبلیغات",
        "billboard",
        accessToken
      );

      // Set publish methods
      await setPublishMethods(response.data.id, accessToken);

      // Navigate to billboard test page
      navigate(`/adtest/${response.data.id}`);
      toast.success("تست تبلیغات با موفقیت ایجاد شد");
    } catch (error) {
      console.error("Error creating billboard test:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در ایجاد تست تبلیغات"
      );
      // Reopen main modal if there's an error
      setIsMainModalOpen(true);
    } finally {
      setAdTestLoading(false);
    }
  };

  const handleQuestionnaireClick = (questionnaire: Questionnaire) => {
    if (questionnaire.questionnaire_type === "usual") {
      navigate(`/questionnaire/${questionnaire.id}`);
    } else {
      navigate(`/adtest/${questionnaire.id}`);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "published":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
          label: "منتشر شده",
        };
      case "draft":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-500",
          label: "پیش‌نویس",
        };
      case "pending":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-500",
          label: "در حال بررسی",
        };
      case "pending_publish":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          dot: "bg-purple-500",
          label: "انتشار با زمانبندی",
        };
      case "finished":
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-500",
          label: "پایان یافته",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-500",
          label: "نامشخص",
        };
    }
  };

  const getQuestionnaireTypeConfig = (questionnaire: Questionnaire) => {
    // Check if it's a demo questionnaire
    if (questionnaire.default_questionnaire) {
      return {
        icon: <Crown className="w-4 h-4" />,
        label: "دمو",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
    }

    // Check questionnaire type for ad tests
    switch (questionnaire.questionnaire_type) {
      case "billboard":
        return {
          icon: <Monitor className="w-4 h-4" />,
          label: "تست بیلبورد",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      case "video":
        return {
          icon: <Play className="w-4 h-4" />,
          label: "تست ویدیو",
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
        };
      case "logo":
        return {
          icon: <Palette className="w-4 h-4" />,
          label: "تست لوگو",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
        };
      case "brand":
        return {
          icon: <Building className="w-4 h-4" />,
          label: "تست برند",
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "slogan":
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          label: "تست شعار",
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
        };
      case "usual":
      default:
        return {
          icon: <FileText className="w-4 h-4" />,
          label: "نظرسنجی معمولی",
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
        };
    }
  };

  // Show loading spinner when creating billboard test
  if (adTestLoading && !isMainModalOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 mx-auto"></div>
            <div className="absolute inset-4 animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-b-slate-500 dark:border-b-slate-400" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xl font-medium">در حال ایجاد تست تبلیغات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      {/* Fixed Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/Logo-Sanjup-blue.png" 
              alt="سنجاپ" 
              className="h-10 w-auto"
            />
          </div>

          {/* Theme Toggle and User Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 px-2 py-1.5"
                >
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-sm">پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-sm">خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 rounded-lg flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    نظرسنجی‌های من
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                    مدیریت و تحلیل نظرسنجی‌های شما
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-md transition-all duration-200 ${viewMode === 'grid' 
                      ? 'bg-slate-700 dark:bg-slate-600 shadow-md text-white hover:bg-slate-800 dark:hover:bg-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-md transition-all duration-200 ${viewMode === 'list' 
                      ? 'bg-slate-700 dark:bg-slate-600 shadow-md text-white hover:bg-slate-800 dark:hover:bg-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Status Filter */}
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px] h-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-200">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-lg"
                    sideOffset={5}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {questionnaireStatuses.map((status) => (
                      <SelectItem 
                        key={status.value} 
                        value={status.value}
                        className="hover:bg-slate-100 dark:hover:bg-slate-700/50 focus:bg-slate-100 dark:focus:bg-slate-700/50 rounded-md text-sm"
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* New Survey Button */}
          <div className="relative mb-6">
            <Button
              onClick={() => setIsMainModalOpen(true)}
              className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black text-white px-6 py-6 rounded-xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300 w-full h-20 transform hover:-translate-y-1 overflow-hidden group border border-slate-600/20"
            >
              {/* Subtle background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600/10 via-slate-500/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Professional icon */}
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <Plus className="w-5 h-5" />
              </div>
              
              {/* Text */}
              <span className="text-xl font-semibold">ایجاد نظرسنجی جدید</span>
              
              {/* Subtle accent */}
              <div className="absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-white/20 rounded-full"></div>
            </Button>
          </div>

          {/* Grid View Component */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {questionnaires.map((questionnaire, index) => {
                const statusConfig = getStatusConfig(questionnaire.status);
                const typeConfig = getQuestionnaireTypeConfig(questionnaire);
                const isLast = index === questionnaires.length - 1;

                return (
                  <Card
                    key={questionnaire.id}
                    ref={isLast ? lastQuestionnaireRef : null}
                    className="group relative border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden rounded-3xl transform hover:-translate-y-2 hover:scale-[1.02]"
                  >
                    {/* Subtle background accent */}
                    <div className={`absolute inset-0 opacity-2 ${
                      questionnaire.default_questionnaire ? 'bg-gradient-to-br from-amber-200 to-amber-300' :
                      questionnaire.questionnaire_type === 'billboard' ? 'bg-gradient-to-br from-slate-200 to-slate-300' :
                      questionnaire.questionnaire_type === 'video' ? 'bg-gradient-to-br from-slate-200 to-slate-300' :
                      questionnaire.questionnaire_type === 'logo' ? 'bg-gradient-to-br from-slate-200 to-slate-300' :
                      questionnaire.questionnaire_type === 'brand' ? 'bg-gradient-to-br from-slate-200 to-slate-300' :
                      questionnaire.questionnaire_type === 'slogan' ? 'bg-gradient-to-br from-slate-200 to-slate-300' :
                      'bg-gradient-to-br from-slate-200 to-slate-300'
                    }`}></div>

                    <CardContent className="p-0 relative">
                      {/* Header with luxury design */}
                      <div 
                        className="p-8 cursor-pointer relative"
                        onClick={() => handleQuestionnaireClick(questionnaire)}
                      >
                        {/* Top badges row */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            {/* Type Badge - only for demo and ad tests */}
                            {(questionnaire.default_questionnaire || questionnaire.questionnaire_type !== 'usual') && (
                              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold ${
                                questionnaire.default_questionnaire 
                                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              } shadow-sm backdrop-blur-sm`}>
                                <div className="w-5 h-5 flex items-center justify-center">
                                  {questionnaire.default_questionnaire ? <Crown className="w-4 h-4" /> : typeConfig.icon}
                                </div>
                                {questionnaire.default_questionnaire ? 'نمونه' : typeConfig.label}
                              </div>
                            )}
                          </div>
                          
                          {/* Status with refined styling */}
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm backdrop-blur-sm`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} ${questionnaire.status === 'published' ? 'animate-pulse' : ''}`}></div>
                            {statusConfig.label}
                          </div>
                        </div>

                        {/* Title with luxury typography */}
                        <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-6 line-clamp-3 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300 leading-tight min-h-[4.5rem]">
                          {questionnaire.title}
                        </h3>

                        {/* Refined Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                            <div className="flex items-center justify-center mb-2">
                              <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {toPersianNumbers(questionnaire.questionnaire_completed.answer_count)}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">پاسخ دریافتی</div>
                          </div>
                          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                            <div className="flex items-center justify-center mb-2">
                              <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {toPersianNumbers(questionnaire.questionnaire_completed.percent)}%
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">پیشرفت</div>
                          </div>
                        </div>

                        {/* Refined Progress Bar */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                            <span>
                              {toPersianNumbers(questionnaire.questionnaire_completed.answer_count)} از {toPersianNumbers(questionnaire.questionnaire_completed.user_limit)} نفر
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                              {toPersianNumbers(questionnaire.questionnaire_completed.percent)}%
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
                                style={{
                                  width: `${questionnaire.questionnaire_completed.percent}%`,
                                }}
                              >
                                {/* Subtle shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Date with refined design */}
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <span className="font-medium">ایجاد شده در {new Date(questionnaire.created * 1000).toLocaleDateString("fa-IR")}</span>
                        </div>
                      </div>

                      {/* Refined Action Buttons - Show only on hover */}
                      <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-6 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/questionnaire/${questionnaire.id}/results`)}
                            className="text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50"
                          >
                            <BarChart3 className="w-4 h-4" />
                            مشاهده نتایج
                          </Button>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 w-10 h-10 rounded-xl transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50"
                              title="کپی نظرسنجی"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSurvey(questionnaire.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 w-10 h-10 rounded-xl transition-all duration-200 hover:shadow-md border border-red-200/50 dark:border-red-800/50"
                              title="حذف نظرسنجی"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 w-10 h-10 rounded-xl transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50"
                              title="گزینه‌های بیشتر"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Surveys List */}
          {questionnaires.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 relative">
              {/* Luxury Empty State Icon */}
              <div className="relative mb-12">
                <div className="w-40 h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                </div>
                {/* Subtle floating elements */}
                <div className="absolute -top-3 -right-3 w-4 h-4 bg-slate-400 dark:bg-slate-500 rounded-full shadow-lg opacity-60"></div>
                <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full shadow-lg opacity-60"></div>
              </div>
              
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                شروع کار با نظرسنجی‌ها
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-12 text-center max-w-2xl text-lg leading-relaxed">
                هنوز نظرسنجی‌ای ندارید. با ایجاد اولین نظرسنجی خود، 
                <br />
                شروع به جمع‌آوری بازخوردهای ارزشمند کاربران کنید.
              </p>
              
              {/* Professional CTA Button */}
              <Button
                onClick={() => setIsMainModalOpen(true)}
                className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4 border border-slate-600/20"
              >
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Plus className="w-5 h-5" />
                </div>
                ایجاد اولین نظرسنجی
              </Button>
              
              {/* Minimal decorative elements */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-32 left-20 w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <div className="absolute top-48 right-32 w-1 h-1 bg-slate-500 rounded-full"></div>
                <div className="absolute bottom-48 left-32 w-2 h-2 bg-slate-400 rounded-full"></div>
                <div className="absolute bottom-32 right-20 w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* List View */}
              {viewMode === 'list' && questionnaires.map((questionnaire, index) => {
                const statusConfig = getStatusConfig(questionnaire.status);
                const typeConfig = getQuestionnaireTypeConfig(questionnaire);
                const isLast = index === questionnaires.length - 1;

                return (
                  <Card
                    key={questionnaire.id}
                    ref={isLast ? lastQuestionnaireRef : null}
                    className="group relative border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden transform hover:-translate-y-1"
                  >
                    {/* Refined subtle background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/30 opacity-50"></div>

                    {/* Professional left border indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      questionnaire.default_questionnaire ? 'bg-amber-500' :
                      'bg-slate-600 dark:bg-slate-500'
                    }`}></div>

                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between gap-6">
                        {/* Title and Type - Left side */}
                        <div className="flex items-center min-w-0 flex-1 gap-5">
                          {/* Professional Type Icon */}
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                            <div className={`w-7 h-7 ${
                              questionnaire.default_questionnaire ? 'text-amber-600 dark:text-amber-500' :
                              'text-slate-600 dark:text-slate-400'
                            }`}>
                              {questionnaire.default_questionnaire ? <Crown className="w-7 h-7" /> : typeConfig.icon}
                            </div>
                          </div>

                          <div 
                            className="cursor-pointer flex-1 min-w-0"
                            onClick={() => handleQuestionnaireClick(questionnaire)}
                          >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-200 transition-colors truncate mb-3">
                              {questionnaire.title}
                            </h3>
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Type badge - only for demo and ad tests */}
                              {(questionnaire.default_questionnaire || questionnaire.questionnaire_type !== 'usual') && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${
                                  questionnaire.default_questionnaire 
                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                } shadow-sm`}>
                                  {questionnaire.default_questionnaire ? 'نمونه' : typeConfig.label}
                                </div>
                              )}
                              {/* Status with refined styling */}
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border shadow-sm`}>
                                <div className={`w-2 h-2 rounded-full ${statusConfig.dot} ${questionnaire.status === 'published' ? 'animate-pulse' : ''}`}></div>
                                {statusConfig.label}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats and Status - Right side */}
                        <div className="flex items-center gap-8 text-sm flex-shrink-0">
                          {/* Stats Cards - Professional and refined */}
                          <div className="flex items-center gap-6">
                            {/* Answers */}
                            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                  پاسخ
                                </span>
                              </div>
                              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed
                                    .answer_count
                                )}{" "}
                                از{" "}
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed
                                    .user_limit
                                )}
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                                  <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                  پیشرفت
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                  {toPersianNumbers(
                                    questionnaire.questionnaire_completed.percent
                                  )}
                                  %
                                </span>
                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                  <div
                                    className="bg-slate-600 dark:bg-slate-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${questionnaire.questionnaire_completed.percent}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                                  <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                  تاریخ ایجاد
                                </span>
                              </div>
                              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                {new Date(
                                  questionnaire.created * 1000
                                ).toLocaleDateString("fa-IR")}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Show only on hover */}
                        <div className="flex items-center gap-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/questionnaire/${questionnaire.id}/results`
                              )
                            }
                            className="text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 border border-slate-200/50 dark:border-slate-600/50"
                            title="مشاهده نتایج"
                          >
                            <BarChart3 className="w-4 h-4" />
                            نتایج
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 w-11 h-11 rounded-xl transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50"
                            title="کپی نظرسنجی"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSurvey(questionnaire.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 w-11 h-11 rounded-xl transition-all duration-200 hover:shadow-md border border-red-200/50 dark:border-red-800/50"
                            title="حذف نظرسنجی"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 w-11 h-11 rounded-xl transition-all duration-200 hover:shadow-md border border-slate-200/50 dark:border-slate-600/50"
                            title="گزینه‌های بیشتر"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Refined Loading State */}
          {loading && questionnaires.length > 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block">
                {/* Main spinner */}
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 mx-auto mb-6"></div>
                {/* Inner spinner */}
                <div className="absolute inset-3 animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-b-slate-500 dark:border-b-slate-400" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">در حال بارگذاری نظرسنجی‌های بیشتر...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Modal */}
      <Dialog open={isMainModalOpen} onOpenChange={setIsMainModalOpen}>
        <DialogContent className="sm:max-w-5xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-3xl">
          <DialogHeader className="pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white text-right">انتخاب نوع نظرسنجی</DialogTitle>
            <p className="text-slate-600 dark:text-slate-400 text-right mt-2">نوع نظرسنجی مورد نظر خود را انتخاب کنید</p>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* نظرسنجی خام */}
              <Card
                className={`cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group ${
                  apiLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={
                  apiLoading ? undefined : () => setIsNameModalOpen(true)
                }
              >
                <CardContent className="flex items-center p-6">
                  <div className="flex justify-center items-center p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-900/30 ml-5 group-hover:scale-110 transition-transform duration-300 border border-blue-200/50 dark:border-blue-800/50">
                    <FileText className="w-8 h-8 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">نظرسنجی خام</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      ساخت نظرسنجی توسط شما
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading} className="w-10 h-10 rounded-xl">
                    {apiLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
                    ) : (
                      <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* نظرسنجی آماده */}
              <Card
                className="cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsReadySurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-6">
                  <div className="flex justify-center items-center p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/30 ml-5 group-hover:scale-110 transition-transform duration-300 border border-emerald-200/50 dark:border-emerald-800/50">
                    <Target className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">نظرسنجی آماده</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      استفاده از نظرسنجی های تخصصی آماده
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading} className="w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>

              {/* تست تبلیغات */}
              <Card
                className={`cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group ${
                  adTestLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={adTestLoading ? undefined : handleBillboardTestCreate}
              >
                <CardContent className="flex items-center p-6">
                  <div className="flex justify-center items-center p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-900/30 ml-5 group-hover:scale-110 transition-transform duration-300 border border-cyan-200/50 dark:border-cyan-800/50">
                    <Monitor className="w-8 h-8 text-cyan-700 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">تست تبلیغات</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      نظرسنجی آماده جهت تست تبلیغات قبل از اکران تبلیغ
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={adTestLoading} className="w-10 h-10 rounded-xl">
                    {adTestLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
                    ) : (
                      <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* طراحی نظرسنجی با هوش مصنوعی */}
              <Card
                className="cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsAISurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-6">
                  <div className="flex justify-center items-center p-4 rounded-2xl bg-violet-50/80 dark:bg-violet-900/30 ml-5 group-hover:scale-110 transition-transform duration-300 border border-violet-200/50 dark:border-violet-800/50">
                    <Sparkles className="w-8 h-8 text-violet-700 dark:text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      طراحی نظرسنجی با هوش مصنوعی
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      طراحی نظرسنجی با کمک هوش مصنوعی
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading} className="w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>

              {/* طراحی نظرسنجی با ما */}
              <Card
                className="cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsDesignWithUsModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-6">
                  <div className="flex justify-center items-center p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-900/30 ml-5 group-hover:scale-110 transition-transform duration-300 border border-indigo-200/50 dark:border-indigo-800/50">
                    <Building className="w-8 h-8 text-indigo-700 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">طراحی نظرسنجی با ما</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      طراحی نظرسنجی توسط کارشناسان سنجاپ
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading} className="w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>

              {/* بارگذاری نظرسنجی */}
              <Card
                className="cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsUploadSurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-6">
                  <div className="flex justify-center items-center p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-900/30 ml-5 group-hover:scale-110 transition-transform duration-300 border border-orange-200/50 dark:border-orange-800/50">
                    <Upload className="w-8 h-8 text-orange-700 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">بارگذاری نظرسنجی</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      وارد کردن نظرسنجی از طریق لینک پرسلاین یا فایل ورد
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading} className="w-10 h-10 rounded-xl">
                    <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Modal */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-3xl">
          <DialogHeader className="pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white text-right">نام نظرسنجی خام</DialogTitle>
            <p className="text-slate-600 dark:text-slate-400 text-right mt-2">عنوان نظرسنجی خود را وارد کنید</p>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-4">
              <Input
                id="title"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="عنوان نظرسنجی را وارد کنید"
                className="h-12 text-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNameModalOpen(false);
                  setSurveyTitle("");
                }}
                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                انصراف
              </Button>
              <Button
                onClick={handleRawSurveyCreate}
                disabled={apiLoading || !surveyTitle.trim()}
                className="px-8 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {apiLoading ? "در حال ایجاد..." : "ذخیره"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ready Survey Modal */}
      <ReadySurveyModal
        open={isReadySurveyModalOpen}
        onOpenChange={setIsReadySurveyModalOpen}
        onTemplateSelect={(templateId) => {
          navigate(`/questionnaire/${templateId}`);
        }}
      />

      {/* AI Survey Modal */}
      <AISurveyModal
        open={isAISurveyModalOpen}
        onOpenChange={setIsAISurveyModalOpen}
        onSurveyCreated={(surveyId) => {
          navigate(`/questionnaire/${surveyId}`);
        }}
      />

      {/* Design With Us Modal */}
      <DesignWithUsModal
        open={isDesignWithUsModalOpen}
        onOpenChange={setIsDesignWithUsModalOpen}
      />

      {/* Upload Survey Modal */}
      <UploadSurveyModal
        open={isUploadSurveyModalOpen}
        onOpenChange={setIsUploadSurveyModalOpen}
        onSurveyCreated={(surveyId) => {
          navigate(`/questionnaire/${surveyId}`);
        }}
      />
    </div>
  );
};

export default Surveys;
