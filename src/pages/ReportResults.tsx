import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  Download,
  Eye,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import FormHeader from "../components/FormHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../lib/auth-context";
import {
  fetchReportSummary,
  checkExportStatus,
  createExport,
  type ReportSummary,
  type ExportStatus,
} from "../lib/api";
import SurveyResultsReal from "../components/SurveyResultsReal";
import { ThemeToggle } from "../components/ui/theme-toggle";

// Types imported from API

// Status configurations
const STATUS_CONFIG = {
  draft: {
    color: "bg-gray-100 text-gray-800",
    icon: AlertCircle,
    text: "پیش‌نویس",
  },
  published: {
    color: "bg-blue-100 text-blue-800",
    icon: Eye,
    text: "منتشر شده",
  },
  finished: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    text: "تکمیل شده",
  },
  expired: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    text: "منقضی شده",
  },
};

const ReportResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  // State
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [countdownTimer, setCountdownTimer] = useState(300); // 5 minutes
  const [formTitle, setFormTitle] = useState("گزارش نتایج");

  // Intervals
  const [exportInterval, setExportInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [countdownInterval, setCountdownInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 7) {
      return new Intl.RelativeTimeFormat("fa-IR").format(-diffDays, "day");
    }

    return date.toLocaleDateString("fa-IR");
  }, []);

  // Completion status
  const getCompletionStatus = useCallback((): string => {
    if (!reportData) return "";

    if (reportData.status === "finished") {
      return "تکمیل شده";
    }

    if (!reportData.single_user_expire_at) {
      return "";
    }

    const expireDate = new Date(reportData.single_user_expire_at);
    const now = new Date();

    return expireDate > now
      ? "در حال تکمیل"
      : expireDate.toLocaleDateString("fa-IR");
  }, [reportData]);

  // Last export info
  const lastExportInfo = useMemo(() => {
    if (!exportStatus?.file_address || exportStatus.waiting) {
      return null;
    }
    return new Date(exportStatus.updated).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [exportStatus]);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    if (!id || !accessToken) return;

    setIsLoading(true);
    try {
      const response = await fetchReportSummary(id, accessToken);
      setReportData(response.data);
      setFormTitle(`گزارش ${response.data.title}`);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات گزارش:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, accessToken]);

  // Countdown management
  const startCountdown = useCallback(() => {
    setCountdownTimer(300);

    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    const interval = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExporting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setCountdownInterval(interval);
  }, [countdownInterval]);

  // Stop export
  const stopExport = useCallback(() => {
    setIsExporting(false);
    if (exportInterval) {
      clearInterval(exportInterval);
      setExportInterval(null);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
  }, [exportInterval, countdownInterval]);

  // Check export status
  const checkExportStatusHandler = useCallback(async () => {
    if (!id || !accessToken) return;

    try {
      const response = await checkExportStatus(id, accessToken);
      setExportStatus(response.data);

      if (!response.data.waiting && response.data.file_address) {
        stopExport();

        // Download file
        const link = document.createElement("a");
        link.href = response.data.file_address;
        link.download = `survey-results-${id}.xlsx`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("خطا در بررسی وضعیت خروجی:", error);
    }
  }, [id, accessToken, stopExport]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (isExporting || !id || !accessToken) return;

    setIsExporting(true);
    startCountdown();

    try {
      const response = await createExport(id, accessToken);
      setExportStatus(response.data);

      // Start polling for export status
      const interval = setInterval(() => {
        checkExportStatusHandler();
      }, 5000);

      setExportInterval(interval);

      // Auto-stop after 5 minutes
      setTimeout(() => {
        stopExport();
      }, 300000);
    } catch (error) {
      console.error("خطا در شروع خروجی:", error);
      setIsExporting(false);
    }
  }, [
    isExporting,
    id,
    accessToken,
    startCountdown,
    checkExportStatusHandler,
    stopExport,
  ]);

  // Navigation
  const goToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // Effects
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (exportInterval) clearInterval(exportInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [exportInterval, countdownInterval]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        dir="rtl"
      >
        <FormHeader 
          formTitle={formTitle} 
          setFormTitle={setFormTitle}
          steps={
            id ? [
              { id: 1, title: "طراحی نظرسنجی", path: `/questionnaire/${id}` },
              { id: 2, title: "انتخاب مخاطب", path: `/questionnaire/${id}/audience` },
              { id: 3, title: "گزارش نتایج", path: `/questionnaire/${id}/results` },
            ] : undefined
          }
          backPath={id ? `/questionnaire/${id}/audience` : "/"}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">در حال بارگذاری گزارش...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        dir="rtl"
      >
        <FormHeader 
          formTitle={formTitle} 
          setFormTitle={setFormTitle}
          steps={
            id ? [
              { id: 1, title: "طراحی نظرسنجی", path: `/questionnaire/${id}` },
              { id: 2, title: "انتخاب مخاطب", path: `/questionnaire/${id}/audience` },
              { id: 3, title: "گزارش نتایج", path: `/questionnaire/${id}/results` },
            ] : undefined
          }
          backPath={id ? `/questionnaire/${id}/audience` : "/"}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>گزارش مورد نظر یافت نشد.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[reportData.status]?.icon || AlertCircle;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      dir="rtl"
    >
      <FormHeader 
        formTitle={formTitle} 
        setFormTitle={setFormTitle}
        steps={
          id ? [
            { id: 1, title: "طراحی نظرسنجی", path: `/questionnaire/${id}` },
            { id: 2, title: "انتخاب مخاطب", path: `/questionnaire/${id}/audience` },
            { id: 3, title: "گزارش نتایج", path: `/questionnaire/${id}/results` },
          ] : undefined
        }
        backPath={id ? `/questionnaire/${id}/audience` : "/"}
      />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Fixed Right Sidebar */}
        <div className="fixed top-20 right-0 w-96 h-[calc(100vh-80px)] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-10 overflow-y-auto">
          <div className="p-6">
            {/* Survey Info Card */}
            <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200 line-clamp-2 leading-tight">
                      {reportData.title}
                    </h2>
                    <div className="mt-2">
                      <Badge
                        className={`${
                          STATUS_CONFIG[reportData.status]?.color
                        } flex items-center gap-1 text-xs px-3 py-1 w-fit`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[reportData.status]?.text}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        پیشرفت نظرسنجی
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                      {reportData.questionnaire_completed?.percent}%
                    </span>
                  </div>
                  <Progress
                    value={reportData.questionnaire_completed?.percent}
                    className="h-3 mb-3"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">پاسخ دریافت شده</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {reportData.questionnaire_completed?.answer_count} از {reportData.questionnaire_completed?.user_limit} نفر
                    </span>
                  </div>
                </div>

                {/* Date Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">تاریخ ایجاد</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {formatDate(reportData.created)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">تاریخ انتشار</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {reportData.single_user_publish_date
                        ? formatDate(reportData.single_user_publish_date)
                        : "منتشر نشده"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Section */}
            <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  دانلود گزارش
                </h3>
                
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white relative h-12 text-base font-medium"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      در حال آماده سازی...
                      {countdownTimer > 0 && (
                        <span className="absolute -top-2 -right-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full shadow-lg">
                          {formatTime(countdownTimer)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 ml-2" />
                      دانلود فایل اکسل
                    </>
                  )}
                </Button>

                {lastExportInfo && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 inline ml-1" />
                      آخرین دانلود: {lastExportInfo}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 mr-96 p-6 pt-32">
          <div className="max-w-none">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">تحلیل نتایج نظرسنجی</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">نمودارها و آمار تفصیلی پاسخ‌های دریافت شده</p>
            </div>

            {/* Survey Results - Each chart in full width */}
            <div className="space-y-8">
              <SurveyResultsReal pollId={id || ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportResults;
