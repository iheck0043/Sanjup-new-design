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

// Chart color themes
const colorThemes = {
  default: [
    "#FF9300", "#0466C8", "#635985", "#86E5FF", "#F4E4F4", "#E4F4E4", "#F4A4F4", "#A4A4F4",
  ],
  green: [
    "#27AE60", "#2ECC71", "#58D68D", "#82E0AA", "#A9DFBF", "#D5F4E6", "#16A085", "#48C9B0",
  ],
  blue: [
    "#3498DB", "#5DADE2", "#85C1E9", "#AED6F1", "#D6EAF8", "#EBF5FB", "#2980B9", "#5499C7",
  ],
};

// Shadcn Chart component using recharts
const SurveyChart: React.FC<{
  options: SurveyOption[];
  type: "pie" | "column";
  showGender: boolean;
  colorTheme: 'default' | 'green' | 'blue';
}> = React.memo(({ options, type, showGender, colorTheme }) => {
  const chartColors = colorThemes[colorTheme];
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
  }, [options, showGender, chartColors]);

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
      <div className="bg-transparent dark:bg-transparent">
        <ChartContainer config={chartConfig} className="h-[450px] w-full bg-transparent">
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={160}
              innerRadius={0}
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
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              }
            />
            <ChartLegend 
              content={<ChartLegendContent className="text-gray-900 dark:text-white" />} 
            />
          </RechartsPieChart>
        </ChartContainer>
      </div>
    );
  }

  // Bar chart using recharts
  return (
    <div className="bg-transparent dark:bg-transparent">
      <ChartContainer config={chartConfig} className="h-[450px] w-full bg-transparent">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            className="text-gray-900 dark:text-white"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'currentColor' }} 
            className="text-gray-900 dark:text-white"
          />
          <Bar dataKey="value" radius={6}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => [`${value} نفر`, name]}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            }
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
});

// Individual Chart Component to prevent re-renders
const IndividualSurveyChart: React.FC<{
  questionId: number;
  questionIndex: number;
  options: SurveyOption[];
  loading: boolean;
  colorTheme: 'default' | 'green' | 'blue';
}> = React.memo(
  ({ questionId, questionIndex, options, loading, colorTheme }) => {
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
          colorTheme={colorTheme}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.questionId === nextProps.questionId &&
      prevProps.loading === nextProps.loading &&
      prevProps.colorTheme === nextProps.colorTheme &&
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
  const [colorTheme, setColorTheme] = useState<'default' | 'green' | 'blue'>('default');

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
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm" dir="rtl">
          <div className="px-6 py-4">
                          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-1 shadow-sm">
              <TabsTrigger 
                value="summary" 
                className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 py-2 px-4 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600 data-[state=active]:hover:bg-blue-600 text-gray-900 dark:text-gray-100"
              >
                <BarChart3 className="w-4 h-4" />
                خلاصه نتایج
              </TabsTrigger>
              <TabsTrigger
                value="details"
                disabled
                className="text-sm opacity-40 flex items-center gap-2 py-2 px-4 cursor-not-allowed"
              >
                <Users className="w-4 h-4" />
                جزئیات پاسخ کاربران
              </TabsTrigger>
              <TabsTrigger 
                value="ai-analysis" 
                className="text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 py-2 px-4 rounded-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600 data-[state=active]:hover:bg-purple-600 text-gray-900 dark:text-gray-100"
              >
                <Brain className="w-4 h-4" />
                تحلیل هوش مصنوعی
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="summary" className="mt-6" dir="rtl">
          <div className="w-full">
            {/* Color Theme Selector */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-3">انتخاب تم رنگی:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={colorTheme === 'default' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColorTheme('default')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-blue-500"></div>
                  پیش‌فرض
                </Button>
                <Button
                  variant={colorTheme === 'green' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColorTheme('green')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                  سبز
                </Button>
                <Button
                  variant={colorTheme === 'blue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColorTheme('blue')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                  آبی
                </Button>
              </div>
            </div>

            {questionsLoading && questions.length === 0 ? (
              <div className="space-y-8">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="w-full shadow-lg border-0 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="p-8">
                      <Skeleton className="h-96 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <Card
                    key={`question-${question.id}`}
                    className="w-full shadow-xl border-0 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Enhanced Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 p-4 border-b border-gray-100 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                            {question.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Enhanced Content */}
                    <CardContent className="p-4">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600" dir="ltr">
                        <IndividualSurveyChart
                          questionId={question.id}
                          questionIndex={index}
                          options={surveyResults[index]?.options || []}
                          loading={surveyResults[index]?.loading || false}
                          colorTheme={colorTheme}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6" dir="rtl">
          <div className="w-full">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white text-right">
                تحلیل هوش مصنوعی
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-right">
                نگاه کلی به داده‌ها و بینش‌های هوشمند از پاسخ‌های نظرسنجی
              </p>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <CardTitle className="text-2xl font-bold mb-2">تحلیل هوش مصنوعی</CardTitle>
                      <p className="text-purple-100">تحلیل پیشرفته داده‌های نظرسنجی</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {aiAnalysisLoading || aiCreateLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                        <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-lg font-medium text-gray-700 mt-4">در حال تحلیل داده‌ها...</span>
                      <span className="text-sm text-gray-500 mt-2">این فرآیند ممکن است چند دقیقه طول بکشد</span>
                    </div>
                  ) : aiAnalysis.last_analyse_result?.result ? (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-purple-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 justify-end">
                        <span className="text-sm font-medium text-green-700">تحلیل کامل شده</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="prose prose-lg max-w-none text-right">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {aiAnalysis.last_analyse_result.result}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">تحلیل در انتظار</h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        هنوز تحلیل هوش مصنوعی آماده نیست. لطفا دقایقی بعد مجدداً وارد این صفحه شوید.
                      </p>
                    </div>
                  )}

                  {(aiAnalysisError || aiCreateError) && (
                    <Alert variant="destructive" className="mt-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        خطا در بارگذاری تحلیل هوش مصنوعی: {aiAnalysisError || aiCreateError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Analysis Stats */}
                  {aiAnalysis.request_count !== undefined && aiAnalysis.max_requests !== undefined && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-900 font-bold">
                          {aiAnalysis.request_count} از {aiAnalysis.max_requests}
                        </span>
                        <span className="text-blue-700 font-medium">تعداد درخواست‌های تحلیل:</span>
                      </div>
                    </div>
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
