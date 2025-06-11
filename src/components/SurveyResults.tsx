import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Highcharts imports commented out due to installation issues
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
// import HighchartsExporting from "highcharts/modules/exporting";
// import HighchartsExportData from "highcharts/modules/export-data";
// import HighchartsOfflineExporting from "highcharts/modules/offline-exporting";
import {
  BarChart3,
  PieChart,
  Download,
  Brain,
  TrendingUp,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";

// Initialize Highcharts modules - commented out due to installation issues
// if (typeof Highcharts === "object") {
//   HighchartsExporting(Highcharts);
//   HighchartsExportData(Highcharts);
//   HighchartsOfflineExporting(Highcharts);
// }

// Set Persian language options for Highcharts - commented out
// Highcharts.setOptions({
//   lang: {
//     contextButtonTitle: "ذخیره نمودار",
//     downloadPNG: "ذخیره به عنوان PNG",
//     downloadJPEG: "ذخیره به عنوان JPEG",
//     downloadPDF: "ذخیره به عنوان PDF",
//     downloadSVG: "ذخیره به عنوان SVG",
//     downloadXLS: "ذخیره به عنوان Excel",
//     downloadCSV: "ذخیره به عنوان CSV",
//   },
//   exporting: {
//     enabled: true,
//     buttons: {
//       contextButton: {
//         menuItems: [
//           "downloadPNG",
//           "downloadJPEG",
//           "downloadCSV",
//           "downloadXLS",
//         ],
//       },
//     },
//     chartOptions: {
//       chart: {
//         backgroundColor: "#ffffff",
//         style: {
//           fontFamily: "Vazirmatn, Arial, sans-serif",
//         },
//       },
//       title: {
//         style: {
//           fontFamily: "Vazirmatn, Arial, sans-serif",
//         },
//       },
//       subtitle: {
//         style: {
//           fontFamily: "Vazirmatn, Arial, sans-serif",
//         },
//       },
//       xAxis: {
//         labels: {
//           style: {
//             fontFamily: "Vazirmatn, Arial, sans-serif",
//           },
//         },
//       },
//       yAxis: {
//         labels: {
//           style: {
//             fontFamily: "Vazirmatn, Arial, sans-serif",
//           },
//         },
//       },
//       legend: {
//         itemStyle: {
//           fontFamily: "Vazirmatn, Arial, sans-serif",
//         },
//       },
//       tooltip: {
//         style: {
//           fontFamily: "Vazirmatn, Arial, sans-serif",
//         },
//       },
//     },
//   },
// });

// Types
interface SurveyOption {
  value_title: string;
  count: number;
  men_count: number;
  women_count: number;
  non_available: number;
}

interface Question {
  id: number;
  question_title: string;
  type: string;
}

interface SurveyResult {
  question_title: string;
  options: SurveyOption[];
  loading: boolean;
}

interface AIAnalysisResult {
  last_analyse_result?: {
    result: string;
  };
}

interface SurveyResultsProps {
  pollId: string;
  apiClient?: {
    get: (url: string, params?: any) => Promise<any>;
    post: (url: string, data?: any) => Promise<any>;
  };
}

const SurveyResults: React.FC<SurveyResultsProps> = ({ pollId, apiClient }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);
  const [genderBreakdown, setGenderBreakdown] = useState<boolean[]>([]);
  const [chartTypes, setChartTypes] = useState<("pie" | "column")[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart colors - Persian-friendly palette
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

  // Load questions
  const loadQuestions = useCallback(async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      const response = await apiClient.get(
        `v1/questionnaire/${pollId}/stats-questions`
      );

      if (response?.data) {
        // Filter out text-type questions
        const filteredQuestions = response.data.filter(
          (question: Question) =>
            question.type !== "text_question" && question.type !== "statement"
        );

        setQuestions(filteredQuestions);

        // Initialize survey results with loading states
        const initialResults = filteredQuestions.map(() => ({ loading: true }));
        setSurveyResults(initialResults as SurveyResult[]);
        setGenderBreakdown(new Array(filteredQuestions.length).fill(false));
        setChartTypes(new Array(filteredQuestions.length).fill("pie"));

        // Load survey results for each question with delay
        for (let i = 0; i < filteredQuestions.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
          await loadSurveyResult(pollId, filteredQuestions[i].id, i);
        }
      }
    } catch (err) {
      setError("خطا در بارگذاری سوالات");
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  }, [pollId, apiClient]);

  // Load individual survey result
  const loadSurveyResult = async (
    surveyId: string,
    questionId: number,
    index: number
  ) => {
    if (!apiClient) return;

    try {
      const response = await apiClient.get(
        `v1/dashboard/${surveyId}/all-answers-statics`,
        {
          question_id: questionId,
        }
      );

      if (response?.data?.[0]) {
        setSurveyResults((prev) => {
          const newResults = [...prev];
          newResults[index] = {
            ...response.data[0],
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
          question_title: questions[index]?.question_title || "",
          options: [],
          loading: false,
        };
        return newResults;
      });
    }
  };

  // Load AI analysis
  const loadAIAnalysis = useCallback(async () => {
    if (!apiClient) return;

    try {
      const response = await apiClient.get(`v1/ai/analyse/${pollId}`, {
        type: "analyse_answers",
      });

      if (response?.data) {
        setAIAnalysis(response.data);

        // Create new analysis if needed
        if (!response.data.last_analyse_result?.result) {
          await createAIAnalysis();
        }
      }
    } catch (err) {
      console.error("Error loading AI analysis:", err);
    }
  }, [pollId, apiClient]);

  // Create AI analysis
  const createAIAnalysis = async () => {
    if (!apiClient) return;

    try {
      const response = await apiClient.post(
        `v1/ai/create-analyse-history/${pollId}`,
        {
          type: "analyse_answers",
        }
      );

      if (response?.data?.result) {
        setAIAnalysis((prev) => ({
          ...prev,
          last_analyse_result: { result: response.data.result },
        }));
      }
    } catch (err) {
      console.error("Error creating AI analysis:", err);
    }
  };

  // Toggle gender breakdown for a specific question
  const toggleGenderBreakdown = (index: number) => {
    setGenderBreakdown((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Toggle chart type for a specific question
  const toggleChartType = (index: number, type: "pie" | "column") => {
    setChartTypes((prev) => {
      const newState = [...prev];
      newState[index] = type;
      return newState;
    });
  };

  // Simple chart component (replacement for Highcharts)
  const SimpleChart: React.FC<{
    options: SurveyOption[];
    type: "pie" | "column";
    showGender: boolean;
  }> = ({ options, type, showGender }) => {
    const totalCount = options.reduce(
      (sum, option) => sum + Number(option.count),
      0
    );

    if (type === "pie") {
      return (
        <div className="h-64 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            {options.map((option, index) => {
              const percentage =
                totalCount > 0
                  ? Math.round((Number(option.count) / totalCount) * 100)
                  : 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="font-medium">{option.value_title}</span>
                  </div>
                  <div className="text-sm">
                    {showGender
                      ? `آقا: ${option.men_count}, خانم: ${option.women_count}`
                      : `${option.count} (${percentage}%)`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Column chart representation
    return (
      <div className="h-64 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-end justify-around h-full space-x-2">
          {options.map((option, index) => {
            const height =
              totalCount > 0
                ? Math.max(20, (Number(option.count) / totalCount) * 180)
                : 20;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-center mb-2">
                  {showGender
                    ? `آقا: ${option.men_count}\nخانم: ${option.women_count}`
                    : option.count}
                </div>
                <div
                  className="w-16 rounded-t"
                  style={{
                    backgroundColor: chartColors[index % chartColors.length],
                    height: `${height}px`,
                  }}
                />
                <div className="text-xs mt-2 text-center max-w-16 truncate">
                  {option.value_title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Create pie chart options
  const createPieChartOptions = (
    options: SurveyOption[],
    questionIndex: number
  ) => {
    const showGender = genderBreakdown[questionIndex];
    const totalCount = options.reduce(
      (sum, option) => sum + Number(option.count),
      0
    );

    const data = options.flatMap((option, index) => {
      if (showGender) {
        return [
          {
            name: `${option.value_title} (آقا)`,
            y: Math.round((Number(option.men_count) / totalCount) * 100),
            color: chartColors[index % chartColors.length],
            actualCount: Number(option.men_count),
          },
          {
            name: `${option.value_title} (خانم)`,
            y: Math.round((Number(option.women_count) / totalCount) * 100),
            color: chartColors[index % chartColors.length],
            actualCount: Number(option.women_count),
          },
          {
            name: `${option.value_title} (نامشخص)`,
            y: Math.round((Number(option.non_available) / totalCount) * 100),
            color: chartColors[index % chartColors.length],
            actualCount: Number(option.non_available),
          },
        ].filter((item) => item.y > 0);
      } else {
        return [
          {
            name: option.value_title,
            y: Math.round((Number(option.count) / totalCount) * 100),
            color: chartColors[index % chartColors.length],
            actualCount: Number(option.count),
          },
        ];
      }
    });

    return {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        style: {
          fontFamily: "Vazirmatn, Arial, sans-serif",
        },
      },
      title: { text: "" },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: false,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            style: { fontFamily: "Vazirmatn, Arial, sans-serif" },
            formatter: function () {
              // @ts-ignore
              return this.y > 0
                ? `<b>${this.point.name}</b>: ${this.y}%`
                : null;
            },
          },
          showInLegend: false,
          size: "90%",
        },
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">{point.name}</span>: <b>{point.actualCount}</b>',
        style: { fontFamily: "Vazirmatn, Arial, sans-serif" },
      },
      series: [
        {
          name: "Results",
          data: data,
        },
      ],
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              "downloadPNG",
              "downloadJPEG",
              "downloadCSV",
              "downloadXLS",
            ],
          },
        },
      },
    };
  };

  // Create column chart options
  const createColumnChartOptions = (
    options: SurveyOption[],
    questionIndex: number
  ) => {
    const showGender = genderBreakdown[questionIndex];
    const totalCount = options.reduce(
      (sum, option) => sum + Number(option.count),
      0
    );

    let series;
    if (showGender) {
      series = [
        {
          name: "آقا",
          data: options.map((option, index) => ({
            name: option.value_title,
            y: Number(option.men_count),
            color: chartColors[index % chartColors.length],
          })),
        },
        {
          name: "خانم",
          data: options.map((option, index) => ({
            name: option.value_title,
            y: Number(option.women_count),
            color: chartColors[index % chartColors.length],
          })),
        },
        {
          name: "نامشخص",
          data: options.map((option, index) => ({
            name: option.value_title,
            y: Number(option.non_available),
            color: chartColors[index % chartColors.length],
          })),
        },
      ];
    } else {
      series = [
        {
          name: "نتایج",
          data: options.map((option, index) => ({
            name: option.value_title,
            y: Number(option.count),
            color: chartColors[index % chartColors.length],
          })),
          showInLegend: false,
        },
      ];
    }

    return {
      chart: {
        type: "column",
        backgroundColor: "transparent",
        style: {
          fontFamily: "Vazirmatn, Arial, sans-serif",
        },
      },
      title: { text: "" },
      credits: { enabled: false },
      xAxis: {
        type: "category",
        crosshair: true,
        lineColor: "transparent",
        tickLength: 0,
      },
      yAxis: {
        min: 0,
        title: { text: "" },
        gridLineColor: "transparent",
        lineColor: "transparent",
        tickLength: 0,
      },
      plotOptions: {
        column: {
          stacking: showGender ? "normal" : undefined,
          dataLabels: {
            enabled: true,
            style: { fontFamily: "Vazirmatn, Arial, sans-serif" },
          },
          borderRadiusTopLeft: 5,
          borderRadiusTopRight: 5,
        },
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b>',
        style: { fontFamily: "Vazirmatn, Arial, sans-serif" },
      },
      legend: {
        enabled: showGender,
        itemStyle: { fontFamily: "Vazirmatn, Arial, sans-serif" },
      },
      series: series,
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: [
              "downloadPNG",
              "downloadJPEG",
              "downloadCSV",
              "downloadXLS",
            ],
          },
        },
      },
    };
  };

  useEffect(() => {
    loadQuestions();
    loadAIAnalysis();
  }, [loadQuestions, loadAIAnalysis]);

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
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
          <div className="container  ">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-64 w-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
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
                          {index + 1} - {question.question_title}
                        </CardTitle>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Switch
                            id={`gender-${index}`}
                            checked={genderBreakdown[index] || false}
                            onCheckedChange={() => toggleGenderBreakdown(index)}
                          />
                          <Label
                            htmlFor={`gender-${index}`}
                            className="text-xs"
                          >
                            تفکیک جنسیت
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant={
                              chartTypes[index] === "pie"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => toggleChartType(index, "pie")}
                          >
                            <PieChart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={
                              chartTypes[index] === "column"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => toggleChartType(index, "column")}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      {surveyResults[index]?.loading ? (
                        <Skeleton className="h-64 w-full rounded-lg" />
                      ) : surveyResults[index]?.options ? (
                        <div className="space-y-4">
                          {/* Simple Chart replacement for Highcharts */}
                          <SimpleChart
                            options={surveyResults[index].options}
                            type={chartTypes[index]}
                            showGender={genderBreakdown[index]}
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                          داده‌ای برای نمایش وجود ندارد
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6">
          <div className="container mx-auto px-4 ">
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
                  {aiAnalysis.last_analyse_result?.result ? (
                    <p className="text-sm leading-relaxed">
                      {aiAnalysis.last_analyse_result.result}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      هنوز تحلیل هوش مصنوعی آماده نیست، لطفا دقایقی بعد مجدداً
                      وارد این صفحه شوید.
                    </p>
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

export default SurveyResults;
