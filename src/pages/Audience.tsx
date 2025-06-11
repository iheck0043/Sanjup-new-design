import React, { useState, useEffect } from "react";
import FormHeader from "../components/FormHeader";
import {
  Users,
  Target,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Copy,
  MapPin,
  DollarSign,
  AlertTriangle,
  GraduationCap,
  Building,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

interface Segment {
  id: string;
  title: string;
  filters: Record<string, any>;
  count: number;
  cost?: number;
  perUnitPrice?: number;
  estimatedTime?: string;
  possible?: boolean;
  errorMessage?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterMetric {
  id: number;
  title: string;
  priority: number;
}

interface FilterLabel {
  id: number;
  title: string;
  metrics: FilterMetric[];
}

interface FilterCategory {
  id: number;
  title: string;
  priority: number;
  icon: string;
  labels: FilterLabel[];
}

interface FilterApiResponse {
  data: FilterCategory[];
  info: {
    response_type: string;
    status: number;
    message: string;
    attrs: any[];
    count: number;
    next: string;
    previous: string;
  };
}

interface QuestionnaireCompleted {
  answer_count: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  status: string;
  created: number;
  questionnaire_completed: QuestionnaireCompleted;
}

interface QuestionnaireResponse {
  data: Questionnaire;
  info: {
    status: number;
    message: string;
  };
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Audience = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("بدون عنوان");
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      title: "سگمنت 1",
      filters: {},
      count: 100,
      possible: true,
    },
  ]);
  const [selectedSegmentId, setSelectedSegmentId] = useState("1");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>(
    []
  );
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [selectedFilterForSettings, setSelectedFilterForSettings] = useState<
    number | null
  >(null);

  // Fetch filter categories from API
  const fetchFilterCategories = async () => {
    try {
      setFiltersLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/filtering/sanjup/filter/label`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت فیلترها");
      }

      const data: FilterApiResponse = await response.json();
      if (data.info.status === 200) {
        setFilterCategories(data.data);
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
      toast.error("خطا در دریافت فیلترها");
    } finally {
      setFiltersLoading(false);
    }
  };

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);

  // Calculate total cost for all segments
  const totalCost = segments.reduce(
    (sum, segment) => sum + (segment.cost || 0),
    0
  );
  const totalRespondents = segments.reduce(
    (sum, segment) => sum + segment.count,
    0
  );
  const allSegmentsPossible = segments.every(
    (segment) => segment.possible !== false
  );

  // Debounced API call for cost calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateCosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [segments]);

  const calculateCosts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const updatedSegments = segments.map((segment) => {
        const filterCount = Object.keys(segment.filters).length;
        const basePrice = 1000; // Base price per person
        const multiplier = Math.max(1, filterCount * 0.2 + 1);
        const perUnitPrice = Math.round(basePrice * multiplier);
        const cost = segment.count * perUnitPrice;

        // Simulate feasibility check
        const possible = segment.count <= 3000 && filterCount <= 10;

        return {
          ...segment,
          perUnitPrice,
          cost,
          estimatedTime: "2-3 روز کاری",
          possible,
          errorMessage: !possible
            ? "با این فیلترها تعداد پاسخ‌دهنده کافی یافت نمی‌شود. لطفاً تنظیمات را تغییر دهید."
            : undefined,
        };
      });

      setSegments(updatedSegments);
    } catch (error) {
      toast.error("خطا در محاسبه هزینه");
    } finally {
      setLoading(false);
    }
  };

  const addSegment = () => {
    const newSegment: Segment = {
      id: Date.now().toString(),
      title: `سگمنت ${segments.length + 1}`,
      filters: {},
      count: 100,
      possible: true,
    };
    setSegments([...segments, newSegment]);
    setSelectedSegmentId(newSegment.id);
  };

  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      const updatedSegments = segments.filter((s) => s.id !== id);
      setSegments(updatedSegments);
      if (selectedSegmentId === id) {
        setSelectedSegmentId(updatedSegments[0].id);
      }
    }
  };

  const duplicateSegment = (segment: Segment) => {
    const newSegment: Segment = {
      ...segment,
      id: Date.now().toString(),
      title: `${segment.title} (کپی)`,
    };
    setSegments([...segments, newSegment]);
    setSelectedSegmentId(newSegment.id);
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updateSegmentFilter = (
    segmentId: string,
    filterKey: string,
    value: any
  ) => {
    setSegments(
      segments.map((s) =>
        s.id === segmentId
          ? { ...s, filters: { ...s.filters, [filterKey]: value } }
          : s
      )
    );
  };

  const removeAppliedFilter = (filterKey: string) => {
    setSegments(
      segments.map((s) => {
        if (s.id === selectedSegmentId) {
          const newFilters = { ...s.filters };
          delete newFilters[filterKey];
          return { ...s, filters: newFilters };
        }
        return s;
      })
    );
  };

  const toggleCategory = (categoryId: number) => {
    const categoryIdStr = categoryId.toString();
    setExpandedCategories((prev) =>
      prev.includes(categoryIdStr)
        ? prev.filter((id) => id !== categoryIdStr)
        : [...prev, categoryIdStr]
    );
  };

  const selectFilter = (filterId: number) => {
    setSelectedFilterForSettings(filterId);
  };

  const renderFilterSettings = () => {
    if (!selectedFilterForSettings) return null;

    // Find the filter label from API data
    const filterLabel = filterCategories
      .flatMap((category) => category.labels)
      .find((label) => label.id === selectedFilterForSettings);

    if (!filterLabel) return null;

    const filterIdStr = selectedFilterForSettings.toString();
    const currentValue = selectedSegment?.filters[filterIdStr] || [];

    return (
      <div className="space-y-4">
        <h4 className="font-medium">{filterLabel.title}</h4>
        <div className="space-y-2">
          {filterLabel.metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Checkbox
                checked={currentValue.includes(metric.id)}
                onCheckedChange={(checked) => {
                  const updated = checked
                    ? [...currentValue, metric.id]
                    : currentValue.filter((id: number) => id !== metric.id);
                  updateSegmentFilter(selectedSegmentId, filterIdStr, updated);
                }}
              />
              <span className="text-sm">{metric.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get filter label by ID
  const getFilterLabel = (filterId: string) => {
    const filterLabel = filterCategories
      .flatMap((category) => category.labels)
      .find((label) => label.id.toString() === filterId);

    return filterLabel ? filterLabel.title : "فیلتر";
  };

  // Check if filter has meaningful values
  const hasValidFilterValue = (value: any) => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      return Object.values(value).some((v) => v && v !== "");
    }
    return true;
  };

  useEffect(() => {
    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      navigate("/login");
      return;
    }

    // Fetch filter categories
    fetchFilterCategories();

    if (id && id !== "new") {
      fetchQuestionnaire();
    } else {
      setLoading(false);
    }
  }, [id, accessToken, navigate]);

  const fetchQuestionnaire = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/sanjup/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پرسشنامه");
      }

      const data: QuestionnaireResponse = await response.json();
      if (data.info.status === 200) {
        setQuestionnaire(data.data);
        setFormTitle(data.data.title);
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در دریافت اطلاعات پرسشنامه"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']"
      dir="rtl"
    >
      <FormHeader
        formTitle={questionnaire?.title || formTitle}
        setFormTitle={setFormTitle}
        steps={
          id
            ? [
                { id: 1, title: "طراحی نظرسنجی", path: `/questionnaire/${id}` },
                {
                  id: 2,
                  title: "انتخاب مخاطب",
                  path: `/questionnaire/${id}/audience`,
                },
                {
                  id: 3,
                  title: "گزارش نتایج",
                  path: `/questionnaire/${id}/results`,
                },
              ]
            : undefined
        }
        backPath={id ? `/questionnaire/${id}` : "/"}
      />

      <div className="flex-1 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Column 1: Segment List (smaller) */}
            <div className="col-span-2">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">سگمنت‌ها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segments.map((segment) => (
                    <div
                      key={segment.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedSegmentId === segment.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedSegmentId(segment.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Input
                          value={segment.title}
                          onChange={(e) =>
                            updateSegment(segment.id, { title: e.target.value })
                          }
                          className="text-xs border-none p-0 h-auto bg-transparent font-medium"
                          placeholder="عنوان سگمنت"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSegment(segment);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {segments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSegment(segment.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Response Count Slider */}
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-600">
                          تعداد پاسخ‌دهنده: {segment.count} نفر
                        </label>
                        <Slider
                          value={[segment.count]}
                          onValueChange={(value) =>
                            updateSegment(segment.id, { count: value[0] })
                          }
                          min={1}
                          max={5000}
                          step={1}
                          className="w-full"
                        />
                        <Input
                          type="number"
                          min="1"
                          max="5000"
                          value={segment.count}
                          onChange={(e) =>
                            updateSegment(segment.id, {
                              count: parseInt(e.target.value) || 1,
                            })
                          }
                          className="text-xs h-6"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {segment.possible === false && (
                        <div className="flex items-center space-x-1 space-x-reverse mt-2 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs">غیرممکن</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={addSegment}
                    variant="outline"
                    className="w-full border-dashed border-2 h-10"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 ml-2" />
                    افزودن سگمنت
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Filter Categories and Filters */}
            <div className="col-span-3">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">فیلترها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filtersLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    filterCategories.map((category) => (
                      <Collapsible
                        key={category.id}
                        open={expandedCategories.includes(
                          category.id.toString()
                        )}
                        onOpenChange={() => toggleCategory(category.id)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <img
                                  src={category.icon}
                                  alt=""
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">
                                  {category.title}
                                </span>
                              </div>
                              {expandedCategories.includes(
                                category.id.toString()
                              ) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="space-y-2 mt-2 mr-4">
                            {category.labels?.map((label) => (
                              <div
                                key={label.id}
                                className="p-2 rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                onClick={() => selectFilter(label.id)}
                              >
                                <span className="text-sm">{label.title}</span>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Filter Settings (always visible, larger) */}
            <div className="col-span-4">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">تنظیمات فیلتر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedFilterForSettings ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">
                        برای تنظیم فیلترها، یک فیلتر از فهرست انتخاب کنید
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">
                          {getFilterLabel(selectedFilterForSettings.toString())}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFilterForSettings(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {renderFilterSettings()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 4: Summary (smaller) */}
            <div className="col-span-3">
              <Card className="rounded-2xl shadow-lg sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 space-x-reverse text-base">
                    <Target className="w-4 h-4" />
                    <span>خلاصه پروژه</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalRespondents}
                    </div>
                    <div className="text-xs text-gray-600">کل پاسخ‌دهنده</div>
                  </div>

                  {/* Restaurant-style itemization */}
                  <div className="border-t pt-3 space-y-2">
                    <h4 className="font-medium text-xs mb-2">جزئیات محاسبه:</h4>
                    {segments.map((segment) => (
                      <div
                        key={segment.id}
                        className="flex justify-between items-center text-xs"
                      >
                        <span>{segment.title}</span>
                        <span>
                          {segment.count} ×{" "}
                          {segment.perUnitPrice?.toLocaleString() || 0} ={" "}
                          {segment.cost?.toLocaleString() || 0} تومان
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Applied Filters Summary */}
                  {selectedSegment &&
                    Object.keys(selectedSegment.filters).length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="font-medium text-xs mb-2">
                          فیلترهای اعمال شده:
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(selectedSegment.filters).map(
                            ([filterId, value]) => {
                              if (!hasValidFilterValue(value)) return null;

                              const filterLabel = getFilterLabel(filterId);
                              const selectedMetrics =
                                filterCategories
                                  .flatMap((cat) => cat.labels)
                                  .find(
                                    (label) => label.id.toString() === filterId
                                  )
                                  ?.metrics.filter((metric) =>
                                    value.includes(metric.id)
                                  )
                                  .map((metric) => metric.title) || [];

                              return (
                                <div key={filterId} className="text-xs">
                                  <span className="font-medium">
                                    {filterLabel}:
                                  </span>{" "}
                                  <span className="text-gray-600">
                                    {selectedMetrics.join(", ")}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">کل هزینه:</span>
                      <span className="font-bold text-base">
                        {loading
                          ? "..."
                          : `${totalCost.toLocaleString()} تومان`}
                      </span>
                    </div>

                    {segments.some((s) => s.estimatedTime) && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">زمان تخمینی:</span>
                        <span>2-3 روز کاری</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!allSegmentsPossible || totalCost === 0}
                      size="sm"
                    >
                      پرداخت
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audience;
