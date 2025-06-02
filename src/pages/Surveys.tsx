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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchQuestionnaires,
  deleteQuestionnaire,
  questionnaireStatuses,
  type Questionnaire,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const Surveys = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver>();
  const [error, setError] = useState<string | null>(null);

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

  const filteredQuestionnaires = questionnaires.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              نظرسنجی‌ها
            </h1>
            <p className="text-gray-600">مدیریت و ساخت نظرسنجی‌های خود</p>
          </div>
          <Button
            onClick={() => navigate("/questionnaire/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            نظرسنجی جدید
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  کل نظرسنجی‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {questionnaires.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  نظرسنجی‌های فعال
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    questionnaires.filter((q) => q.status === "published")
                      .length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  کل پاسخ‌ها
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {questionnaires.reduce(
                    (total, q) =>
                      total + q.questionnaire_completed.answer_count,
                    0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو در نظرسنجی‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            {questionnaireStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Surveys List */}
      {filteredQuestionnaires.length === 0 ? (
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
            onClick={() => navigate("/questionnaire/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            ایجاد نظرسنجی جدید
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestionnaires.map((questionnaire, index) => {
            const statusConfig = getStatusConfig(questionnaire.status);
            const isLast = index === filteredQuestionnaires.length - 1;

            return (
              <Card
                key={questionnaire.id}
                ref={isLast ? lastQuestionnaireRef : null}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3
                          className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() =>
                            navigate(`/questionnaire/${questionnaire.id}`)
                          }
                        >
                          {questionnaire.title}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                          ></div>
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">تعداد پاسخ</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {
                                questionnaire.questionnaire_completed
                                  .answer_count
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">تاریخ ایجاد</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(
                                questionnaire.created * 1000
                              ).toLocaleDateString("fa-IR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSurvey(questionnaire.id)}
                        className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" />
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
  );
};

export default Surveys;
