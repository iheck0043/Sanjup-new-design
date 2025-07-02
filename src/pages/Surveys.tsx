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
import UserMenu from "@/components/UserMenu";
import { toPersianNumbers } from "@/hooks/use-persian-input";
import LogoSanjupBlue from "@/assets/Logo-Sanjup-blue.png";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Add style to prevent body scroll issues
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      [data-radix-popper-content-wrapper] {
        z-index: 100 !important;
      }
      body[data-scroll-locked] {
        padding-right: 0 !important;
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-slate-700 border-t-[#0466C8] mx-auto"></div>
          </div>
          <p className="text-gray-700 dark:text-slate-300 text-xl font-medium">
            در حال ایجاد تست تبلیغات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-2">
      {/* Content */}

      {/* Main Content with top padding for fixed header */}
      <div className="pt-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0466C8] to-[#0456B8] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    نظرسنجی‌های من
                  </h1>
                  <p className="text-gray-600 dark:text-slate-300">
                    مدیریت و تحلیل نظرسنجی‌های شما
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-1 border border-white/50 dark:border-slate-700/50 shadow-sm">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-[#0466C8] text-white shadow-sm"
                        : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-[#0466C8] text-white shadow-sm"
                        : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status Filter */}
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[200px] h-11 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0466C8]/20 focus:border-[#0466C8] shadow-sm">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-xl shadow-xl"
                    sideOffset={5}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {questionnaireStatuses.map((status) => (
                      <SelectItem
                        key={status.value}
                        value={status.value}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 focus:bg-gray-50/50 dark:focus:bg-gray-700/50 text-sm py-2 rounded-lg"
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Grid View Component */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {/* New Survey Button for Grid View */}
              <Card
                className="cursor-pointer border-0 bg-gradient-to-br from-[#0466C8] via-[#0556D8] to-[#0446B8] dark:from-slate-800 dark:via-slate-900 dark:to-black rounded-lg transition-all hover:scale-105 hover:shadow-xl shadow-lg hover:shadow-[#0466C8]/25 dark:hover:shadow-slate-900/50 group relative overflow-hidden"
                onClick={() => setIsMainModalOpen(true)}
              >
                {/* Subtle animated background overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardContent className="p-5 flex flex-col items-center justify-center h-[200px] relative z-10">
                  <div className="w-14 h-14 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/30 dark:border-white/20">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center drop-shadow-sm">
                    ایجاد نظرسنجی جدید
                  </h3>
                </CardContent>
              </Card>
              {questionnaires.map((questionnaire, index) => {
                const statusConfig = getStatusConfig(questionnaire.status);
                const typeConfig = getQuestionnaireTypeConfig(questionnaire);
                const isLast = index === questionnaires.length - 1;

                return (
                  <Card
                    key={questionnaire.id}
                    ref={isLast ? lastQuestionnaireRef : null}
                    className="group border border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all hover:scale-100"
                    onClick={() => handleQuestionnaireClick(questionnaire)}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        {/* Top badges row */}
                        <div className="flex items-center justify-between">
                          {/* Type Badge - only for demo and ad tests */}
                          {(questionnaire.default_questionnaire ||
                            questionnaire.questionnaire_type !== "usual") && (
                            <div
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-normal backdrop-blur-sm ${
                                questionnaire.default_questionnaire
                                  ? "bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
                                  : "bg-gray-50/80 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 border border-gray-200/50 dark:border-slate-700/50"
                              }`}
                            >
                              <div className="w-2.5 h-2.5 flex items-center justify-center">
                                {questionnaire.default_questionnaire ? (
                                  <Crown className="w-2.5 h-2.5" />
                                ) : (
                                  typeConfig.icon
                                )}
                              </div>
                              {questionnaire.default_questionnaire
                                ? "نمونه"
                                : typeConfig.label}
                            </div>
                          )}

                          {/* Status */}
                          <div
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-normal backdrop-blur-sm ${statusConfig.bg}/80 ${statusConfig.text} border ${statusConfig.border}/50`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full ${statusConfig.dot}`}
                            ></div>
                            {statusConfig.label}
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className="font-semibold text-gray-900 dark:text-white text-lg leading-tight min-h-[2rem] line-clamp-2"
                          title={questionnaire.title}
                        >
                          {questionnaire.title}
                        </h3>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                            <span>
                              <span className="persian-number-display">
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed
                                    .answer_count
                                )}
                              </span>{" "}
                              از{" "}
                              <span className="persian-number-display">
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed
                                    .user_limit
                                )}
                              </span>{" "}
                              نفر پاسخ داده
                            </span>
                            <span className="font-semibold text-[#0466C8] text-xs">
                              <span className="persian-number-display">
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed.percent
                                )}
                              </span>
                              %
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-100/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-full h-2 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-[#0466C8] to-[#0456B8] h-2 rounded-full transition-all duration-700 shadow-sm"
                              style={{
                                width: `${questionnaire.questionnaire_completed.percent}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200/50 dark:border-slate-700/50">
                          <Calendar className="w-3 h-3" />
                          <span className="persian-number-display">
                            {new Date(
                              questionnaire.created * 1000
                            ).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 mt-3 border-t border-gray-200/50 dark:border-slate-700/50 opacity-0 group-hover:opacity-100 transition-all">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/questionnaire/${questionnaire.id}/results`
                              );
                            }}
                            className="text-gray-700 hover:text-[#0466C8] hover:bg-white/50 dark:text-slate-300 dark:hover:text-[#0466C8] dark:hover:bg-slate-800/50 flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium backdrop-blur-sm"
                          >
                            <BarChart3 className="w-3 h-3" />
                            نتایج
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="text-gray-600 hover:text-gray-800 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 w-7 h-7 rounded backdrop-blur-sm"
                              title="کپی نظرسنجی"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSurvey(questionnaire.id);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 w-7 h-7 rounded backdrop-blur-sm"
                              title="حذف نظرسنجی"
                            >
                              <Trash2 className="w-3 h-3" />
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
            <div className="flex flex-col items-center justify-center py-20">
              {/* Empty State Icon */}
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200/50 dark:border-slate-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0466C8] to-[#0456B8] rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center max-w-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  هنوز نظرسنجی‌ای ندارید
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
                  با ایجاد اولین نظرسنجی خود شروع کنید
                </p>
                <Button
                  onClick={() => setIsMainModalOpen(true)}
                  className="bg-gradient-to-r from-[#0466C8] to-[#0456B8] hover:from-[#0456B8] hover:to-[#0446A8] text-white px-6 py-2.5 rounded-lg font-medium transition-all"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  ایجاد اولین نظرسنجی
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* New Survey Button for List View */}
              {viewMode === "list" && (
                <Card
                  className="cursor-pointer border-0 bg-gradient-to-r from-[#0466C8] via-[#0556D8] to-[#0446B8] dark:from-slate-800 dark:via-slate-900 dark:to-black rounded-lg transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg hover:shadow-[#0466C8]/25 dark:hover:shadow-slate-900/50 group relative overflow-hidden"
                  onClick={() => setIsMainModalOpen(true)}
                >
                  {/* Subtle animated background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Right border indicator */}
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 rounded-r-lg bg-gradient-to-b from-white/40 to-white/70 dark:from-gray-400 dark:to-gray-200"></div>

                  <CardContent className="p-5 pr-6 relative z-10">
                    <div className="flex flex-col items-center justify-center text-center h-[60px] gap-3">
                      {/* Type Icon */}
                      <div className="w-10 h-10 bg-white/20 dark:bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30 dark:border-white/25">
                        <Plus className="w-5 h-5 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-white drop-shadow-sm">
                        ایجاد نظرسنجی جدید
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* List View */}
              {viewMode === "list" &&
                questionnaires.map((questionnaire, index) => {
                  const statusConfig = getStatusConfig(questionnaire.status);
                  const typeConfig = getQuestionnaireTypeConfig(questionnaire);
                  const isLast = index === questionnaires.length - 1;

                  return (
                    <Card
                      key={questionnaire.id}
                      ref={isLast ? lastQuestionnaireRef : null}
                      className="group border border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all hover:scale-[1]"
                    >
                      {/* Right border indicator */}
                      <div
                        className={`absolute right-0 top-0 bottom-0 w-1.5 rounded-r-lg ${
                          questionnaire.default_questionnaire
                            ? "bg-gradient-to-b from-amber-400 to-amber-600"
                            : "bg-gradient-to-b from-[#0466C8] to-[#0456B8]"
                        }`}
                      ></div>

                      <CardContent className="p-5 pr-6">
                        <div className="flex items-center justify-between gap-4">
                          {/* Title and Type - Left side */}
                          <div className="flex items-center min-w-0 flex-1 gap-3">
                            {/* Type Icon */}
                            <div
                              className={`w-5 h-5 flex-shrink-0 ${
                                questionnaire.default_questionnaire
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-[#0466C8] dark:text-[#0466C8]"
                              }`}
                            >
                              {questionnaire.default_questionnaire ? (
                                <Crown className="w-5 h-5" />
                              ) : (
                                typeConfig.icon
                              )}
                            </div>

                            <div
                              className="cursor-pointer flex-1 min-w-0"
                              onClick={() =>
                                handleQuestionnaireClick(questionnaire)
                              }
                            >
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#0466C8] dark:hover:text-[#0466C8] truncate mb-2 transition-colors">
                                {questionnaire.title}
                              </h3>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Type badge - only for demo and ad tests */}
                                {(questionnaire.default_questionnaire ||
                                  questionnaire.questionnaire_type !==
                                    "usual") && (
                                  <div
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-normal backdrop-blur-sm ${
                                      questionnaire.default_questionnaire
                                        ? "bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
                                        : "bg-gray-50/80 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 border border-gray-200/50 dark:border-slate-700/50"
                                    }`}
                                  >
                                    <div className="w-2.5 h-2.5 flex items-center justify-center">
                                      {questionnaire.default_questionnaire ? (
                                        <Crown className="w-2.5 h-2.5" />
                                      ) : (
                                        typeConfig.icon
                                      )}
                                    </div>
                                    {questionnaire.default_questionnaire
                                      ? "نمونه"
                                      : typeConfig.label}
                                  </div>
                                )}
                                {/* Status */}
                                <div
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-normal backdrop-blur-sm ${statusConfig.bg}/80 ${statusConfig.text} ${statusConfig.border}/50 border`}
                                >
                                  <div
                                    className={`w-1 h-1 rounded-full ${statusConfig.dot}`}
                                  ></div>
                                  {statusConfig.label}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats - Right side */}
                          <div className="flex items-center gap-6 flex-shrink-0">
                            <div className="flex items-center gap-6">
                              {/* Answers */}
                              <div className="text-center">
                                <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">
                                  پاسخ‌ها
                                </div>
                                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                  <span className="persian-number-display">
                                    {toPersianNumbers(
                                      questionnaire.questionnaire_completed
                                        .answer_count
                                    )}
                                  </span>{" "}
                                  از{" "}
                                  <span className="persian-number-display">
                                    {toPersianNumbers(
                                      questionnaire.questionnaire_completed
                                        .user_limit
                                    )}
                                  </span>{" "}
                                  نفر
                                </div>
                              </div>

                              {/* Progress */}
                              <div className="text-center">
                                <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">
                                  درصد تکمیل
                                </div>
                                <div className="text-xs font-semibold text-[#0466C8] mb-1">
                                  <span className="persian-number-display">
                                    {toPersianNumbers(
                                      questionnaire.questionnaire_completed
                                        .percent
                                    )}
                                  </span>
                                  %
                                </div>
                                <div className="w-16 bg-gray-100/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-full h-2 shadow-inner">
                                  <div
                                    className="bg-gradient-to-r from-[#0466C8] to-[#0456B8] h-2 rounded-full transition-all duration-700 shadow-sm"
                                    style={{
                                      width: `${questionnaire.questionnaire_completed.percent}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>

                              {/* Date */}
                              <div className="text-center">
                                <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">
                                  تاریخ ایجاد
                                </div>
                                <div className="text-xs text-gray-900 dark:text-white font-medium">
                                  <span className="persian-number-display">
                                    {new Date(
                                      questionnaire.created * 1000
                                    ).toLocaleDateString("fa-IR")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/questionnaire/${questionnaire.id}/results`
                                )
                              }
                              className="text-gray-700 hover:text-[#0466C8] hover:bg-white/50 dark:text-slate-300 dark:hover:text-[#0466C8] dark:hover:bg-slate-800/50 px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm"
                              title="مشاهده نتایج"
                            >
                              <BarChart3 className="w-3 h-3" />
                              نتایج
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-800 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 w-7 h-7 rounded backdrop-blur-sm"
                              title="کپی نظرسنجی"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteSurvey(questionnaire.id)
                              }
                              className="text-red-500 hover:text-red-700 hover:bg-red-50/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 w-7 h-7 rounded backdrop-blur-sm"
                              title="حذف نظرسنجی"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-800 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 w-7 h-7 rounded border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm"
                              title="گزینه‌های بیشتر"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {/* Loading State */}
          {loading && questionnaires.length > 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-slate-700 border-t-[#0466C8] mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                در حال بارگذاری...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Modal */}
      <Dialog open={isMainModalOpen} onOpenChange={setIsMainModalOpen}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
          <DialogHeader className="pb-4 border-b border-gray-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white text-right mb-1">
              انتخاب نوع نظرسنجی
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-slate-300 text-right">
              روش مناسب برای ایجاد نظرسنجی خود را انتخاب کنید
            </p>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* نظرسنجی خام */}
              <Card
                className={`cursor-pointer group border border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-md shadow-sm hover:shadow-md transition-all ${
                  apiLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={
                  apiLoading ? undefined : () => setIsNameModalOpen(true)
                }
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-2 rounded-md bg-blue-500 ml-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      نظرسنجی خام
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      ایجاد نظرسنجی سفارشی از ابتدا
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                    {apiLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* نظرسنجی آماده */}
              <Card
                className="cursor-pointer group border border-gray-200 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-md shadow-sm hover:shadow-md transition-all"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsReadySurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-2 rounded-md bg-emerald-500 ml-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      نظرسنجی آماده
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      قالب‌های تخصصی و آماده
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </div>
                </CardContent>
              </Card>

              {/* تست تبلیغات */}
              <Card
                className={`cursor-pointer group border border-gray-200 dark:border-slate-600 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-md shadow-sm hover:shadow-md transition-all ${
                  adTestLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={adTestLoading ? undefined : handleBillboardTestCreate}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-2 rounded-md bg-cyan-500 ml-3">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      تست تبلیغات
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      ارزیابی تبلیغات پیش از انتشار
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                    {adTestLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-cyan-500"></div>
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* طراحی نظرسنجی با هوش مصنوعی */}
              <Card
                className="cursor-pointer group border border-gray-200 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-400 rounded-md shadow-sm hover:shadow-md transition-all"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsAISurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-2 rounded-md bg-purple-500 ml-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      طراحی با هوش مصنوعی
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      ایجاد هوشمند با AI
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </div>
                </CardContent>
              </Card>

              {/* طراحی نظرسنجی با ما */}
              <Card
                className="cursor-pointer group border border-gray-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-md shadow-sm hover:shadow-md transition-all"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsDesignWithUsModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-2 rounded-md bg-indigo-500 ml-3">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      طراحی با کارشناسان ما
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      تیم متخصص سنجاپ
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </div>
                </CardContent>
              </Card>

              {/* بارگذاری نظرسنجی */}
              <Card
                className="cursor-pointer group border border-gray-200 dark:border-slate-600 hover:border-orange-500 dark:hover:border-orange-400 rounded-md shadow-sm hover:shadow-md transition-all"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsUploadSurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-2 rounded-md bg-orange-500 ml-3">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      بارگذاری نظرسنجی
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      ایمپورت از پرسلاین یا فایل
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-600 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Modal */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="pb-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 px-6 py-6 -mx-6 -mt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white text-right mb-1">
                  ایجاد نظرسنجی خام
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-slate-300 text-right">
                  عنوان نظرسنجی سفارشی خود را وارد کنید
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 -mx-6 -mb-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-4 text-right"
                >
                  عنوان نظرسنجی
                </label>
                <Input
                  id="title"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="مثال: نظرسنجی رضایتمندی مشتریان"
                  className="h-12 text-base bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-700 px-6 py-4 -mx-6 -mb-6 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={() => {
                setIsNameModalOpen(false);
                setSurveyTitle("");
              }}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              انصراف
            </Button>
            <Button
              onClick={handleRawSurveyCreate}
              disabled={apiLoading || !surveyTitle.trim()}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {apiLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  در حال ایجاد...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ایجاد نظرسنجی
                </div>
              )}
            </Button>
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
