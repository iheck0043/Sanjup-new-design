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
  User,
  UserCheck,
  ArrowLeft,
  ArrowRight,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

interface Segment {
  id: string;
  title: string;
  user_limit: number;
  target_gender: "M" | "F" | null;
  target_min_age: number;
  target_max_age: number;
  target_city: number[];
  filters: Record<string, any>;
  count?: number;
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

interface Province {
  id: number;
  name: string;
}

interface City {
  id: number;
  province: number;
  name: string;
  favorite: boolean;
}

interface ProvinceApiResponse {
  data: Province[];
  info: {
    status: number;
    message: string;
  };
}

interface CityApiResponse {
  data: City[];
  info: {
    status: number;
    message: string;
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

interface SegmentApiResponse {
  data: {
    id: string;
    title: string;
    user_limit: number;
    target_gender: "M" | "F" | null;
    target_min_age: number;
    target_max_age: number;
    target_city: number[];
  }[];
  info: {
    status: number;
    message: string;
  };
}

interface CreateSegmentRequest {
  user_limit: number;
  target_gender?: "M" | "F" | null;
  target_min_age?: number;
  target_max_age?: number;
  target_city?: number[];
}

interface DefaultFilterData {
  count_of_active_user: number;
  count_of_selectable_user: number;
  max_age: number;
  min_age: number;
}

interface SegmentDetailsResponse {
  data: {
    user_limit: number;
    target_gender: "M" | "F" | null;
    target_min_age: number;
    target_max_age: number;
    target_city: number[];
    target_city_name: {
      id: number;
      name: string;
      province: number;
      province_name: string;
    }[];
    target_all_cities_province: {
      id: number;
      name: string;
    }[];
    default_filter_data: DefaultFilterData;
  };
  info: {
    status: number;
    message: string;
  };
}

interface SegmentLabelResponse {
  data: {
    label_metric: number;
  }[];
  info: {
    status: number;
    message: string;
  };
}

interface SegmentInvoiceItem {
  base_price: number;
  cost_of_each_person: number;
  cost_of_all_persons: number;
  cost_of_filters: number;
  cost_of_answer_time: number;
  tax_percent: number;
  cost_of_tax: number;
  total_factor: number;
  total_cost: number;
  total_previous_payment: number;
  free_trial: boolean;
  trial_limit: number | null;
}

interface SegmentInvoiceResponse {
  data: SegmentInvoiceItem[];
  info: {
    status: number;
    message: string;
  };
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Audience = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  // Check if we're in adtest context
  const isAdTest = location.pathname.includes("/adtest/");

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("بدون عنوان");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "general",
  ]);
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>(
    []
  );
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [selectedFilterForSettings, setSelectedFilterForSettings] = useState<
    number | null
  >(null);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentDetailsLoading, setSegmentDetailsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // General filters state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [generalFilterType, setGeneralFilterType] = useState<string | null>(
    null
  );
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [defaultFilterData, setDefaultFilterData] =
    useState<DefaultFilterData | null>(null);
  const [segmentMetrics, setSegmentMetrics] = useState<
    Record<string, number[]>
  >({});
  const [segmentCityDetails, setSegmentCityDetails] = useState<
    Record<
      string,
      {
        target_city_name: {
          id: number;
          name: string;
          province: number;
          province_name: string;
        }[];
        target_all_cities_province: {
          id: number;
          name: string;
        }[];
      }
    >
  >({});
  const [invoiceData, setInvoiceData] = useState<SegmentInvoiceItem[] | null>(
    null
  );
  const [expandedSegmentDetails, setExpandedSegmentDetails] = useState<
    string[]
  >([]);
  const [segmentOperationLoading, setSegmentOperationLoading] = useState(false);
  const [filterOperationLoading, setFilterOperationLoading] = useState(false);
  const [tempSelectedCities, setTempSelectedCities] = useState<
    Record<string, number[]>
  >({});

  // Fetch segments from API
  const fetchSegments = async () => {
    if (!id || id === "new") return;

    try {
      setSegmentsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت سگمنت‌ها");
      }

      const data: SegmentApiResponse = await response.json();
      if (data.info.status === 200) {
        const mappedSegments: Segment[] = data.data.map((segment) => ({
          ...segment,
          target_city: segment.target_city || [], // Ensure target_city is always an array
          filters: {},
          count: segment.user_limit,
          possible: true,
        }));
        setSegments(mappedSegments);
        if (mappedSegments.length > 0 && !selectedSegmentId) {
          setSelectedSegmentId(mappedSegments[0].id);
        }
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast.error("خطا در دریافت سگمنت‌ها");
    } finally {
      setSegmentsLoading(false);
    }
  };

  // Create new segment
  const createSegment = async () => {
    if (!id || id === "new") return;

    try {
      setSegmentOperationLoading(true);
      const requestData = {
        user_limit: 100,
      };

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/create/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در ایجاد سگمنت");
      }

      const data = await response.json();
      if (data.info.status === 200 || data.info.status === 201) {
        // Refresh segments list
        await fetchSegments();

        // Fetch updated invoice data after creating new segment
        fetchSegmentInvoice();

        toast.success("سگمنت با موفقیت ایجاد شد");
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error creating segment:", error);
      toast.error("خطا در ایجاد سگمنت");
    } finally {
      setSegmentOperationLoading(false);
    }
  };

  // Update segment
  const updateSegmentApi = async (
    segmentId: string,
    updates: Partial<CreateSegmentRequest>
  ) => {
    try {
      setSegmentOperationLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در به‌روزرسانی سگمنت");
      }

      const data = await response.json();
      if (data.info.status === 200) {
        // Update local state
        setSegments((prev) =>
          prev.map((segment) =>
            segment.id === segmentId
              ? {
                  ...segment,
                  ...updates,
                  count: updates.user_limit || segment.count,
                }
              : segment
          )
        );

        // Refetch segment details to ensure sync
        fetchSegmentDetails(segmentId);

        // Fetch updated invoice data
        fetchSegmentInvoice();
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error updating segment:", error);
      toast.error("خطا در به‌روزرسانی سگمنت");
    } finally {
      setSegmentOperationLoading(false);
    }
  };

