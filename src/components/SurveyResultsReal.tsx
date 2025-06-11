import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart3,
  PieChart,
  Brain,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Types based on the API response structure
interface SurveyOption {
  value_id: number;
  value_title: string;
  count: number;
  percentage: string;
  women_count: number;
  men_count: number;
  non_available: number;
}

interface Question {
  id: number;
  title: string;
  type: string;
}

interface SurveyResult {
  question_order: number;
  title: string;
  options: SurveyOption[];
  loading: boolean;
}

interface AIAnalysisResult {
  last_analyse_result?: {
    result: string;
  };
  request_count?: number;
  max_requests?: number;
}

interface SurveyResultsProps {
  pollId: string;
}

// Chart colors - Persian-friendly palette (moved outside component)
const chartColors = [
  "#FF9300",
  "#0466C8",
  "#635985",
  "#86E5FF",
  "#F4E4F4",
  "#E4F4E4",
  "#F4A4F4",
  "#A4A4F4",
];

// Shadcn Chart component using recharts
const SurveyChart: React.FC<{
  options: SurveyOption[];
  type: "pie" | "column";
  showGender: boolean;
}> = React.memo(({ options, type, showGender }) => {
  // Prepare chart data based on gender breakdown
  const chartData = React.useMemo(() => {
    if (showGender) {
      return options
        .flatMap((option, index) => [
          {
            name: `${option.value_title} (آقا)`,
            value: option.men_count,
            fill: chartColors[index % chartColors.length],
            category: "men",
            originalName: option.value_title,
          },
          {
            name: `${option.value_title} (خانم)`,
            value: option.women_count,
            fill: `${chartColors[index % chartColors.length]}80`, // Semi-transparent
            category: "women",
            originalName: option.value_title,
          },
        ])
        .filter((item) => item.value > 0);
    } else {
      return options.map((option, index) => ({
        name: option.value_title,
        value: option.count,
        fill: chartColors[index % chartColors.length],
        percentage: option.percentage,
      }));
    }
  }, [options, showGender]);

  // Chart config for shadcn
  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
      };
    });
    return config;
  }, [chartData]);

  if (type === "pie") {
    return (
      <ChartContainer config={chartConfig} className="h-96 w-full">
        <RechartsPieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name, value, percentage }) =>
              `${name}: ${value} ${percentage ? `(${percentage}%)` : ""}`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [`${value} نفر`, name]}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
        </RechartsPieChart>
      </ChartContainer>
    );
  }

  // Bar chart using recharts
  return (
    <ChartContainer config={chartConfig} className="h-96 w-full">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Bar dataKey="value" radius={4}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [`${value} نفر`, name]}
            />
          }
        />
      </BarChart>
    </ChartContainer>
  );
});

// Individual Chart Component to prevent re-renders
const IndividualSurveyChart: React.FC<{
  questionId: number;
  questionIndex: number;
  options: SurveyOption[];
  loading: boolean;
}> = React.memo(
  ({ questionId, questionIndex, options, loading }) => {
    const [chartType, setChartType] = useState<"pie" | "column">("pie");
    const [showGender, setShowGender] = useState(false);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (!options || options.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      );
    }

    return (
      <div>
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id={`gender-${questionIndex}`}
              checked={showGender}
              onCheckedChange={setShowGender}
            />
            <Label htmlFor={`gender-${questionIndex}`} className="text-xs">
              تفکیک جنسیت
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setChartType("pie")}
            >
              <PieChart className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === "column" ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setChartType("column")}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chart */}
        <SurveyChart
          options={options}
          type={chartType}
          showGender={showGender}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.questionId === nextProps.questionId &&
      prevProps.loading === nextProps.loading &&
      JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
    );
  }
);

