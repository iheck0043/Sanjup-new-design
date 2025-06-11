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
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        dir="rtl"
      >
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">در حال بارگذاری گزارش...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        dir="rtl"
      >
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
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
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      dir="rtl"
    >
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={goToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به داشبورد
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
              {/* Survey Name */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  نام نظرسنجی
                </h3>
                <div className="border-b border-gray-200 pb-2 mb-4"></div>
                <p className="font-semibold text-lg text-gray-900">
                  نظرسنجی {reportData.title}
                </p>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  وضعیت
                </h3>
                <div className="border-b border-gray-200 pb-2 mb-4"></div>
                <Badge
                  className={`${
                    STATUS_CONFIG[reportData.status]?.color
                  } flex items-center gap-1`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {STATUS_CONFIG[reportData.status]?.text}
                </Badge>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  پیشرفت نظرسنجی
                </h3>
                <div className="border-b border-gray-200 pb-2 mb-4"></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{reportData.questionnaire_completed?.percent}%</span>
                  </div>
                  <Progress
                    value={reportData.questionnaire_completed?.percent}
                    className="h-3"
                  />
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">
                      {reportData.questionnaire_completed?.answer_count}
                    </span>
                    {" از "}
                    <span>
                      {reportData.questionnaire_completed?.user_limit}
                    </span>
                    {" نفر"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      تاریخ ایجاد
                    </h3>
                    <div className="border-b border-gray-200 pb-2 mb-4"></div>
                    <p className="text-sm">{formatDate(reportData.created)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      تاریخ انتشار
                    </h3>
                    <div className="border-b border-gray-200 pb-2 mb-4"></div>
                    <p className="text-sm">
                      {reportData.single_user_publish_date
                        ? formatDate(reportData.single_user_publish_date)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      تاریخ تکمیل
                    </h3>
                    <div className="border-b border-gray-200 pb-2 mb-4"></div>
                    <p className="text-sm">{getCompletionStatus() || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Export */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  دانلود نتایج
                </h3>
                <div className="border-b border-gray-200 pb-2 mb-4"></div>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="w-full relative"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      <span>در حال آماده سازی</span>
                      {countdownTimer > 0 && (
                        <span className="absolute -top-2 -right-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          {formatTime(countdownTimer)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 ml-2" />
                      دانلود فایل اکسل
                    </>
                  )}
                </Button>

                {lastExportInfo && (
                  <p className="text-xs text-gray-500 mt-2">
                    آخرین فایل اکسل ساخته شده در {lastExportInfo}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey Results */}
        <SurveyResultsReal pollId={id || ""} />
      </div>
    </div>
  );
};

export default ReportResults;