  // Fetch single segment details
  const fetchSegmentDetails = async (segmentId: string) => {
    try {
      setSegmentDetailsLoading(true);
      // Fetch segment details
      const segmentResponse = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!segmentResponse.ok) {
        throw new Error("خطا در دریافت جزئیات سگمنت");
      }

      const segmentData: SegmentDetailsResponse = await segmentResponse.json();
      console.log("Segment Details:", segmentData);

      if (segmentData.info.status === 200) {
        // Store default filter data (use the first segment's data)
        if (!defaultFilterData) {
          setDefaultFilterData(segmentData.data.default_filter_data);
        }

        // Update the segment in local state with detailed data
        setSegments((prev) =>
          prev.map((segment) =>
            segment.id === segmentId
              ? {
                  ...segment,
                  user_limit: segmentData.data.user_limit,
                  target_gender: segmentData.data.target_gender,
                  target_min_age: segmentData.data.target_min_age,
                  target_max_age: segmentData.data.target_max_age,
                  target_city: segmentData.data.target_city,
                }
              : segment
          )
        );

        // Store city details for this segment
        setSegmentCityDetails((prev) => ({
          ...prev,
          [segmentId]: {
            target_city_name: segmentData.data.target_city_name,
            target_all_cities_province:
              segmentData.data.target_all_cities_province,
          },
        }));

        // Initialize temp selected cities for this segment
        setTempSelectedCities((prev) => ({
          ...prev,
          [segmentId]: segmentData.data.target_city,
        }));

        // Fetch segment labels/metrics
        const labelsResponse = await fetch(
          `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}/label/?page_size=100`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (labelsResponse.ok) {
          const labelsData: SegmentLabelResponse = await labelsResponse.json();
          console.log("Segment Labels:", labelsData);

          if (labelsData.info.status === 200) {
            // Extract metric IDs from the response
            const metricIds = labelsData.data.map((item) => item.label_metric);

            // Store metrics for this specific segment
            setSegmentMetrics((prev) => ({
              ...prev,
              [segmentId]: metricIds,
            }));

            // Update selectedMetrics only if this is the currently selected segment
            if (segmentId === selectedSegmentId) {
              setSelectedMetrics(metricIds);
            }

            console.log(
              "Selected Metrics for segment",
              segmentId,
              ":",
              metricIds
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching segment details:", error);
      toast.error("خطا در دریافت جزئیات سگمنت");
    } finally {
      setSegmentDetailsLoading(false);
    }
  };

  // Delete segment
  const deleteSegment = async (segmentId: string) => {
    try {
      setSegmentOperationLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در حذف سگمنت");
      }

      const data = await response.json();
      if (data.info.status === 200) {
        // Remove from local state
        const updatedSegments = segments.filter((s) => s.id !== segmentId);
        setSegments(updatedSegments);

        // Update selected segment if needed
        if (selectedSegmentId === segmentId) {
          setSelectedSegmentId(
            updatedSegments.length > 0 ? updatedSegments[0].id : null
          );
        }

        // Fetch updated invoice data after segment deletion
        fetchSegmentInvoice();

        toast.success("سگمنت با موفقیت حذف شد");
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error deleting segment:", error);
      toast.error("خطا در حذف سگمنت");
    } finally {
      setSegmentOperationLoading(false);
    }
  };

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

  // Fetch provinces from API
  const fetchProvinces = async () => {
    try {
      setProvincesLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/auth/province/?page_size=40`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت لیست استان‌ها");
      }

      const data: ProvinceApiResponse = await response.json();
      setProvinces(data.data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast.error("خطا در دریافت لیست استان‌ها");
    } finally {
      setProvincesLoading(false);
    }
  };

  // Fetch cities for a specific province
  const fetchCities = async (provinceId: number) => {
    try {
      setCitiesLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/auth/province/${provinceId}/cities/?page_size=40`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت لیست شهرها");
      }

      const data: CityApiResponse = await response.json();
      setCities(data.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("خطا در دریافت لیست شهرها");
    } finally {
      setCitiesLoading(false);
    }
  };

  const selectedSegment = selectedSegmentId
    ? segments.find((s) => s.id === selectedSegmentId)
    : null;

  // Calculate total cost from invoice data
  const totalCost =
    invoiceData?.reduce((sum, item) => sum + item.cost_of_all_persons, 0) || 0;
  const totalTax =
    invoiceData?.reduce((sum, item) => sum + item.cost_of_tax, 0) || 0;
  const grandTotal =
    invoiceData?.reduce((sum, item) => sum + item.total_cost, 0) || 0;

  const totalRespondents = segments.reduce(
    (sum, segment) => sum + segment.user_limit,
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
    if (segments.length === 0) return;

    setLoading(true);
    try {
      // Simulate API call for cost calculation
      const updatedSegments = segments.map((segment) => {
        const filterCount = Object.keys(segment.filters).length;
        const basePrice = 1000; // Base price per person
        const multiplier = Math.max(1, filterCount * 0.2 + 1);
        const perUnitPrice = Math.round(basePrice * multiplier);
        const cost = segment.user_limit * perUnitPrice;

        // Simulate feasibility check
        const possible = segment.user_limit <= 3000 && filterCount <= 10;

        return {
          ...segment,
          count: segment.user_limit, // For backward compatibility
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
    createSegment();
  };

  const removeSegment = (segmentId: string) => {
    if (segments.length > 1) {
      deleteSegment(segmentId);
    }
  };

  const duplicateSegment = (segment: Segment) => {
    createSegment();
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    // Update local state immediately for UI responsiveness
    setSegments(segments.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    // Prepare API updates
    const apiUpdates: Partial<CreateSegmentRequest> = {};
    if (updates.user_limit !== undefined)
      apiUpdates.user_limit = updates.user_limit;
    if (updates.target_gender !== undefined)
      apiUpdates.target_gender = updates.target_gender;
    if (updates.target_min_age !== undefined)
      apiUpdates.target_min_age = updates.target_min_age;
    if (updates.target_max_age !== undefined)
      apiUpdates.target_max_age = updates.target_max_age;
    if (updates.target_city !== undefined)
      apiUpdates.target_city = updates.target_city;

    // Call API if there are valid updates
    if (Object.keys(apiUpdates).length > 0) {
      updateSegmentApi(id, apiUpdates);
    }
  };

  // Fetch segment invoice/pricing
  // Helper function to convert Persian/Arabic numerals to English
  const convertToEnglishNumber = (num: number | string): number => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    const englishDigits = "0123456789";

    let numStr = num.toString();

    // Convert Persian digits to English
    for (let i = 0; i < persianDigits.length; i++) {
      numStr = numStr.replace(
        new RegExp(persianDigits[i], "g"),
        englishDigits[i]
      );
    }

    // Convert Arabic digits to English
    for (let i = 0; i < arabicDigits.length; i++) {
      numStr = numStr.replace(
        new RegExp(arabicDigits[i], "g"),
        englishDigits[i]
      );
    }

    return parseInt(numStr) || 0;
  };

  const fetchSegmentInvoice = async () => {
    if (!id || id === "new") return;

    try {
      setSummaryLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات هزینه");
      }

      const data: SegmentInvoiceResponse = await response.json();
      console.log("Segment Invoice Data:", data);

      if (data.info.status === 200) {
        setInvoiceData(data.data);
      }
    } catch (error) {
      console.error("Error fetching segment invoice:", error);
      // Don't show error toast for now since we're just testing
    } finally {
      setSummaryLoading(false);
    }
  };

  // Save single metric to API
  const saveSegmentMetric = async (segmentId: string, metricId: number) => {
    try {
      setFilterOperationLoading(true);

      // Ensure metricId is a proper number
      const numericMetricId = convertToEnglishNumber(metricId);
      console.log(
        "Save - Original metricId:",
        metricId,
        "Converted:",
        numericMetricId
      );

      const requestData = {
        label_metric: numericMetricId,
      };

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}/label/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در ذخیره فیلتر");
      }

      const data = await response.json();
      if (data.info.status === 200 || data.info.status === 201) {
        console.log("Segment metric saved successfully");
        // Refetch segment details to get updated metrics
        fetchSegmentDetails(segmentId);

        // Fetch updated invoice data after metric change
        fetchSegmentInvoice();
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error saving segment metric:", error);
      toast.error("خطا در ذخیره فیلتر");
    } finally {
      setFilterOperationLoading(false);
    }
  };

  const removeSegmentMetric = async (segmentId: string, metricId: number) => {
    try {
      setFilterOperationLoading(true);

      // Ensure metricId is a proper number
      const numericMetricId = convertToEnglishNumber(metricId);
      console.log(
        "Remove - Original metricId:",
        metricId,
        "Converted:",
        numericMetricId
      );

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}/label/${numericMetricId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در حذف فیلتر");
      }

      // Check for successful status codes (200, 204)
      if (response.status === 200 || response.status === 204) {
        console.log("Segment metric removed successfully");
        // Refetch segment details to get updated metrics
        fetchSegmentDetails(segmentId);

        // Fetch updated invoice data after metric change
        fetchSegmentInvoice();
      } else {
        // Try to parse JSON response for error message if available
        try {
          const data = await response.json();
          throw new Error(data.info?.message || "خطا در حذف فیلتر");
        } catch (jsonError) {
          throw new Error("خطا در حذف فیلتر");
        }
      }
    } catch (error) {
      console.error("Error removing segment metric:", error);
      toast.error("خطا در حذف فیلتر");
    } finally {
      setFilterOperationLoading(false);
    }
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

    // Note: Individual metrics are saved via saveSegmentMetric when clicked
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

  const toggleSegmentDetails = (segmentId: string) => {
    setExpandedSegmentDetails((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const selectFilter = (filterId: number | string) => {
    if (typeof filterId === "string") {
      // Handle general filters
      setGeneralFilterType(filterId);
      setSelectedFilterForSettings(null);

      // Fetch provinces when location filter is selected
      if (filterId === "location" && provinces.length === 0) {
        fetchProvinces();
      }
    } else {
      // Handle API filters
      setSelectedFilterForSettings(filterId);
      setGeneralFilterType(null);
    }
  };

  const renderGeneralFilterSettingsForType = (filterType: string) => {
    switch (filterType) {
      case "location":
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-[10px]">محل سکونت</h4>

            {/* Province Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium">استان:</label>
              {provincesLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <Select
                  value={selectedProvince?.toString() || ""}
                  onValueChange={(value) => {
                    const provinceId = parseInt(value);
                    setSelectedProvince(provinceId);
                    setCities([]);
                    fetchCities(provinceId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب استان" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem
                        key={province.id}
                        value={province.id.toString()}
                      >
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Cities Selection */}
            {selectedProvince && (
              <div className="space-y-2">
                <label className="text-[10px] font-medium">شهر:</label>
                {citiesLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        انتخاب شهر
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                        }}
                        className="font-medium text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-700"
                        onClick={() => {
                          if (!selectedSegmentId) return;
                          const allCitiesInProvince = cities.map(
                            (city) => city.id
                          );
                          const currentCities =
                            tempSelectedCities[selectedSegmentId] ||
                            selectedSegment?.target_city ||
                            [];
                          const citiesNotInList = allCitiesInProvince.filter(
                            (cityId) => !currentCities.includes(cityId)
                          );
                          const updated = [
                            ...currentCities,
                            ...citiesNotInList,
                          ];
                          setTempSelectedCities((prev) => ({
                            ...prev,
                            [selectedSegmentId]: updated,
                          }));
                        }}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            checked={(() => {
                              const currentCities =
                                tempSelectedCities[selectedSegmentId] ||
                                selectedSegment?.target_city ||
                                [];
                              const allCitiesInProvince = cities.map(
                                (city) => city.id
                              );
                              return (
                                allCitiesInProvince.length > 0 &&
                                allCitiesInProvince.every((cityId) =>
                                  currentCities.includes(cityId)
                                )
                              );
                            })()}
                            onCheckedChange={() => {}}
                          />
                          <span>همه شهرها ({cities.length} شهر)</span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Individual Cities */}
                      {cities.map((city) => (
                        <DropdownMenuItem
                          key={city.id}
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
                          onClick={() => {
                            if (!selectedSegmentId) return;
                            const currentCities =
                              tempSelectedCities[selectedSegmentId] ||
                              selectedSegment?.target_city ||
                              [];
                            const isSelected = currentCities.includes(city.id);
                            const updated = isSelected
                              ? currentCities.filter((id) => id !== city.id)
                              : [...currentCities, city.id];
                            setTempSelectedCities((prev) => ({
                              ...prev,
                              [selectedSegmentId]: updated,
                            }));
                          }}
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              checked={(() => {
                                const currentCities =
                                  tempSelectedCities[selectedSegmentId] ||
                                  selectedSegment?.target_city ||
                                  [];
                                return currentCities.includes(city.id);
                              })()}
                              onCheckedChange={() => {}}
                            />
                            <span>{city.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Currently Selected Cities Display */}
            {selectedSegmentId &&
              (() => {
                const currentCities =
                  tempSelectedCities[selectedSegmentId] ||
                  selectedSegment?.target_city ||
                  [];
                return currentCities.length > 0;
              })() && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-gray-800 dark:text-gray-200">
                      شهرهای انتخاب شده (
                      {(() => {
                        const currentCities =
                          tempSelectedCities[selectedSegmentId] ||
                          selectedSegment?.target_city ||
                          [];
                        return currentCities.length;
                      })()}{" "}
                      شهر):
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      disabled={
                        segmentOperationLoading || filterOperationLoading
                      }
                      onClick={() => {
                        if (
                          !selectedSegmentId ||
                          segmentOperationLoading ||
                          filterOperationLoading
                        )
                          return;
                        setTempSelectedCities((prev) => ({
                          ...prev,
                          [selectedSegmentId]: [],
                        }));
                      }}
                    >
                      پاک کردن همه
                    </Button>
                  </div>

                  {(() => {
                    const cityDetails = segmentCityDetails[selectedSegmentId];
                    if (!cityDetails || !cityDetails.target_city_name)
                      return null;

                    const { target_city_name, target_all_cities_province } =
                      cityDetails;

                    // Use temp selected cities if available, otherwise use segment data
                    const currentSelectedCityIds =
                      tempSelectedCities[selectedSegmentId] ||
                      selectedSegment?.target_city ||
                      [];

                    // Filter city details based on currently selected cities
                    const filteredCityNames = target_city_name.filter((city) =>
                      currentSelectedCityIds.includes(city.id)
                    );

                    // Get IDs of provinces that have ALL cities selected
                    const completeProvinceIds = target_all_cities_province
                      ? target_all_cities_province.map((p) => p.id)
                      : [];

                    // Filter out cities that belong to complete provinces
                    const partialCityNames = filteredCityNames.filter(
                      (city) => !completeProvinceIds.includes(city.province)
                    );

                    // Group remaining cities by province
                    const citiesByProvince: Record<
                      string,
                      { name: string; cities: { id: number; name: string }[] }
                    > = {};
                    partialCityNames.forEach((city) => {
                      if (!citiesByProvince[city.province.toString()]) {
                        citiesByProvince[city.province.toString()] = {
                          name: city.province_name,
                          cities: [],
                        };
                      }
                      citiesByProvince[city.province.toString()].cities.push({
                        id: city.id,
                        name: city.name,
                      });
                    });

                    return (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {/* نمایش استان‌های کامل */}
                        {target_all_cities_province &&
                          target_all_cities_province.length > 0 &&
                          target_all_cities_province.map((province) => (
                            <div
                              key={`complete-${province.id}`}
                              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-[9px] text-white">
                                      ✓
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-medium text-green-800 dark:text-green-300">
                                    همه شهرهای {province.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  disabled={
                                    segmentOperationLoading ||
                                    filterOperationLoading
                                  }
                                  onClick={() => {
                                    if (
                                      !selectedSegmentId ||
                                      segmentOperationLoading ||
                                      filterOperationLoading
                                    )
                                      return;
                                    // Remove all cities from this province
                                    const provinceCityIds = target_city_name
                                      .filter(
                                        (city) => city.province === province.id
                                      )
                                      .map((city) => city.id);
                                    const currentCities =
                                      tempSelectedCities[selectedSegmentId] ||
                                      selectedSegment.target_city ||
                                      [];
                                    const updatedCities = currentCities.filter(
                                      (cityId) =>
                                        !provinceCityIds.includes(cityId)
                                    );
                                    setTempSelectedCities((prev) => ({
                                      ...prev,
                                      [selectedSegmentId]: updatedCities,
                                    }));
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-[9px] text-green-700 dark:text-green-400">
                                تمام شهرهای این استان انتخاب شده‌اند
                              </p>
                            </div>
                          ))}

                        {/* نمایش شهرهای جزئی از استان‌های دیگر */}
                        {Object.entries(citiesByProvince).map(
                          ([provinceId, provinceData]) => (
                            <div
                              key={`partial-${provinceId}`}
                              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-medium text-blue-800 dark:text-blue-300">
                                  {provinceData.name} (
                                  {provinceData.cities.length} شهر)
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  disabled={
                                    segmentOperationLoading ||
                                    filterOperationLoading
                                  }
                                  onClick={() => {
                                    if (
                                      !selectedSegmentId ||
                                      segmentOperationLoading ||
                                      filterOperationLoading
                                    )
                                      return;
                                    // Remove all cities from this province
                                    const provinceCityIds =
                                      provinceData.cities.map(
                                        (city) => city.id
                                      );
                                    const currentCities =
                                      tempSelectedCities[selectedSegmentId] ||
                                      selectedSegment.target_city ||
                                      [];
                                    const updatedCities = currentCities.filter(
                                      (cityId) =>
                                        !provinceCityIds.includes(cityId)
                                    );
                                    setTempSelectedCities((prev) => ({
                                      ...prev,
                                      [selectedSegmentId]: updatedCities,
                                    }));
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {provinceData.cities.map((city) => (
                                  <div
                                    key={city.id}
                                    className="inline-flex items-center bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-full px-2 py-1 text-[9px]"
                                  >
                                    <span className="text-gray-700 dark:text-gray-300 ml-1">
                                      {city.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                      disabled={
                                        segmentOperationLoading ||
                                        filterOperationLoading
                                      }
                                      onClick={() => {
                                        if (
                                          !selectedSegmentId ||
                                          segmentOperationLoading ||
                                          filterOperationLoading
                                        )
                                          return;
                                        const currentCities =
                                          tempSelectedCities[
                                            selectedSegmentId
                                          ] ||
                                          selectedSegment.target_city ||
                                          [];
                                        const updatedCities =
                                          currentCities.filter(
                                            (id) => id !== city.id
                                          );
                                        setTempSelectedCities((prev) => ({
                                          ...prev,
                                          [selectedSegmentId]: updatedCities,
                                        }));
                                      }}
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}

                  {/* Save Button for City Changes */}
                  {selectedSegmentId &&
                    hasUnsavedCityChanges(selectedSegmentId) && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-yellow-800 dark:text-yellow-300">
                            تغییرات ذخیره نشده‌ای دارید
                          </span>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-3 text-[9px] text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                              disabled={filterOperationLoading}
                              onClick={() => {
                                if (!selectedSegmentId) return;
                                // Reset to original cities
                                setTempSelectedCities((prev) => {
                                  const newState = { ...prev };
                                  delete newState[selectedSegmentId];
                                  return newState;
                                });
                              }}
                            >
                              لغو
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-[9px] bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={filterOperationLoading}
                              onClick={() => {
                                if (!selectedSegmentId) return;
                                saveCityChanges(selectedSegmentId);
                              }}
                            >
                              {filterOperationLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              ) : null}
                              ذخیره تغییرات
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}
          </div>
        );

      case "gender":
        const isMaleChecked =
          selectedSegment?.target_gender === "M" ||
          selectedSegment?.target_gender === null;
        const isFemaleChecked =
          selectedSegment?.target_gender === "F" ||
          selectedSegment?.target_gender === null;

        return (
          <div className="space-y-4">
            <h4 className="font-medium text-[10px]">جنسیت</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={isMaleChecked}
                  onCheckedChange={(checked) => {
                    if (!selectedSegmentId) return;

                    let newGender: "M" | "F" | null = null;
                    if (checked && isFemaleChecked) {
                      newGender = null;
                    } else if (checked && !isFemaleChecked) {
                      newGender = "M";
                    } else if (!checked && isFemaleChecked) {
                      newGender = "F";
                    } else {
                      newGender = null;
                    }

                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_gender: newGender }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_gender: newGender,
                    });
                  }}
                />
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-[10px]">مرد</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={isFemaleChecked}
                  onCheckedChange={(checked) => {
                    if (!selectedSegmentId) return;

                    let newGender: "M" | "F" | null = null;
                    if (checked && isMaleChecked) {
                      newGender = null;
                    } else if (checked && !isMaleChecked) {
                      newGender = "F";
                    } else if (!checked && isMaleChecked) {
                      newGender = "M";
                    } else {
                      newGender = null;
                    }

                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_gender: newGender }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_gender: newGender,
                    });
                  }}
                />
                <UserCheck className="w-4 h-4 text-pink-500" />
                <span className="text-[10px]">زن</span>
              </div>
            </div>
          </div>
        );

      case "age":
        const currentMinAge = selectedSegment?.target_min_age || 18;
        const currentMaxAge = selectedSegment?.target_max_age || 65;

        return (
          <div className="space-y-4">
            <h4 className="font-medium text-[10px]">سن</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-600">حداقل سن</label>
                  <Input
                    type="number"
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    value={currentMinAge}
                    onChange={(e) => {
                      if (!selectedSegmentId) return;
                      const minAge = Math.max(
                        parseInt(e.target.value) ||
                          defaultFilterData?.min_age ||
                          15,
                        defaultFilterData?.min_age || 15
                      );
                      const maxAge = Math.max(minAge, currentMaxAge);
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? {
                                ...s,
                                target_min_age: minAge,
                                target_max_age: maxAge,
                              }
                            : s
                        )
                      );
                    }}
                    onBlur={(e) => {
                      if (!selectedSegmentId) return;
                      const minAge = Math.max(
                        parseInt(e.target.value) ||
                          defaultFilterData?.min_age ||
                          15,
                        defaultFilterData?.min_age || 15
                      );
                      const maxAge = Math.max(minAge, currentMaxAge);
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    className="text-[10px] h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-600">حداکثر سن</label>
                  <Input
                    type="number"
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    value={currentMaxAge}
                    onChange={(e) => {
                      if (!selectedSegmentId) return;
                      const maxAge = Math.min(
                        parseInt(e.target.value) ||
                          defaultFilterData?.max_age ||
                          80,
                        defaultFilterData?.max_age || 80
                      );
                      const minAge = Math.min(currentMinAge, maxAge);
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? {
                                ...s,
                                target_min_age: minAge,
                                target_max_age: maxAge,
                              }
                            : s
                        )
                      );
                    }}
                    onBlur={(e) => {
                      if (!selectedSegmentId) return;
                      const maxAge = Math.min(
                        parseInt(e.target.value) ||
                          defaultFilterData?.max_age ||
                          80,
                        defaultFilterData?.max_age || 80
                      );
                      const minAge = Math.min(currentMinAge, maxAge);
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    className="text-[10px] h-8"
                  />
                </div>
              </div>

              {/* Age Slider */}
              <div className="space-y-3">
                <label className="text-[9px] text-gray-600 dark:text-gray-400">
                  اسلایدر سن:
                </label>
                <div className="px-2">
                  <Slider
                    value={[currentMinAge, currentMaxAge]}
                    onValueChange={(values) => {
                      if (!selectedSegmentId) return;
                      const [minAge, maxAge] = values;
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? {
                                ...s,
                                target_min_age: minAge,
                                target_max_age: maxAge,
                              }
                            : s
                        )
                      );
                    }}
                    onValueCommit={(values) => {
                      if (!selectedSegmentId) return;
                      const [minAge, maxAge] = values;
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">
                      {defaultFilterData?.min_age || 15}
                    </span>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">
                      {defaultFilterData?.max_age || 80}
                    </span>
                  </div>
                </div>
              </div>

              {/* Age Preset Buttons */}
              <div className="space-y-2">
                <label className="text-[9px] text-gray-600 dark:text-gray-400">
                  انتخاب سریع:
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[9px] h-7"
                    onClick={() => {
                      if (!selectedSegmentId) return;
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? { ...s, target_min_age: 18, target_max_age: 30 }
                            : s
                        )
                      );
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: 18,
                        target_max_age: 30,
                      });
                    }}
                  >
                    18-30
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[9px] h-7"
                    onClick={() => {
                      if (!selectedSegmentId) return;
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? { ...s, target_min_age: 31, target_max_age: 45 }
                            : s
                        )
                      );
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: 31,
                        target_max_age: 45,
                      });
                    }}
                  >
                    31-45
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[9px] h-7"
                    onClick={() => {
                      if (!selectedSegmentId) return;
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? { ...s, target_min_age: 46, target_max_age: 65 }
                            : s
                        )
                      );
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: 46,
                        target_max_age: 65,
                      });
                    }}
                  >
                    46-65
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[9px] h-7"
                    onClick={() => {
                      if (!selectedSegmentId) return;
                      const minAge = defaultFilterData?.min_age || 15;
                      const maxAge = defaultFilterData?.max_age || 80;
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? {
                                ...s,
                                target_min_age: minAge,
                                target_max_age: maxAge,
                              }
                            : s
                        )
                      );
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                  >
                    همه سنین
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center space-x-2 space-x-reverse bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300">
                    {currentMinAge} تا {currentMaxAge} سال
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderGeneralFilterSettings = () => {
    switch (generalFilterType) {
      case "location":
        return (
          <div className="space-y-4">
            <h4 className="font-medium">محل سکونت</h4>

            {/* Province Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium">استان:</label>
              {provincesLoading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <Select
                  value={selectedProvince?.toString() || ""}
                  onValueChange={(value) => {
                    const provinceId = parseInt(value);
                    setSelectedProvince(provinceId);
                    setCities([]);
                    fetchCities(provinceId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب استان" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem
                        key={province.id}
                        value={province.id.toString()}
                      >
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Cities Selection */}
            {selectedProvince && (
              <div className="space-y-2">
                <label className="text-[10px] font-medium">شهر:</label>
                {citiesLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        انتخاب شهر
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault(); // جلوگیری از بسته شدن منو
                        }}
                        className="font-medium text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-700"
                        onClick={() => {
                          if (!selectedSegmentId) return;
                          // Select all cities from this province
                          const allCitiesInProvince = cities.map(
                            (city) => city.id
                          );
                          const currentCities =
                            tempSelectedCities[selectedSegmentId] ||
                            selectedSegment?.target_city ||
                            [];
                          const citiesNotInList = allCitiesInProvince.filter(
                            (cityId) => !currentCities.includes(cityId)
                          );
                          const updated = [
                            ...currentCities,
                            ...citiesNotInList,
                          ];
                          setTempSelectedCities((prev) => ({
                            ...prev,
                            [selectedSegmentId]: updated,
                          }));
                        }}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            checked={(() => {
                              const currentCities =
                                tempSelectedCities[selectedSegmentId] ||
                                selectedSegment?.target_city ||
                                [];
                              const allCitiesInProvince = cities.map(
                                (city) => city.id
                              );
                              return (
                                allCitiesInProvince.length > 0 &&
                                allCitiesInProvince.every((cityId) =>
                                  currentCities.includes(cityId)
                                )
                              );
                            })()}
                            onCheckedChange={() => {}} // خالی چون onClick مدیریت می‌کند
                          />
                          <span>همه شهرها ({cities.length} شهر)</span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Individual Cities */}
                      {cities.map((city) => (
                        <DropdownMenuItem
                          key={city.id}
                          onSelect={(e) => {
                            e.preventDefault(); // جلوگیری از بسته شدن منو
                          }}
                          onClick={() => {
                            if (!selectedSegmentId) return;
                            const currentCities =
                              tempSelectedCities[selectedSegmentId] ||
                              selectedSegment?.target_city ||
                              [];
                            const isSelected = currentCities.includes(city.id);
                            const updated = isSelected
                              ? currentCities.filter((id) => id !== city.id)
                              : [...currentCities, city.id];
                            setTempSelectedCities((prev) => ({
                              ...prev,
                              [selectedSegmentId]: updated,
                            }));
                          }}
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              checked={(() => {
                                const currentCities =
                                  tempSelectedCities[selectedSegmentId] ||
                                  selectedSegment?.target_city ||
                                  [];
                                return currentCities.includes(city.id);
                              })()}
                              onCheckedChange={() => {}} // خالی چون onClick مدیریت می‌کند
                            />
                            <span>{city.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Currently Selected Cities Display */}
            {selectedSegmentId &&
              (() => {
                const currentCities =
                  tempSelectedCities[selectedSegmentId] ||
                  selectedSegment?.target_city ||
                  [];
                return currentCities.length > 0;
              })() && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-gray-800 dark:text-gray-200">
                      شهرهای انتخاب شده (
                      {(() => {
                        const currentCities =
                          tempSelectedCities[selectedSegmentId] ||
                          selectedSegment?.target_city ||
                          [];
                        return currentCities.length;
                      })()}{" "}
                      شهر):
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      disabled={
                        segmentOperationLoading || filterOperationLoading
                      }
                      onClick={() => {
                        if (
                          !selectedSegmentId ||
                          segmentOperationLoading ||
                          filterOperationLoading
                        )
                          return;
                        setTempSelectedCities((prev) => ({
                          ...prev,
                          [selectedSegmentId]: [],
                        }));
                      }}
                    >
                      پاک کردن همه
                    </Button>
                  </div>

                  {(() => {
                    const cityDetails = segmentCityDetails[selectedSegmentId];
                    if (!cityDetails || !cityDetails.target_city_name)
                      return null;

                    const { target_city_name, target_all_cities_province } =
                      cityDetails;

                    // Use temp selected cities if available, otherwise use segment data
                    const currentSelectedCityIds =
                      tempSelectedCities[selectedSegmentId] ||
                      selectedSegment?.target_city ||
                      [];

                    // Filter city details based on currently selected cities
                    const filteredCityNames = target_city_name.filter((city) =>
                      currentSelectedCityIds.includes(city.id)
                    );

                    // Get IDs of provinces that have ALL cities selected
                    const completeProvinceIds = target_all_cities_province
                      ? target_all_cities_province.map((p) => p.id)
                      : [];

                    // Filter out cities that belong to complete provinces
                    const partialCityNames = filteredCityNames.filter(
                      (city) => !completeProvinceIds.includes(city.province)
                    );

                    // Group remaining cities by province
                    const citiesByProvince: Record<
                      string,
                      { name: string; cities: { id: number; name: string }[] }
                    > = {};
                    partialCityNames.forEach((city) => {
                      if (!citiesByProvince[city.province.toString()]) {
                        citiesByProvince[city.province.toString()] = {
                          name: city.province_name,
                          cities: [],
                        };
                      }
                      citiesByProvince[city.province.toString()].cities.push({
                        id: city.id,
                        name: city.name,
                      });
                    });

                    return (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {/* نمایش استان‌های کامل */}
                        {target_all_cities_province &&
                          target_all_cities_province.length > 0 &&
                          target_all_cities_province.map((province) => (
                            <div
                              key={`complete-${province.id}`}
                              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-[9px] text-white">
                                      ✓
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-medium text-green-800 dark:text-green-300">
                                    همه شهرهای {province.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  disabled={
                                    segmentOperationLoading ||
                                    filterOperationLoading
                                  }
                                  onClick={() => {
                                    if (
                                      !selectedSegmentId ||
                                      segmentOperationLoading ||
                                      filterOperationLoading
                                    )
                                      return;
                                    // Remove all cities from this province
                                    const provinceCityIds = target_city_name
                                      .filter(
                                        (city) => city.province === province.id
                                      )
                                      .map((city) => city.id);
                                    const currentCities =
                                      tempSelectedCities[selectedSegmentId] ||
                                      selectedSegment.target_city ||
                                      [];
                                    const updatedCities = currentCities.filter(
                                      (cityId) =>
                                        !provinceCityIds.includes(cityId)
                                    );
                                    setTempSelectedCities((prev) => ({
                                      ...prev,
                                      [selectedSegmentId]: updatedCities,
                                    }));
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-[9px] text-green-700 dark:text-green-400">
                                تمام شهرهای این استان انتخاب شده‌اند
                              </p>
                            </div>
                          ))}

                        {/* نمایش شهرهای جزئی از استان‌های دیگر */}
                        {Object.entries(citiesByProvince).map(
                          ([provinceId, provinceData]) => (
                            <div
                              key={`partial-${provinceId}`}
                              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-medium text-blue-800 dark:text-blue-300">
                                  {provinceData.name} (
                                  {provinceData.cities.length} شهر)
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  disabled={
                                    segmentOperationLoading ||
                                    filterOperationLoading
                                  }
                                  onClick={() => {
                                    if (
                                      !selectedSegmentId ||
                                      segmentOperationLoading ||
                                      filterOperationLoading
                                    )
                                      return;
                                    // Remove all cities from this province
                                    const provinceCityIds =
                                      provinceData.cities.map(
                                        (city) => city.id
                                      );
                                    const currentCities =
                                      tempSelectedCities[selectedSegmentId] ||
                                      selectedSegment.target_city ||
                                      [];
                                    const updatedCities = currentCities.filter(
                                      (cityId) =>
                                        !provinceCityIds.includes(cityId)
                                    );
                                    setTempSelectedCities((prev) => ({
                                      ...prev,
                                      [selectedSegmentId]: updatedCities,
                                    }));
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {provinceData.cities.map((city) => (
                                  <div
                                    key={city.id}
                                    className="inline-flex items-center bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-full px-2 py-1 text-[9px]"
                                  >
                                    <span className="text-gray-700 dark:text-gray-300 ml-1">
                                      {city.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                      disabled={
                                        segmentOperationLoading ||
                                        filterOperationLoading
                                      }
                                      onClick={() => {
                                        if (
                                          !selectedSegmentId ||
                                          segmentOperationLoading ||
                                          filterOperationLoading
                                        )
                                          return;
                                        const currentCities =
                                          tempSelectedCities[
                                            selectedSegmentId
                                          ] ||
                                          selectedSegment.target_city ||
                                          [];
                                        const updatedCities =
                                          currentCities.filter(
                                            (id) => id !== city.id
                                          );
                                        setTempSelectedCities((prev) => ({
                                          ...prev,
                                          [selectedSegmentId]: updatedCities,
                                        }));
                                      }}
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}

                  {/* Save Button for City Changes */}
                  {selectedSegmentId &&
                    hasUnsavedCityChanges(selectedSegmentId) && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-yellow-800 dark:text-yellow-300">
                            تغییرات ذخیره نشده‌ای دارید
                          </span>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-3 text-[9px] text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                              disabled={filterOperationLoading}
                              onClick={() => {
                                if (!selectedSegmentId) return;
                                // Reset to original cities
                                setTempSelectedCities((prev) => {
                                  const newState = { ...prev };
                                  delete newState[selectedSegmentId];
                                  return newState;
                                });
                              }}
                            >
                              لغو
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-[9px] bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={filterOperationLoading}
                              onClick={() => {
                                if (!selectedSegmentId) return;
                                saveCityChanges(selectedSegmentId);
                              }}
                            >
                              {filterOperationLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              ) : null}
                              ذخیره تغییرات
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}
          </div>
        );

      case "gender":
        const isMaleChecked =
          selectedSegment?.target_gender === "M" ||
          selectedSegment?.target_gender === null;
        const isFemaleChecked =
          selectedSegment?.target_gender === "F" ||
          selectedSegment?.target_gender === null;

        return (
          <div className="space-y-4">
            <h4 className="font-medium">جنسیت</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={isMaleChecked}
                  onCheckedChange={(checked) => {
                    if (!selectedSegmentId) return;

                    let newGender: "M" | "F" | null = null;
                    if (checked && isFemaleChecked) {
                      // Both selected
                      newGender = null;
                    } else if (checked && !isFemaleChecked) {
                      // Only male selected
                      newGender = "M";
                    } else if (!checked && isFemaleChecked) {
                      // Only female selected
                      newGender = "F";
                    } else {
                      // Neither selected, default to both
                      newGender = null;
                    }

                    // Update both local state and API immediately for gender selection
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_gender: newGender }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_gender: newGender,
                    });
                  }}
                />
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-[10px]">مرد</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={isFemaleChecked}
                  onCheckedChange={(checked) => {
                    if (!selectedSegmentId) return;

                    let newGender: "M" | "F" | null = null;
                    if (checked && isMaleChecked) {
                      // Both selected
                      newGender = null;
                    } else if (checked && !isMaleChecked) {
                      // Only female selected
                      newGender = "F";
                    } else if (!checked && isMaleChecked) {
                      // Only male selected
                      newGender = "M";
                    } else {
                      // Neither selected, default to both
                      newGender = null;
                    }

                    // Update both local state and API immediately for gender selection
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_gender: newGender }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_gender: newGender,
                    });
                  }}
                />
                <UserCheck className="w-4 h-4 text-pink-500" />
                <span className="text-[10px]">زن</span>
              </div>
            </div>
          </div>
        );

      case "age":
        const currentMinAge = selectedSegment?.target_min_age || 18;
        const currentMaxAge = selectedSegment?.target_max_age || 65;
        const currentAgeRange: [number, number] = [
          currentMinAge,
          currentMaxAge,
        ];

        return (
          <div className="space-y-4">
            <h4 className="font-medium">سن</h4>
            <div className="space-y-4">
              {/* Input fields for precise control */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-600">حداقل سن</label>
                  <Input
                    type="number"
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    value={currentMinAge}
                    onChange={(e) => {
                      if (!selectedSegmentId) return;
                      const minAge = Math.max(
                        parseInt(e.target.value) ||
                          defaultFilterData?.min_age ||
                          15,
                        defaultFilterData?.min_age || 15
                      );
                      const maxAge = Math.max(minAge, currentMaxAge);
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? {
                                ...s,
                                target_min_age: minAge,
                                target_max_age: maxAge,
                              }
                            : s
                        )
                      );
                    }}
                    onBlur={(e) => {
                      if (!selectedSegmentId) return;
                      const minAge = Math.max(
                        parseInt(e.target.value) ||
                          defaultFilterData?.min_age ||
                          15,
                        defaultFilterData?.min_age || 15
                      );
                      const maxAge = Math.max(minAge, currentMaxAge);
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && selectedSegmentId) {
                        const minAge = Math.max(
                          parseInt(e.currentTarget.value) ||
                            defaultFilterData?.min_age ||
                            15,
                          defaultFilterData?.min_age || 15
                        );
                        const maxAge = Math.max(minAge, currentMaxAge);
                        updateSegmentApi(selectedSegmentId, {
                          target_min_age: minAge,
                          target_max_age: maxAge,
                        });
                        e.currentTarget.blur();
                      }
                    }}
                    className="text-[10px] h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-600">حداکثر سن</label>
                  <Input
                    type="number"
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    value={currentMaxAge}
                    onChange={(e) => {
                      if (!selectedSegmentId) return;
                      const maxAge = Math.min(
                        parseInt(e.target.value) ||
                          defaultFilterData?.max_age ||
                          80,
                        defaultFilterData?.max_age || 80
                      );
                      const minAge = Math.min(currentMinAge, maxAge);
                      setSegments(
                        segments.map((s) =>
                          s.id === selectedSegmentId
                            ? {
                                ...s,
                                target_min_age: minAge,
                                target_max_age: maxAge,
                              }
                            : s
                        )
                      );
                    }}
                    onBlur={(e) => {
                      if (!selectedSegmentId) return;
                      const maxAge = Math.min(
                        parseInt(e.target.value) ||
                          defaultFilterData?.max_age ||
                          80,
                        defaultFilterData?.max_age || 80
                      );
                      const minAge = Math.min(currentMinAge, maxAge);
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && selectedSegmentId) {
                        const maxAge = Math.min(
                          parseInt(e.currentTarget.value) ||
                            defaultFilterData?.max_age ||
                            80,
                          defaultFilterData?.max_age || 80
                        );
                        const minAge = Math.min(currentMinAge, maxAge);
                        updateSegmentApi(selectedSegmentId, {
                          target_min_age: minAge,
                          target_max_age: maxAge,
                        });
                        e.currentTarget.blur();
                      }
                    }}
                    className="text-[10px] h-8"
                  />
                </div>
              </div>

              {/* Display current range */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 space-x-reverse bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-medium text-blue-700">
                    {currentMinAge} تا {currentMaxAge} سال
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <Slider
                  value={currentAgeRange}
                  onValueChange={(value) => {
                    if (
                      !selectedSegmentId ||
                      !Array.isArray(value) ||
                      value.length !== 2
                    )
                      return;
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? {
                              ...s,
                              target_min_age: value[0],
                              target_max_age: value[1],
                            }
                          : s
                      )
                    );
                  }}
                  onValueCommit={(value) => {
                    if (
                      !selectedSegmentId ||
                      !Array.isArray(value) ||
                      value.length !== 2
                    )
                      return;
                    updateSegmentApi(selectedSegmentId, {
                      target_min_age: value[0],
                      target_max_age: value[1],
                    });
                  }}
                  min={defaultFilterData?.min_age || 15}
                  max={defaultFilterData?.max_age || 80}
                  step={1}
                  dir="rtl"
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>{defaultFilterData?.min_age || 15} سال</span>
                  <span>{defaultFilterData?.max_age || 80} سال</span>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[9px] h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    // Update both local state and API immediately for preset buttons
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_min_age: 18, target_max_age: 30 }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_min_age: 18,
                      target_max_age: 30,
                    });
                  }}
                >
                  18-30
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[9px] h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_min_age: 31, target_max_age: 45 }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_min_age: 31,
                      target_max_age: 45,
                    });
                  }}
                >
                  31-45
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[9px] h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? { ...s, target_min_age: 46, target_max_age: 65 }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_min_age: 46,
                      target_max_age: 65,
                    });
                  }}
                >
                  46-65
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[9px] h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    const minAge = defaultFilterData?.min_age || 15;
                    const maxAge = defaultFilterData?.max_age || 80;
                    setSegments(
                      segments.map((s) =>
                        s.id === selectedSegmentId
                          ? {
                              ...s,
                              target_min_age: minAge,
                              target_max_age: maxAge,
                            }
                          : s
                      )
                    );
                    updateSegmentApi(selectedSegmentId, {
                      target_min_age: minAge,
                      target_max_age: maxAge,
                    });
                  }}
                >
                  همه سنین
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFilterSettings = () => {
    // Handle general filters
    if (generalFilterType) {
      return renderGeneralFilterSettings();
    }

    // Handle API filters
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
        <h4 className="font-medium text-[10px]">{filterLabel.title}</h4>
        <div className="space-y-2">
          {filterLabel.metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Checkbox
                checked={selectedMetrics.includes(metric.id)}
                onCheckedChange={(checked) => {
                  if (!selectedSegmentId) return;

                  const updated = checked
                    ? [...selectedMetrics, metric.id]
                    : selectedMetrics.filter((id: number) => id !== metric.id);

                  setSelectedMetrics(updated);

                  // Save only the clicked metric to API
                  if (checked) {
                    saveSegmentMetric(selectedSegmentId, metric.id);
                  }

                  // Update segment filters as well for local state
                  updateSegmentFilter(selectedSegmentId, filterIdStr, updated);
                }}
              />
              <span className="text-[10px]">{metric.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get filter label by ID
  const getFilterLabel = (filterId: string) => {
    // Handle general filters
    switch (filterId) {
      case "location":
        return "محل سکونت";
      case "gender":
        return "جنسیت";
      case "age":
        return "سن";
    }

    // Handle API filters
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

  // Check if a general filter is applied for the selected segment only
  const isGeneralFilterApplied = (filterType: string) => {
    if (!selectedSegmentId) return false;

    const selectedSegment = segments.find(
      (segment) => segment.id === selectedSegmentId
    );
    if (!selectedSegment) return false;

    switch (filterType) {
      case "location":
        const currentSelectedCities =
          tempSelectedCities[selectedSegmentId] ||
          selectedSegment.target_city ||
          [];
        return currentSelectedCities.length > 0;
      case "gender":
        return selectedSegment.target_gender !== null;
      case "age":
        return (
          selectedSegment.target_min_age !==
            (defaultFilterData?.min_age || 18) ||
          selectedSegment.target_max_age !== (defaultFilterData?.max_age || 65)
        );
      default:
        return false;
    }
  };

  // Check if there are unsaved changes for cities
  const hasUnsavedCityChanges = (segmentId: string) => {
    if (!tempSelectedCities[segmentId]) return false;
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return false;

    const currentCities = segment.target_city || [];
    const tempCities = tempSelectedCities[segmentId] || [];

    return (
      JSON.stringify(currentCities.sort()) !== JSON.stringify(tempCities.sort())
    );
  };

  // Save city changes to API
  const saveCityChanges = async (segmentId: string) => {
    if (!tempSelectedCities[segmentId]) return;

    try {
      setFilterOperationLoading(true);
      const cityIds = tempSelectedCities[segmentId];

      // Update segment in API
      await updateSegmentApi(segmentId, {
        target_city: cityIds,
      });

      // Clear temp state for this segment
      setTempSelectedCities((prev) => {
        const newState = { ...prev };
        delete newState[segmentId];
        return newState;
      });
    } catch (error) {
      console.error("Error saving city changes:", error);
      toast.error("خطا در ذخیره تغییرات شهرها");
    } finally {
      setFilterOperationLoading(false);
    }
  };

  // Helper function to get current selected cities for display
  const getCurrentSelectedCities = (segmentId: string) => {
    const tempCities = tempSelectedCities[segmentId];
    const segment = segments.find((s) => s.id === segmentId);
    return tempCities || segment?.target_city || [];
  };

  // Check if an API filter has any selected metrics for the selected segment only
  const isApiFilterApplied = (labelId: number) => {
    if (!selectedSegmentId) return false;

    const selectedSegmentMetrics = segmentMetrics[selectedSegmentId] || [];
    return selectedSegmentMetrics.some((metricId) => {
      // Find if this metric belongs to this label
      const filterLabel = filterCategories
        .flatMap((cat) => cat.labels)
        .find((label) => label.id === labelId);
      return filterLabel?.metrics.some((metric) => metric.id === metricId);
    });
  };

  // Check if a category has any selected metrics for the selected segment only
  const isCategoryApplied = (categoryId: number) => {
    if (!selectedSegmentId) return false;

    const category = filterCategories.find((cat) => cat.id === categoryId);
    if (!category) return false;

    return category.labels.some((label) => isApiFilterApplied(label.id));
  };

  // Format selected cities for display
  const formatSelectedCities = (segmentId: string) => {
    const cityDetails = segmentCityDetails[segmentId];
    if (
      !cityDetails ||
      !cityDetails.target_city_name ||
      cityDetails.target_city_name.length === 0
    ) {
      return null;
    }

    const { target_city_name, target_all_cities_province } = cityDetails;

    // Check if all cities of some provinces are selected
    if (target_all_cities_province && target_all_cities_province.length > 0) {
      if (target_all_cities_province.length === 1) {
        return `همه شهرهای ${target_all_cities_province[0].name}`;
      } else {
        const provinceNames = target_all_cities_province
          .map((p) => p.name)
          .join("، ");
        return `همه شهرهای ${provinceNames}`;
      }
    }

    // Group cities by province
    const citiesByProvince: Record<string, string[]> = {};
    target_city_name.forEach((city) => {
      if (!citiesByProvince[city.province_name]) {
        citiesByProvince[city.province_name] = [];
      }
      citiesByProvince[city.province_name].push(city.name);
    });

    const provinces = Object.keys(citiesByProvince);

    if (provinces.length === 1) {
      // All cities are from one province
      const provinceName = provinces[0];
      const cities = citiesByProvince[provinceName];

      if (cities.length <= 3) {
        return `${provinceName}: ${cities.join("، ")}`;
      } else {
        return `${provinceName}: ${cities.slice(0, 3).join("، ")} و ${
          cities.length - 3
        } شهر دیگر`;
      }
    } else {
      // Cities from multiple provinces
      const parts: string[] = [];
      provinces.forEach((provinceName) => {
        const cities = citiesByProvince[provinceName];
        if (cities.length === 1) {
          parts.push(`${provinceName}: ${cities[0]}`);
        } else if (cities.length <= 2) {
          parts.push(`${provinceName}: ${cities.join("، ")}`);
        } else {
          parts.push(
            `${provinceName}: ${cities.slice(0, 2).join("، ")} و ${
              cities.length - 2
            } شهر دیگر`
          );
        }
      });

      if (parts.length <= 2) {
        return parts.join(" | ");
      } else {
        return `${parts.slice(0, 2).join(" | ")} و ${
          parts.length - 2
        } استان دیگر`;
      }
    }
  };

  // Get short description of selected cities
  const getSelectedCitiesShortDescription = (segmentId: string) => {
    const cityDetails = segmentCityDetails[segmentId];
    if (
      !cityDetails ||
      !cityDetails.target_city_name ||
      cityDetails.target_city_name.length === 0
    ) {
      return null;
    }

    const { target_city_name, target_all_cities_province } = cityDetails;

    if (target_all_cities_province && target_all_cities_province.length > 0) {
      if (target_all_cities_province.length === 1) {
        return `همه شهرهای ${target_all_cities_province[0].name}`;
      } else {
        return `همه شهرهای ${target_all_cities_province.length} استان`;
      }
    }

    const cityCount = target_city_name.length;
    const provinces = [
      ...new Set(target_city_name.map((city) => city.province_name)),
    ];

    if (provinces.length === 1) {
      return `${cityCount} شهر از ${provinces[0]}`;
    } else {
      return `${cityCount} شهر از ${provinces.length} استان`;
    }
  };

  // همه فیلترهای اعمال‌شده روی سگمنت را گردآوری می‌کند
  const getAllAppliedFilters = (
    segmentId: string
  ): { type: string; key: string; label: string; value: string }[] => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return [];

    const list: { type: string; key: string; label: string; value: string }[] =
      [];

    // جنسیت
    if (segment.target_gender !== null) {
      list.push({
        type: "gender",
        key: "gender",
        label: "جنسیت",
        value: segment.target_gender === "M" ? "مرد" : "زن",
      });
    }

    // سن
    if (
      segment.target_min_age !== (defaultFilterData?.min_age || 18) ||
      segment.target_max_age !== (defaultFilterData?.max_age || 65)
    ) {
      list.push({
        type: "age",
        key: "age",
        label: "محدوده سنی",
        value: `${segment.target_min_age} تا ${segment.target_max_age} سال`,
      });
    }

    // شهر
    if (segment.target_city && segment.target_city.length > 0) {
      // Use temp selected cities if available, otherwise use segment data
      const currentSelectedCityIds =
        tempSelectedCities[segmentId] || segment.target_city;

      let desc = "";
      const cityDetails = segmentCityDetails[segmentId];

      if (cityDetails && cityDetails.target_city_name) {
        const { target_city_name, target_all_cities_province } = cityDetails;

        // Get IDs of provinces that have ALL cities selected
        const completeProvinceIds = target_all_cities_province
          ? target_all_cities_province.map((p) => p.id)
          : [];

        if (completeProvinceIds.length > 0) {
          // Show complete provinces
          const completeProvinceNames = target_all_cities_province
            ? target_all_cities_province.map((p) => p.name)
            : [];

          // Filter out cities that belong to complete provinces
          const partialCityNames = target_city_name.filter(
            (city) =>
              currentSelectedCityIds.includes(city.id) &&
              !completeProvinceIds.includes(city.province)
          );

          const parts = [];
          if (completeProvinceNames.length > 0) {
            parts.push(`همه شهرهای ${completeProvinceNames.join(", ")}`);
          }
          if (partialCityNames.length > 0) {
            if (partialCityNames.length <= 3) {
              parts.push(partialCityNames.map((c) => c.name).join(", "));
            } else {
              parts.push(
                `${partialCityNames
                  .slice(0, 2)
                  .map((c) => c.name)
                  .join(", ")} و ${partialCityNames.length - 2} شهر دیگر`
              );
            }
          }
          desc = parts.join(" + ");
        } else {
          // No complete provinces, just show individual cities
          const selectedCityNames = target_city_name
            .filter((city) => currentSelectedCityIds.includes(city.id))
            .map((city) => city.name);

          if (selectedCityNames.length <= 3) {
            desc = selectedCityNames.join(", ");
          } else {
            desc = `${selectedCityNames.slice(0, 2).join(", ")} و ${
              selectedCityNames.length - 2
            } شهر دیگر`;
          }
        }
      } else {
        // Fallback if city details are not available
        desc = `${currentSelectedCityIds.length} شهر انتخاب شده`;
      }

      if (desc) {
        list.push({
          type: "location",
          key: "city",
          label: "شهرها",
          value: desc,
        });
      }
    }

    // فیلترهای تخصصی
    const currentSegmentMetrics = segmentMetrics[segmentId] || [];
    if (currentSegmentMetrics.length > 0) {
      const grouped: Record<string, string[]> = {};
      currentSegmentMetrics.forEach((metricId) => {
        filterCategories.forEach((cat) => {
          cat.labels.forEach((label) => {
            const metric = label.metrics.find((m) => m.id === metricId);
            if (metric) {
              if (!grouped[label.title]) grouped[label.title] = [];
              grouped[label.title].push(metric.title);
            }
          });
        });
      });

      Object.entries(grouped).forEach(([lbl, mArr]) => {
        list.push({
          type: "metric",
          key: lbl,
          label: lbl,
          value: mArr.length > 0 ? mArr.join(", ") : "انتخاب نشده",
        });
      });
    }

    return list;
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
      fetchSegments();
      fetchSegmentInvoice(); // Fetch invoice data on initial load
    }
    setLoading(false);
  }, [id, accessToken, navigate]);

  // Fetch details for all segments when segments are loaded
  useEffect(() => {
    if (segments.length > 0) {
      segments.forEach((segment) => {
        fetchSegmentDetails(segment.id);
      });
    }
  }, [segments.length]);

  // Auto-expand only general filter categories when they are loaded
  useEffect(() => {
    if (filterCategories.length > 0) {
      setExpandedCategories((prev) => {
        // Only expand general filters, not API filters
        const newExpanded = [...new Set([...prev, "general"])];
        return newExpanded;
      });
    }
  }, [filterCategories]);

  // Navigation functions
  const prevStep = () => {
    if (isAdTest) {
      navigate(`/adtest/${id}/questions`);
    } else {
      navigate(`/questionnaire/${id}`);
    }
  };

  const nextStep = () => {
    if (isAdTest) {
      navigate(`/adtest/${id}/results`);
    } else {
      navigate(`/questionnaire/${id}/results`);
    }
  };

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
    }
  };

  useEffect(() => {
    if (!selectedSegmentId) return;
    // اگر هنوز هیچ فیلتری برای نمایش انتخاب نشده است، اولین فیلتر اعمالشده را بهطور خودکار فعال کن
    if (generalFilterType || selectedFilterForSettings) return;

    const filters = getAllAppliedFilters(selectedSegmentId);
    if (filters.length === 0) return;

    const first = filters[0];
    if (first.type === "metric") {
      let lblId: number | null = null;
      filterCategories.forEach((cat) => {
        cat.labels.forEach((lbl) => {
          if (lbl.title === first.key) lblId = lbl.id;
        });
      });
      if (lblId) setSelectedFilterForSettings(lblId);
    } else {
      setGeneralFilterType(first.type);
    }
  }, [
    selectedSegmentId,
    segments,
    segmentMetrics,
    filterCategories,
    tempSelectedCities,
    segmentCityDetails,
  ]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col  relative"
      dir="rtl"
    >
      {/* Loading Overlay - فقط برای عملیات کلی */}
      {segmentsLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              در حال بارگذاری اولیه...
            </p>
          </div>
        </div>
      )}
      <FormHeader
        formTitle={questionnaire?.title || formTitle}
        setFormTitle={setFormTitle}
        steps={
          id
            ? isAdTest
              ? [
                  { id: 1, title: "تعیین محتوا", path: `/adtest/${id}` },
                  {
                    id: 2,
                    title: "سوالات",
                    path: `/adtest/${id}/questions`,
                  },
                  {
                    id: 3,
                    title: "انتخاب مخاطب",
                    path: `/adtest/${id}/audience`,
                  },
                  {
                    id: 4,
                    title: "گزارش نتایج",
                    path: `/adtest/${id}/results`,
                  },
                ]
              : [
                  {
                    id: 1,
                    title: "طراحی نظرسنجی",
                    path: `/questionnaire/${id}`,
                  },
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
        backPath={
          id ? (isAdTest ? `/adtest/${id}` : `/questionnaire/${id}`) : "/"
        }
      />

      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* Fixed Segments Sidebar */}
        <div className="w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 h-[calc(100vh-64px)] fixed top-16 right-0 flex flex-col shadow-xl">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                سگمنت‌های هدف
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              تعریف و مدیریت مخاطبان هدف پروژه
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {segmentsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  در حال بارگذاری سگمنت‌ها...
                </p>
              </div>
            ) : segments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Target className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ایجاد اولین سگمنت
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-48 mx-auto">
                  برای شروع تحلیل مخاطبان، سگمنت اول خود را تعریف کنید
                </p>
                <Button
                  onClick={addSegment}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"
                  size="sm"
                  disabled={segmentOperationLoading}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  ایجاد سگمنت جدید
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      selectedSegmentId === segment.id
                        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-lg shadow-blue-500/10"
                        : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:shadow-md bg-white/50 dark:bg-gray-800/30"
                    }`}
                    onClick={() => {
                      setSelectedSegmentId(segment.id);
                      // Update selectedMetrics for the newly selected segment
                      const segmentMetricsForId =
                        segmentMetrics[segment.id] || [];
                      setSelectedMetrics(segmentMetricsForId);
                      // Clear current filter selection when switching segments
                      setSelectedFilterForSettings(null);
                      setGeneralFilterType(null);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        سگمنت{" "}
                        {segments.findIndex((s) => s.id === segment.id) + 1}
                      </h3>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSegment(segment);
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </Button>
                        {segments.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSegment(segment.id);
                            }}
                          >
                            <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Response Count Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          تعداد پاسخ‌دهنده
                        </label>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {segment.user_limit.toLocaleString()} نفر
                        </span>
                      </div>
                      <Slider
                        value={[segment.user_limit]}
                        onValueChange={(value) => {
                          const maxValue = Math.min(
                            value[0],
                            defaultFilterData?.count_of_selectable_user || 5000
                          );
                          setSegments(
                            segments.map((s) =>
                              s.id === segment.id
                                ? { ...s, user_limit: maxValue }
                                : s
                            )
                          );
                        }}
                        onValueCommit={(value) => {
                          const maxValue = Math.min(
                            value[0],
                            defaultFilterData?.count_of_selectable_user || 5000
                          );
                          updateSegmentApi(segment.id, {
                            user_limit: maxValue,
                          });
                        }}
                        min={1}
                        max={defaultFilterData?.count_of_active_user || 5000}
                        step={1}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        min="1"
                        max={
                          defaultFilterData?.count_of_selectable_user || 5000
                        }
                        value={segment.user_limit}
                        onChange={(e) => {
                          const newValue = Math.min(
                            parseInt(e.target.value) || 1,
                            defaultFilterData?.count_of_selectable_user || 5000
                          );
                          setSegments(
                            segments.map((s) =>
                              s.id === segment.id
                                ? { ...s, user_limit: newValue }
                                : s
                            )
                          );
                        }}
                        onBlur={(e) => {
                          const newValue = Math.min(
                            parseInt(e.target.value) || 1,
                            defaultFilterData?.count_of_selectable_user || 5000
                          );
                          updateSegmentApi(segment.id, {
                            user_limit: newValue,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const newValue = Math.min(
                              parseInt(e.currentTarget.value) || 1,
                              defaultFilterData?.count_of_selectable_user ||
                                5000
                            );
                            updateSegmentApi(segment.id, {
                              user_limit: newValue,
                            });
                            e.currentTarget.blur();
                          }
                        }}
                        className="text-sm h-9 border-gray-200 dark:border-gray-600 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {segment.possible === false && (
                      <div className="flex items-center space-x-1 space-x-reverse mt-1.5 text-red-600">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span className="text-xs">غیرممکن</span>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  onClick={addSegment}
                  variant="outline"
                  className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 h-12 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  size="sm"
                  disabled={segmentOperationLoading}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن سگمنت جدید
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content with margin for fixed sidebar */}
        <div className="flex-1 mr-96 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-4">
              {/* Column 1: Filter Categories and Filters */}
              <div className="col-span-4">
                <Card className="rounded-2xl shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="pb-4 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                        فیلترهای هدفمندی
                      </CardTitle>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      تعریف ویژگی‌های مخاطبان هدف
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 p-6 pt-0">
                    {filtersLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          در حال بارگذاری فیلترها...
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* General Filters Section - Always show */}
                        <Collapsible
                          open={expandedCategories.includes("general")}
                          onOpenChange={() => {
                            if (
                              segmentDetailsLoading ||
                              filterOperationLoading ||
                              segmentOperationLoading
                            )
                              return;
                            setExpandedCategories((prev) =>
                              prev.includes("general")
                                ? prev.filter((id) => id !== "general")
                                : [...prev, "general"]
                            );
                          }}
                        >
                          <CollapsibleTrigger
                            className="w-full"
                            disabled={
                              segmentDetailsLoading ||
                              filterOperationLoading ||
                              segmentOperationLoading
                            }
                          >
                            <div
                              className={`p-2 rounded-xl border transition-all duration-200 ${
                                segmentDetailsLoading ||
                                filterOperationLoading ||
                                segmentOperationLoading
                                  ? "border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed"
                                  : isGeneralFilterApplied("location") ||
                                    isGeneralFilterApplied("gender") ||
                                    isGeneralFilterApplied("age")
                                  ? "border-blue-200/60 dark:border-blue-600/50 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm"
                                  : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 bg-white/50 dark:bg-gray-800/50 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      isGeneralFilterApplied("location") ||
                                      isGeneralFilterApplied("gender") ||
                                      isGeneralFilterApplied("age")
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-900 dark:text-white"
                                    }`}
                                  >
                                    فیلترهای عمومی
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  {(isGeneralFilterApplied("location") ||
                                    isGeneralFilterApplied("gender") ||
                                    isGeneralFilterApplied("age")) && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                  {expandedCategories.includes("general") ? (
                                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="space-y-1 mt-2 mr-4">
                              <div
                                className={`p-2 rounded-lg transition-all duration-200 border ${
                                  segmentDetailsLoading ||
                                  filterOperationLoading ||
                                  segmentOperationLoading
                                    ? "border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed"
                                    : generalFilterType === "location"
                                    ? "border-indigo-300 bg-gradient-to-r from-indigo-100 to-indigo-200/50 dark:from-indigo-900/40 dark:to-indigo-800/30 dark:border-indigo-500 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-700/50 cursor-pointer"
                                    : isGeneralFilterApplied("location")
                                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-sm cursor-pointer"
                                    : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (
                                    segmentDetailsLoading ||
                                    filterOperationLoading ||
                                    segmentOperationLoading
                                  )
                                    return;
                                  selectFilter("location");
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <div
                                      className={`w-4 h-4 rounded-lg flex items-center justify-center ${
                                        generalFilterType === "location"
                                          ? "bg-indigo-600"
                                          : isGeneralFilterApplied("location")
                                          ? "bg-green-500"
                                          : "bg-green-100 dark:bg-green-900/30"
                                      }`}
                                    >
                                      <MapPin
                                        className={`w-3 h-3 ${
                                          generalFilterType === "location" ||
                                          isGeneralFilterApplied("location")
                                            ? "text-white"
                                            : "text-green-600 dark:text-green-400"
                                        }`}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-medium ${
                                        generalFilterType === "location"
                                          ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                                          : isGeneralFilterApplied("location")
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      محل سکونت
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    {generalFilterType === "location" && (
                                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                                    )}
                                    {isGeneralFilterApplied("location") &&
                                      generalFilterType !== "location" && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`p-2 rounded-lg transition-all duration-200 border ${
                                  segmentDetailsLoading ||
                                  filterOperationLoading ||
                                  segmentOperationLoading
                                    ? "border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed"
                                    : generalFilterType === "gender"
                                    ? "border-indigo-300 bg-gradient-to-r from-indigo-100 to-indigo-200/50 dark:from-indigo-900/40 dark:to-indigo-800/30 dark:border-indigo-500 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-700/50 cursor-pointer"
                                    : isGeneralFilterApplied("gender")
                                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-sm cursor-pointer"
                                    : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (
                                    segmentDetailsLoading ||
                                    filterOperationLoading ||
                                    segmentOperationLoading
                                  )
                                    return;
                                  selectFilter("gender");
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <div
                                      className={`w-4 h-4 rounded-lg flex items-center justify-center ${
                                        generalFilterType === "gender"
                                          ? "bg-indigo-600"
                                          : isGeneralFilterApplied("gender")
                                          ? "bg-purple-500"
                                          : "bg-purple-100 dark:bg-purple-900/30"
                                      }`}
                                    >
                                      <Users
                                        className={`w-3 h-3 ${
                                          generalFilterType === "gender" ||
                                          isGeneralFilterApplied("gender")
                                            ? "text-white"
                                            : "text-purple-600 dark:text-purple-400"
                                        }`}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-medium ${
                                        generalFilterType === "gender"
                                          ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                                          : isGeneralFilterApplied("gender")
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      جنسیت
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    {generalFilterType === "gender" && (
                                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                                    )}
                                    {isGeneralFilterApplied("gender") &&
                                      generalFilterType !== "gender" && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`p-2 rounded-lg transition-all duration-200 border ${
                                  segmentDetailsLoading ||
                                  filterOperationLoading ||
                                  segmentOperationLoading
                                    ? "border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed"
                                    : generalFilterType === "age"
                                    ? "border-indigo-300 bg-gradient-to-r from-indigo-100 to-indigo-200/50 dark:from-indigo-900/40 dark:to-indigo-800/30 dark:border-indigo-500 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-700/50 cursor-pointer"
                                    : isGeneralFilterApplied("age")
                                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-sm cursor-pointer"
                                    : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (
                                    segmentDetailsLoading ||
                                    filterOperationLoading ||
                                    segmentOperationLoading
                                  )
                                    return;
                                  selectFilter("age");
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <div
                                      className={`w-4 h-4 rounded-lg flex items-center justify-center ${
                                        generalFilterType === "age"
                                          ? "bg-indigo-600"
                                          : isGeneralFilterApplied("age")
                                          ? "bg-orange-500"
                                          : "bg-orange-100 dark:bg-orange-900/30"
                                      }`}
                                    >
                                      <Target
                                        className={`w-3 h-3 ${
                                          generalFilterType === "age" ||
                                          isGeneralFilterApplied("age")
                                            ? "text-white"
                                            : "text-orange-600 dark:text-orange-400"
                                        }`}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-medium ${
                                        generalFilterType === "age"
                                          ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                                          : isGeneralFilterApplied("age")
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      سن
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    {generalFilterType === "age" && (
                                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                                    )}
                                    {isGeneralFilterApplied("age") &&
                                      generalFilterType !== "age" && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* API Filters Sections - Always show all categories */}
                        {filterCategories.map((category) => (
                          <Collapsible
                            key={category.id}
                            open={expandedCategories.includes(
                              category.id.toString()
                            )}
                            onOpenChange={() => {
                              if (
                                segmentDetailsLoading ||
                                filterOperationLoading ||
                                segmentOperationLoading
                              )
                                return;
                              toggleCategory(category.id);
                            }}
                          >
                            <CollapsibleTrigger
                              className="w-full"
                              disabled={
                                segmentDetailsLoading ||
                                filterOperationLoading ||
                                segmentOperationLoading
                              }
                            >
                              <div
                                className={`p-2 rounded-lg border transition-colors ${
                                  segmentDetailsLoading ||
                                  filterOperationLoading ||
                                  segmentOperationLoading
                                    ? "border-gray-200/30 dark:border-gray-600/30 bg-gray-50/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed"
                                    : isCategoryApplied(category.id)
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <img
                                      src={category.icon}
                                      alt=""
                                      className="w-4 h-4"
                                    />
                                    <span
                                      className={`text-[10px] font-medium ${
                                        isCategoryApplied(category.id)
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      {category.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    {isCategoryApplied(category.id) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                    {expandedCategories.includes(
                                      category.id.toString()
                                    ) ? (
                                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-1 mt-2 mr-4">
                                {category.labels?.map((label) => {
                                  // Check if any of this label's metrics are selected for the current segment
                                  const hasSelectedMetrics =
                                    selectedSegmentId &&
                                    label.metrics.some((metric) =>
                                      (
                                        segmentMetrics[selectedSegmentId] || []
                                      ).includes(metric.id)
                                    );

                                  const isCurrentlySelected =
                                    selectedFilterForSettings === label.id;

                                  return (
                                    <div
                                      key={label.id}
                                      className={`p-2 rounded-lg transition-colors border ${
                                        segmentDetailsLoading ||
                                        filterOperationLoading ||
                                        segmentOperationLoading
                                          ? "border-gray-200/30 dark:border-gray-600/30 bg-gray-50/50 dark:bg-gray-800/30 opacity-50 cursor-not-allowed"
                                          : isCurrentlySelected
                                          ? "border-indigo-300 bg-gradient-to-r from-indigo-100 to-indigo-200/50 dark:from-indigo-900/40 dark:to-indigo-800/30 dark:border-indigo-500 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-700/50 cursor-pointer"
                                          : hasSelectedMetrics
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 cursor-pointer"
                                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                      }`}
                                      onClick={() => {
                                        if (
                                          segmentDetailsLoading ||
                                          filterOperationLoading ||
                                          segmentOperationLoading
                                        )
                                          return;
                                        selectFilter(label.id);
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span
                                          className={`text-xs ${
                                            isCurrentlySelected
                                              ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                                              : hasSelectedMetrics
                                              ? "text-blue-700 dark:text-blue-300 font-medium"
                                              : "text-gray-900 dark:text-white"
                                          }`}
                                        >
                                          {label.title}
                                        </span>
                                        <div className="flex items-center space-x-1 space-x-reverse">
                                          {isCurrentlySelected && (
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                                          )}
                                          {hasSelectedMetrics &&
                                            !isCurrentlySelected && (
                                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Column 2: Filter Settings */}
              <div className="col-span-4">
                <Card className="rounded-2xl shadow-lg sticky top-20 max-h-[calc(100vh-100px)] flex flex-col overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="pb-4 flex-shrink-0 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        تنظیمات پیشرفته
                      </CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      تنظیم دقیق پارامترهای انتخاب شده
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 overflow-y-auto flex-1 p-6 pt-0">
                    {!selectedSegmentId ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Settings className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs">
                          برای تنظیم فیلترها، ابتدا یک سگمنت انتخاب کنید
                        </p>
                      </div>
                    ) : !selectedFilterForSettings && !generalFilterType ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                        <p className="text-xs">
                          برای تنظیم فیلترها، یک فیلتر از فهرست انتخاب کنید
                        </p>
                      </div>
                    ) : (
                      (() => {
                        // Recalculate applied filters each render to ensure they're up to date
                        let appliedFilters =
                          getAllAppliedFilters(selectedSegmentId);

                        // اگر فیلتری در حال ویرایش است ولی هنوز ذخیره نشده، آن را نیز به لیست کارت‌ها اضافه کن
                        if (selectedFilterForSettings) {
                          const editingLabel = filterCategories
                            .flatMap((cat) => cat.labels)
                            .find(
                              (lbl) => lbl.id === selectedFilterForSettings
                            );

                          if (
                            editingLabel &&
                            !appliedFilters.some(
                              (f) => f.key === editingLabel.title
                            )
                          ) {
                            appliedFilters.push({
                              type: "metric",
                              key: editingLabel.title,
                              label: editingLabel.title,
                              value: "",
                            });
                          }
                        }

                        if (
                          generalFilterType &&
                          !appliedFilters.some(
                            (f) => f.type === generalFilterType
                          )
                        ) {
                          appliedFilters.push({
                            type: generalFilterType,
                            key: generalFilterType,
                            label: getFilterLabel(generalFilterType),
                            value: "",
                          });
                        }

                        if (appliedFilters.length === 0) {
                          return (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                              <p className="text-xs">
                                هیچ فیلتری اعمال نشده است
                              </p>
                            </div>
                          );
                        }

                        // اگر هیچ فیلتر انتخاب نشده بود، اولین را انتخاب کنیم
                        if (!selectedFilterForSettings && !generalFilterType) {
                          const first = appliedFilters[0];
                          if (first.type === "metric") {
                            let id: number | null = null;
                            filterCategories.forEach((cat) => {
                              cat.labels.forEach((lbl) => {
                                if (lbl.title === first.key) id = lbl.id;
                              });
                            });
                            if (id) setSelectedFilterForSettings(id);
                          } else {
                            setGeneralFilterType(first.type);
                          }
                        }

                        const activeLabel = generalFilterType
                          ? getFilterLabel(generalFilterType)
                          : getFilterLabel(
                              selectedFilterForSettings?.toString() || ""
                            );

                        return (
                          <div className="space-y-2">
                            {appliedFilters.map((flt) => {
                              const isActive =
                                (flt.type === "metric" &&
                                  flt.label === activeLabel) ||
                                (flt.type !== "metric" &&
                                  flt.type === generalFilterType);

                              return (
                                <div
                                  key={`flt-${flt.key}`}
                                  className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                                    isActive
                                      ? "bg-blue-50 dark:bg-blue-900/20"
                                      : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  }`}
                                  onClick={() => {
                                    if (
                                      flt.type === "gender" ||
                                      flt.type === "age" ||
                                      flt.type === "location"
                                    ) {
                                      setGeneralFilterType(flt.type);
                                      setSelectedFilterForSettings(null);
                                    } else {
                                      let lblId: number | null = null;
                                      filterCategories.forEach((cat) => {
                                        cat.labels.forEach((lbl) => {
                                          if (lbl.title === flt.key)
                                            lblId = lbl.id;
                                        });
                                      });
                                      if (lblId)
                                        setSelectedFilterForSettings(lblId);
                                      setGeneralFilterType(null);
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-[10px] text-gray-900 dark:text-white">
                                      {flt.label}
                                    </span>
                                    {isActive && (
                                      <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-300 mb-2">
                                    {flt.value}
                                  </p>

                                  <div className="border-t pt-3 mt-2 border-dashed border-blue-200 dark:border-blue-600 relative">
                                    {(segmentOperationLoading ||
                                      filterOperationLoading) && (
                                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                                        <div className="flex items-center gap-2">
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                          <span className="text-xs text-gray-600 dark:text-gray-400">
                                            در حال ذخیره...
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {(() => {
                                      // Render settings for this specific filter
                                      if (
                                        flt.type === "gender" ||
                                        flt.type === "age" ||
                                        flt.type === "location"
                                      ) {
                                        // For general filters, use the dedicated function
                                        return renderGeneralFilterSettingsForType(
                                          flt.type
                                        );
                                      } else {
                                        // For API filters, find the filter and render its settings
                                        let filterLabelId: number | null = null;
                                        filterCategories.forEach((cat) => {
                                          cat.labels.forEach((lbl) => {
                                            if (lbl.title === flt.key)
                                              filterLabelId = lbl.id;
                                          });
                                        });

                                        if (filterLabelId) {
                                          const filterLabel = filterCategories
                                            .flatMap(
                                              (category) => category.labels
                                            )
                                            .find(
                                              (label) =>
                                                label.id === filterLabelId
                                            );

                                          if (filterLabel) {
                                            const filterIdStr =
                                              filterLabelId.toString();
                                            const currentSelectedMetrics =
                                              segmentMetrics[
                                                selectedSegmentId
                                              ] || [];

                                            return (
                                              <div className="space-y-4">
                                                <h4 className="font-medium text-[10px]">
                                                  {filterLabel.title}
                                                </h4>
                                                <div className="space-y-2">
                                                  {filterLabel.metrics.map(
                                                    (metric) => (
                                                      <div
                                                        key={metric.id}
                                                        className="flex items-center space-x-2 space-x-reverse"
                                                      >
                                                        <Checkbox
                                                          checked={currentSelectedMetrics.includes(
                                                            metric.id
                                                          )}
                                                          onCheckedChange={(
                                                            checked
                                                          ) => {
                                                            if (
                                                              !selectedSegmentId
                                                            )
                                                              return;

                                                            const updated =
                                                              checked
                                                                ? [
                                                                    ...currentSelectedMetrics,
                                                                    metric.id,
                                                                  ]
                                                                : currentSelectedMetrics.filter(
                                                                    (
                                                                      id: number
                                                                    ) =>
                                                                      id !==
                                                                      metric.id
                                                                  );

                                                            setSegmentMetrics(
                                                              (prev) => ({
                                                                ...prev,
                                                                [selectedSegmentId]:
                                                                  updated,
                                                              })
                                                            );

                                                            // Save or remove the clicked metric to/from API
                                                            if (checked) {
                                                              saveSegmentMetric(
                                                                selectedSegmentId,
                                                                metric.id
                                                              );
                                                            } else {
                                                              // Remove metric from API when unchecked
                                                              removeSegmentMetric(
                                                                selectedSegmentId,
                                                                metric.id
                                                              );
                                                            }

                                                            // Update segment filters as well for local state
                                                            updateSegmentFilter(
                                                              selectedSegmentId,
                                                              filterIdStr,
                                                              updated
                                                            );
                                                          }}
                                                        />
                                                        <span className="text-[10px]">
                                                          {metric.title}
                                                        </span>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          }
                                        }
                                        return null;
                                      }
                                    })()}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Column 3: Summary */}
              <div className="col-span-4">
                <Card className="rounded-2xl shadow-xl sticky top-24 h-[calc(100vh-120px)] flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="pb-2 flex-shrink-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Target className="w-3 h-3 text-white" />
                      </div>
                      <CardTitle className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                        خلاصه پروژه
                      </CardTitle>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      جزئیات هزینه و مخاطبان
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col min-h-0 p-4 pt-0">
                    <div className="text-center flex-shrink-0 p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      {summaryLoading ? (
                        <div className="py-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-1"></div>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            در حال بروزرسانی...
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                            {totalRespondents.toLocaleString()}
                          </div>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            کل پاسخ‌دهنده هدف
                          </div>
                        </>
                      )}
                    </div>

                    {/* Create a flex container for equal height sections */}
                    <div className="flex-1 min-h-0 flex flex-col gap-2">
                      {/* Restaurant-style itemization */}
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex-1 min-h-0 flex flex-col">
                        <h4 className="font-medium text-xs mb-1 flex-shrink-0 text-gray-900 dark:text-white">
                          جزئیات محاسبه:
                        </h4>
                        {summaryLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              در حال محاسبه هزینه‌ها...
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-y-auto flex-1 min-h-0 space-y-2">
                            {segments.map((segment, index) => {
                              const invoiceSegment = invoiceData?.[index]; // Assume array order matches segments order
                              const isExpanded =
                                expandedSegmentDetails.includes(segment.id);

                              return (
                                <Collapsible
                                  key={segment.id}
                                  open={isExpanded}
                                  onOpenChange={() =>
                                    toggleSegmentDetails(segment.id)
                                  }
                                >
                                  <CollapsibleTrigger className="w-full">
                                    <div className="flex justify-between items-center text-xs bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 p-3 rounded-lg transition-all duration-200 shadow-sm">
                                      <div className="flex items-center space-x-2 space-x-reverse">
                                        {isExpanded ? (
                                          <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                                        )}
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                          سگمنت {index + 1}
                                        </span>
                                      </div>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {segment.user_limit} ×{" "}
                                        {invoiceSegment?.cost_of_each_person?.toLocaleString() ||
                                          0}{" "}
                                        ={" "}
                                        {invoiceSegment?.cost_of_all_persons?.toLocaleString() ||
                                          0}{" "}
                                        تومان
                                      </span>
                                    </div>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent>
                                    {invoiceSegment && (
                                      <div className="mr-5 mt-0 pt-3 space-y-1.5 text-xs bg-white dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-600 rounded-b-lg p-3">
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                          <span>هزینه هر پاسخ:</span>
                                          <span>
                                            {invoiceSegment.cost_of_each_person.toLocaleString()}{" "}
                                            تومان
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                          <span>هزینه پایه:</span>
                                          <span>
                                            {invoiceSegment.base_price.toLocaleString()}{" "}
                                            تومان
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                          <span>
                                            هزینه فیلترهای انتخاب شده:
                                          </span>
                                          <span>
                                            {invoiceSegment.cost_of_filters.toLocaleString()}{" "}
                                            تومان
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                          <span>هزینه زمان پاسخگویی:</span>
                                          <span>
                                            {invoiceSegment.cost_of_answer_time.toLocaleString()}{" "}
                                            تومان
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                          <span>مالیات بر ارزش افزوده:</span>
                                          <span>
                                            {invoiceSegment.cost_of_tax.toLocaleString()}{" "}
                                            تومان
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Applied Filters Summary - Scrollable Section */}
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex-1 min-h-0 flex flex-col">
                        <h4 className="font-medium text-xs mb-1 flex-shrink-0 text-gray-900 dark:text-white">
                          فیلترهای اعمال شده:
                        </h4>
                        <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                          {segments.map((segment, index) => (
                            <div key={segment.id} className="space-y-1">
                              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                سگمنت {index + 1}:
                              </div>

                              {/* Gender Filter */}
                              {segment.target_gender && (
                                <div className="text-xs mr-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    جنسیت:
                                  </span>{" "}
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {segment.target_gender === "M"
                                      ? "مرد"
                                      : "زن"}
                                  </span>
                                </div>
                              )}

                              {/* Age Filter */}
                              {(segment.target_min_age !==
                                (defaultFilterData?.min_age || 18) ||
                                segment.target_max_age !==
                                  (defaultFilterData?.max_age || 65)) && (
                                <div className="text-xs mr-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    سن:
                                  </span>{" "}
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {segment.target_min_age} تا{" "}
                                    {segment.target_max_age} سال
                                  </span>
                                </div>
                              )}

                              {/* Cities Filter */}
                              {segment.target_city &&
                                segment.target_city.length > 0 && (
                                  <div className="text-xs mr-2 space-y-1">
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        شهرها:
                                      </span>{" "}
                                      <span className="text-gray-600 dark:text-gray-300">
                                        {getSelectedCitiesShortDescription(
                                          segment.id
                                        ) ||
                                          `${segment.target_city.length} شهر انتخاب شده`}
                                      </span>
                                    </div>
                                    {/* Detailed cities information */}
                                    {formatSelectedCities(segment.id) && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mr-2 leading-relaxed">
                                        {formatSelectedCities(segment.id)}
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* API Filters */}
                              {segmentMetrics[segment.id] &&
                                segmentMetrics[segment.id].length > 0 && (
                                  <div className="text-xs mr-2 space-y-1">
                                    <span className="font-medium text-gray-900 dark:text-white block">
                                      فیلترهای تخصصی:
                                    </span>
                                    {(() => {
                                      // Group metrics by their labels
                                      const metricsByLabel: Record<
                                        string,
                                        string[]
                                      > = {};
                                      segmentMetrics[segment.id].forEach(
                                        (metricId) => {
                                          filterCategories.forEach((cat) => {
                                            cat.labels.forEach((label) => {
                                              const metric = label.metrics.find(
                                                (m) => m.id === metricId
                                              );
                                              if (metric) {
                                                if (
                                                  !metricsByLabel[label.title]
                                                ) {
                                                  metricsByLabel[label.title] =
                                                    [];
                                                }
                                                metricsByLabel[
                                                  label.title
                                                ].push(metric.title);
                                              }
                                            });
                                          });
                                        }
                                      );

                                      return Object.entries(metricsByLabel).map(
                                        ([labelTitle, metrics]) => (
                                          <div
                                            key={labelTitle}
                                            className="mr-2"
                                          >
                                            <span className="font-medium text-gray-900 dark:text-white">
                                              {labelTitle}:
                                            </span>{" "}
                                            <span className="text-gray-600 dark:text-gray-300">
                                              {metrics.join(", ")}
                                            </span>
                                          </div>
                                        )
                                      );
                                    })()}
                                  </div>
                                )}

                              {/* Empty state for this segment */}
                              {segment.target_gender === null &&
                                segment.target_min_age ===
                                  (defaultFilterData?.min_age || 18) &&
                                segment.target_max_age ===
                                  (defaultFilterData?.max_age || 65) &&
                                (!segment.target_city ||
                                  segment.target_city.length === 0) &&
                                (!segmentMetrics[segment.id] ||
                                  segmentMetrics[segment.id].length === 0) && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mr-2">
                                    هیچ فیلتری اعمال نشده (همه مخاطبان)
                                  </div>
                                )}
                            </div>
                          ))}

                          {segments.length === 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                              هیچ سگمنتی وجود ندارد
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex-shrink-0">
                      {summaryLoading ? (
                        <div className="text-center py-1 mb-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                        </div>
                      ) : (
                        invoiceData && (
                          <div className="space-y-1 mb-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600 dark:text-gray-300">
                                مجموع هزینه:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {totalCost.toLocaleString()} تومان
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600 dark:text-gray-300">
                                مالیات بر ارزش افزوده:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {totalTax.toLocaleString()} تومان
                              </span>
                            </div>
                          </div>
                        )
                      )}

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          کل هزینه:
                        </span>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {summaryLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400 inline-block"></div>
                          ) : (
                            `${grandTotal.toLocaleString()} تومان`
                          )}
                        </span>
                      </div>

                      {segments.some((s) => s.estimatedTime) && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 dark:text-gray-300">
                            زمان تخمینی:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            2-3 روز کاری
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200/50 dark:border-gray-600/50 pt-3 flex-shrink-0">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 h-10 rounded-lg text-sm"
                        disabled={
                          !allSegmentsPossible ||
                          grandTotal === 0 ||
                          summaryLoading ||
                          segmentOperationLoading ||
                          filterOperationLoading
                        }
                        size="default"
                      >
                        {summaryLoading ||
                        segmentOperationLoading ||
                        filterOperationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            در حال پردازش...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 ml-2" />
                            تأیید و پرداخت
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={prevStep}
          variant="outline"
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-200 px-6 py-3"
          size="lg"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          مرحله قبل
        </Button>
      </div>
    </div>
  );
};

export default Audience;
