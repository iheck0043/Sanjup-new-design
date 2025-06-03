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

const QuestionnaireList = () => {
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
                    (sum, q) =>
                      sum + (q.questionnaire_completed?.answer_count || 0),
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو در نظرسنجی‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              {questionnaireStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questionnaires List */}
      <div className="space-y-4">
        {filteredQuestionnaires.map((questionnaire, index) => {
          const statusConfig = getStatusConfig(questionnaire.status);
          const isLast = index === filteredQuestionnaires.length - 1;

          return (
            <div
              key={questionnaire.id}
              ref={isLast ? lastQuestionnaireRef : null}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/questionnaire/${questionnaire.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} flex items-center gap-2`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                    ></span>
                    {statusConfig.label}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(questionnaire.created * 1000).toLocaleDateString(
                      "fa-IR"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/questionnaire/${questionnaire.id}`);
                    }}
                  >
                    <Eye className="w-5 h-5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSurvey(questionnaire.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {questionnaire.title}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {questionnaire.questionnaire_completed?.answer_count || 0}{" "}
                      پاسخ
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/questionnaire/${questionnaire.id}`);
                  }}
                >
                  ویرایش
                </Button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && <div className="text-center py-4 text-red-500">{error}</div>}

        {!loading && filteredQuestionnaires.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">نظرسنجی‌ای یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireList;
