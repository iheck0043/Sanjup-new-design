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

  // Show loading spinner when creating billboard test
  if (adTestLoading && !isMainModalOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال ایجاد تست تبلیغات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="mr-3 font-bold text-gray-900 text-xl">سنجاپ</span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                پروفایل
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                <LogOut className="w-4 h-4" />
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 mt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                نظرسنجی های من
              </h2>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px] focus:ring-0 focus:ring-offset-0 focus:outline-none border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent
                  className="z-50"
                  sideOffset={5}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {questionnaireStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* New Survey Button */}
          <Button
            onClick={() => setIsMainModalOpen(true)}
            variant="outline"
            className="border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-6 py-4 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-full mb-4 h-20"
          >
            <Plus className="w-5 h-5" />
            نظرسنجی جدید
          </Button>

          {/* Surveys List */}
          {questionnaires.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Plus className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                هنوز نظرسنجی‌ای ندارید
              </h3>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                اولین نظرسنجی خود را ایجاد کنید و شروع به جمع‌آوری بازخورد کنید
              </p>
              <Button
                onClick={() => setIsMainModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                ایجاد نظرسنجی جدید
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questionnaires.map((questionnaire, index) => {
                const statusConfig = getStatusConfig(questionnaire.status);
                const isLast = index === questionnaires.length - 1;

                return (
                  <Card
                    key={questionnaire.id}
                    ref={isLast ? lastQuestionnaireRef : null}
                    className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Title - Left side */}
                        <div className="flex items-center min-w-0 flex-1">
                          <h3
                            className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                            onClick={() =>
                              handleQuestionnaireClick(questionnaire)
                            }
                          >
                            {questionnaire.title}
                          </h3>
                        </div>

                        {/* Stats and Status - Right side */}
                        <div className="flex items-center gap-6 text-sm flex-shrink-0">
                          {/* Answers */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-1">
                              پاسخ
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-gray-700 text-xs font-medium">
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed
                                    .answer_count
                                )}{" "}
                                از{" "}
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed
                                    .user_limit
                                )}{" "}
                                نفر
                              </span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-1">
                              پیشرفت
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-700">
                                {toPersianNumbers(
                                  questionnaire.questionnaire_completed.percent
                                )}
                                %
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${questionnaire.questionnaire_completed.percent}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-1">
                              تاریخ ایجاد
                            </span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-gray-700 text-xs">
                                {new Date(
                                  questionnaire.created * 1000
                                ).toLocaleDateString("fa-IR")}
                              </span>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-1"></span>
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border flex-shrink-0`}
                            >
                              <div
                                className={`w-1 h-1 rounded-full ${statusConfig.dot}`}
                              ></div>
                              {statusConfig.label}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Hidden by default, shown on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                            title="کپی نظرسنجی"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSurvey(questionnaire.id)}
                            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                            title="حذف نظرسنجی"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
                            title="گزینه‌های بیشتر"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Modal */}
      <Dialog open={isMainModalOpen} onOpenChange={setIsMainModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>انتخاب نوع نظرسنجی</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* نظرسنجی خام */}
              <Card
                className={`cursor-pointer border-gray-200 hover:border-blue-300 transition-colors ${
                  apiLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={
                  apiLoading ? undefined : () => setIsNameModalOpen(true)
                }
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-3 rounded-lg bg-blue-50 ml-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">نظرسنجی خام</div>
                    <div className="mt-1 text-xs text-gray-600">
                      ساخت نظرسنجی توسط شما
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading}>
                    {apiLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <ChevronLeft className="w-5 h-5 text-blue-600" />
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* نظرسنجی آماده */}
              <Card
                className="cursor-pointer border-gray-200 hover:border-green-300 transition-colors"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsReadySurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-3 rounded-lg bg-green-50 ml-4">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">نظرسنجی آماده</div>
                    <div className="mt-1 text-xs text-gray-600">
                      استفاده از نظرسنجی های تخصصی آماده
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading}>
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </Button>
                </CardContent>
              </Card>

              {/* تست تبلیغات */}
              <Card
                className={`cursor-pointer border-gray-200 hover:border-cyan-300 transition-colors ${
                  adTestLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={adTestLoading ? undefined : handleBillboardTestCreate}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-3 rounded-lg bg-cyan-50 ml-4">
                    <Target className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">تست تبلیغات</div>
                    <div className="mt-1 text-xs text-gray-600">
                      نظرسنجی آماده جهت تست تبلیغات قبل از اکران تبلیغ
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={adTestLoading}>
                    {adTestLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <ChevronLeft className="w-5 h-5 text-blue-600" />
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* طراحی نظرسنجی با هوش مصنوعی */}
              <Card
                className="cursor-pointer border-gray-200 hover:border-purple-300 transition-colors"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsAISurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-3 rounded-lg bg-purple-50 ml-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">
                      طراحی نظرسنجی با هوش مصنوعی
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      طراحی نظرسنجی با کمک هوش مصنوعی
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading}>
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </Button>
                </CardContent>
              </Card>

              {/* طراحی نظرسنجی با ما */}
              <Card
                className="cursor-pointer border-gray-200 hover:border-red-300 transition-colors"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsDesignWithUsModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-3 rounded-lg bg-red-50 ml-4">
                    <Eye className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">طراحی نظرسنجی با ما</div>
                    <div className="mt-1 text-xs text-gray-600">
                      طراحی نظرسنجی توسط کارشناسان سنجاپ
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading}>
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </Button>
                </CardContent>
              </Card>

              {/* بارگذاری نظرسنجی */}
              <Card
                className="cursor-pointer border-gray-200 hover:border-orange-300 transition-colors"
                onClick={() => {
                  setIsMainModalOpen(false);
                  setIsUploadSurveyModalOpen(true);
                }}
              >
                <CardContent className="flex items-center p-3">
                  <div className="flex justify-center items-center p-3 rounded-lg bg-orange-50 ml-4">
                    <Upload className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">بارگذاری نظرسنجی</div>
                    <div className="mt-1 text-xs text-gray-600">
                      وارد کردن نظرسنجی از طریق لینک پرسلاین یا فایل ورد
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled={apiLoading}>
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Modal */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>نام نظرسنجی خام</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              <Input
                id="title"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="عنوان نظرسنجی را وارد کنید"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNameModalOpen(false);
                  setSurveyTitle("");
                }}
              >
                انصراف
              </Button>
              <Button
                onClick={handleRawSurveyCreate}
                disabled={apiLoading || !surveyTitle.trim()}
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