const SurveyResultsReal: React.FC<SurveyResultsProps> = ({ pollId }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult>({});
  const [isComponentMounted, setIsComponentMounted] = useState(true);
  const [activeRequests, setActiveRequests] = useState<(() => void)[]>([]);

  // Loading states
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [aiAnalysisLoading, setAIAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAIAnalysisError] = useState<string | null>(null);
  const [aiCreateLoading, setAICreateLoading] = useState(false);
  const [aiCreateError, setAICreateError] = useState<string | null>(null);

  // Auth
  const { accessToken } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Load questions
  const loadQuestions = useCallback(async () => {
    if (!isComponentMounted || !accessToken) return;

    setQuestionsLoading(true);
    setQuestionsError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${pollId}/stats-questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();

      if (data?.data) {
        // Filter out text-type questions like in Vue code
        const filteredQuestions = data.data.filter(
          (question: Question) =>
            question.type !== "text_question" && question.type !== "statement"
        );

        setQuestions(filteredQuestions);

        // Initialize survey results with loading states
        const initialResults = filteredQuestions.map((_, index) => ({
          question_order: index + 1,
          title: "",
          options: [],
          loading: true,
        }));
        setSurveyResults(initialResults);

        // Load survey results for each question with delay (like Vue code)
        for (let i = 0; i < filteredQuestions.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
          await loadSurveyResult(pollId, filteredQuestions[i].id, i);
        }
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestionsError(
        err instanceof Error ? err.message : "خطا در بارگذاری سوالات"
      );
    } finally {
      setQuestionsLoading(false);
    }
  }, [pollId, accessToken, isComponentMounted]);

  // Load individual survey result
  const loadSurveyResult = async (
    surveyId: string,
    questionId: number,
    index: number
  ) => {
    if (!isComponentMounted || !accessToken) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/dashboard/${surveyId}/all-answers-statics?question_id=${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch survey result");
      }

      const data = await response.json();

      if (data?.data?.[0]) {
        setSurveyResults((prev) => {
          const newResults = [...prev];
          newResults[index] = {
            ...data.data[0],
            loading: false,
          };
          return newResults;
        });
      }
    } catch (err) {
      console.error("Error loading survey result:", err);
      setSurveyResults((prev) => {
        const newResults = [...prev];
        newResults[index] = {
          question_order: index + 1,
          title: questions[index]?.title || "",
          options: [],
          loading: false,
        };
        return newResults;
      });
    }
  };

  // Load AI analysis
  const loadAIAnalysis = useCallback(async () => {
    if (!isComponentMounted || !accessToken) return;

    setAIAnalysisLoading(true);
    setAIAnalysisError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/ai/analyse/${pollId}?type=analyse_answers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AI analysis");
      }

      const data = await response.json();

      if (data?.data) {
        setAIAnalysis(data.data);

        // Create new analysis if needed (like Vue code)
        if (!data.data.last_analyse_result?.result) {
          if (
            data.data.request_count === 0 ||
            data.data.request_count < data.data.max_requests
          ) {
            await createAIAnalysis();
          }
        }
      }
    } catch (err) {
      console.error("Error loading AI analysis:", err);
      setAIAnalysisError(
        err instanceof Error ? err.message : "خطا در بارگذاری تحلیل"
      );
    } finally {
      setAIAnalysisLoading(false);
    }
  }, [pollId, accessToken, isComponentMounted]);

  // Create AI analysis
  const createAIAnalysis = async () => {
    if (!isComponentMounted || !accessToken) return;

    setAICreateLoading(true);
    setAICreateError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/ai/create-analyse-history/${pollId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ type: "analyse_answers" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create AI analysis");
      }

      const data = await response.json();

      if (data?.data?.result) {
        setAIAnalysis((prev) => ({
          ...prev,
          last_analyse_result: { result: data.data.result },
        }));
      }
    } catch (err) {
      console.error("Error creating AI analysis:", err);
      setAICreateError(
        err instanceof Error ? err.message : "خطا در ایجاد تحلیل"
      );
    } finally {
      setAICreateLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    loadAIAnalysis();

    return () => {
      setIsComponentMounted(false);
      activeRequests.forEach((stop) => stop());
    };
  }, [loadQuestions, loadAIAnalysis]);

  if (questionsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          خطا در بارگذاری اطلاعات: {questionsError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full shadow-none border-0 bg-transparent">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-background border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="text-base">
              خلاصه نتایج
            </TabsTrigger>
            <TabsTrigger
              value="details"
              disabled
              className="text-base opacity-50"
            >
              جزئیات پاسخ کاربران
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="text-base">
              تحلیل هوش مصنوعی
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="mt-6">
          <div className="container mx-auto  ">
            {questionsLoading && questions.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-96 w-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                  <Card
                    key={`question-${question.id}`}
                    className={`p-6 ${
                      index % 2 === 0
                        ? "border-r-2 border-r-dotted border-r-gray-300"
                        : ""
                    } ${
                      index < questions.length - 2
                        ? "border-b-2 border-b-gray-200"
                        : ""
                    }`}
                  >
                    <CardHeader className="p-0 pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {index + 1} - {question.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <IndividualSurveyChart
                        questionId={question.id}
                        questionIndex={index}
                        options={surveyResults[index]?.options || []}
                        loading={surveyResults[index]?.loading || false}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6">
          <div className="container mx-auto  ">
            <div className="mb-8">
              <h3 className="text-lg font-light mb-6 text-right">
                نگاه کلی به داده‌ها و تحلیل هوش مصنوعی
              </h3>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle>تحلیل هوش مصنوعی</CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  {aiAnalysisLoading || aiCreateLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">در حال بارگذاری تحلیل...</span>
                    </div>
                  ) : aiAnalysis.last_analyse_result?.result ? (
                    <p className="text-sm leading-relaxed">
                      {aiAnalysis.last_analyse_result.result}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      هنوز تحلیل هوش مصنوعی آماده نیست، لطفا دقایقی بعد مجدداً
                      وارد این صفحه شوید.
                    </p>
                  )}

                  {(aiAnalysisError || aiCreateError) && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        خطا در بارگذاری تحلیل هوش مصنوعی:{" "}
                        {aiAnalysisError || aiCreateError}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SurveyResultsReal;
