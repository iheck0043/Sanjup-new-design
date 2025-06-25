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
  user_limit: number;
  target_gender: 'M' | 'F' | null;
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
    target_gender: 'M' | 'F' | null;
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
  target_gender?: 'M' | 'F' | null;
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
    target_gender: 'M' | 'F' | null;
    target_min_age: number;
    target_max_age: number;
    target_city: number[];
    target_city_name: {
      id: number;
      name: string;
      province: number;
      province_name: string;
    }[];
    target_all_cities_province: any[];
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
  const { accessToken } = useAuth();

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("بدون عنوان");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>(
    []
  );
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [selectedFilterForSettings, setSelectedFilterForSettings] = useState<
    number | null
  >(null);

  // General filters state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [generalFilterType, setGeneralFilterType] = useState<string | null>(null);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  const [defaultFilterData, setDefaultFilterData] = useState<DefaultFilterData | null>(null);
  const [segmentMetrics, setSegmentMetrics] = useState<Record<string, number[]>>({});
  const [invoiceData, setInvoiceData] = useState<SegmentInvoiceItem[] | null>(null);
  const [expandedSegmentDetails, setExpandedSegmentDetails] = useState<string[]>([]);

  // Fetch segments from API
  const fetchSegments = async () => {
    if (!id || id === "new") return;
    
    try {
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
        const mappedSegments: Segment[] = data.data.map(segment => ({
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
    }
  };

  // Create new segment
  const createSegment = async () => {
    if (!id || id === "new") return;

    try {
      const requestData = {
        user_limit: 100,
      };

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/create/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    }
  };

  // Update segment
  const updateSegmentApi = async (segmentId: string, updates: Partial<CreateSegmentRequest>) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
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
        setSegments(prev => prev.map(segment => 
          segment.id === segmentId 
            ? { ...segment, ...updates, count: updates.user_limit || segment.count }
            : segment
        ));
        
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
    }
  };

  // Fetch single segment details
  const fetchSegmentDetails = async (segmentId: string) => {
    try {
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
        setSegments(prev => prev.map(segment => 
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
        ));

        // Fetch segment labels/metrics
        const labelsResponse = await fetch(
          `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}/label`,
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
            const metricIds = labelsData.data.map(item => item.label_metric);
            
            // Store metrics for this specific segment
            setSegmentMetrics(prev => ({
              ...prev,
              [segmentId]: metricIds
            }));
            
            // Update selectedMetrics only if this is the currently selected segment
            if (segmentId === selectedSegmentId) {
              setSelectedMetrics(metricIds);
            }
            
            console.log("Selected Metrics for segment", segmentId, ":", metricIds);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching segment details:", error);
      toast.error("خطا در دریافت جزئیات سگمنت");
    }
  };

  // Delete segment
  const deleteSegment = async (segmentId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}`,
        {
          method: 'DELETE',
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
        const updatedSegments = segments.filter(s => s.id !== segmentId);
        setSegments(updatedSegments);
        
        // Update selected segment if needed
        if (selectedSegmentId === segmentId) {
          setSelectedSegmentId(updatedSegments.length > 0 ? updatedSegments[0].id : null);
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

  const selectedSegment = selectedSegmentId ? segments.find((s) => s.id === selectedSegmentId) : null;

  // Calculate total cost from invoice data
  const totalCost = invoiceData?.reduce((sum, item) => sum + item.cost_of_all_persons, 0) || 0;
  const totalTax = invoiceData?.reduce((sum, item) => sum + item.cost_of_tax, 0) || 0;
  const grandTotal = invoiceData?.reduce((sum, item) => sum + item.total_cost, 0) || 0;
  
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
    if (updates.user_limit !== undefined) apiUpdates.user_limit = updates.user_limit;
    if (updates.target_gender !== undefined) apiUpdates.target_gender = updates.target_gender;
    if (updates.target_min_age !== undefined) apiUpdates.target_min_age = updates.target_min_age;
    if (updates.target_max_age !== undefined) apiUpdates.target_max_age = updates.target_max_age;
    if (updates.target_city !== undefined) apiUpdates.target_city = updates.target_city;
    
    // Call API if there are valid updates
    if (Object.keys(apiUpdates).length > 0) {
      updateSegmentApi(id, apiUpdates);
    }
  };

  // Fetch segment invoice/pricing
  const fetchSegmentInvoice = async () => {
    if (!id || id === "new") return;
    
    try {
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
    }
  };

  // Save single metric to API
  const saveSegmentMetric = async (segmentId: string, metricId: number) => {
    try {
      const requestData = {
        label_metric: metricId
      };
      
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/segment/${segmentId}/label/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

  const renderGeneralFilterSettings = () => {
    switch (generalFilterType) {
      case "location":
        return (
          <div className="space-y-4">
            <h4 className="font-medium">محل سکونت</h4>
            
            {/* Province Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">استان:</label>
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
                      <SelectItem key={province.id} value={province.id.toString()}>
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
                <label className="text-sm font-medium">شهر:</label>
                {citiesLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cities.map((city) => (
                      <div
                        key={city.id}
                        className="flex items-center space-x-2 space-x-reverse"
                      >
                        <Checkbox
                          checked={selectedSegment?.target_city?.includes(city.id) || false}
                          onCheckedChange={(checked) => {
                            if (!selectedSegmentId) return;
                            const currentCities = selectedSegment?.target_city || [];
                            const updated = checked
                              ? [...currentCities, city.id]
                              : currentCities.filter((id) => id !== city.id);
                            // Update both local state and API immediately for city selection
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_city: updated } 
                        : s
                    ));
                    updateSegmentApi(selectedSegmentId, { target_city: updated });
                          }}
                        />
                        <span className="text-sm">{city.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "gender":
        const isMaleChecked = selectedSegment?.target_gender === 'M' || selectedSegment?.target_gender === null;
        const isFemaleChecked = selectedSegment?.target_gender === 'F' || selectedSegment?.target_gender === null;
        
        return (
          <div className="space-y-4">
            <h4 className="font-medium">جنسیت</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={isMaleChecked}
                  onCheckedChange={(checked) => {
                    if (!selectedSegmentId) return;
                    
                    let newGender: 'M' | 'F' | null = null;
                    if (checked && isFemaleChecked) {
                      // Both selected
                      newGender = null;
                    } else if (checked && !isFemaleChecked) {
                      // Only male selected
                      newGender = 'M';
                    } else if (!checked && isFemaleChecked) {
                      // Only female selected
                      newGender = 'F';
                    } else {
                      // Neither selected, default to both
                      newGender = null;
                    }
                    
                    // Update both local state and API immediately for gender selection
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_gender: newGender } 
                        : s
                    ));
                    updateSegmentApi(selectedSegmentId, { target_gender: newGender });
                  }}
                />
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-sm">مرد</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  checked={isFemaleChecked}
                  onCheckedChange={(checked) => {
                    if (!selectedSegmentId) return;
                    
                    let newGender: 'M' | 'F' | null = null;
                    if (checked && isMaleChecked) {
                      // Both selected
                      newGender = null;
                    } else if (checked && !isMaleChecked) {
                      // Only female selected
                      newGender = 'F';
                    } else if (!checked && isMaleChecked) {
                      // Only male selected
                      newGender = 'M';
                    } else {
                      // Neither selected, default to both
                      newGender = null;
                    }
                    
                    // Update both local state and API immediately for gender selection
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_gender: newGender } 
                        : s
                    ));
                    updateSegmentApi(selectedSegmentId, { target_gender: newGender });
                  }}
                />
                <UserCheck className="w-4 h-4 text-pink-500" />
                <span className="text-sm">زن</span>
              </div>
            </div>
          </div>
        );

      case "age":
        const currentMinAge = selectedSegment?.target_min_age || 18;
        const currentMaxAge = selectedSegment?.target_max_age || 65;
        const currentAgeRange: [number, number] = [currentMinAge, currentMaxAge];
        
        return (
          <div className="space-y-4">
            <h4 className="font-medium">سن</h4>
            <div className="space-y-4">
              {/* Input fields for precise control */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">حداقل سن</label>
                  <Input
                    type="number"
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    value={currentMinAge}
                    onChange={(e) => {
                      if (!selectedSegmentId) return;
                      const minAge = Math.max(
                        parseInt(e.target.value) || defaultFilterData?.min_age || 15,
                        defaultFilterData?.min_age || 15
                      );
                      const maxAge = Math.max(minAge, currentMaxAge);
                      setSegments(segments.map((s) => 
                        s.id === selectedSegmentId 
                          ? { ...s, target_min_age: minAge, target_max_age: maxAge } 
                          : s
                      ));
                    }}
                    onBlur={(e) => {
                      if (!selectedSegmentId) return;
                      const minAge = Math.max(
                        parseInt(e.target.value) || defaultFilterData?.min_age || 15,
                        defaultFilterData?.min_age || 15
                      );
                      const maxAge = Math.max(minAge, currentMaxAge);
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && selectedSegmentId) {
                        const minAge = Math.max(
                          parseInt(e.currentTarget.value) || defaultFilterData?.min_age || 15,
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
                    className="text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">حداکثر سن</label>
                  <Input
                    type="number"
                    min={defaultFilterData?.min_age || 15}
                    max={defaultFilterData?.max_age || 80}
                    value={currentMaxAge}
                    onChange={(e) => {
                      if (!selectedSegmentId) return;
                      const maxAge = Math.min(
                        parseInt(e.target.value) || defaultFilterData?.max_age || 80,
                        defaultFilterData?.max_age || 80
                      );
                      const minAge = Math.min(currentMinAge, maxAge);
                      setSegments(segments.map((s) => 
                        s.id === selectedSegmentId 
                          ? { ...s, target_min_age: minAge, target_max_age: maxAge } 
                          : s
                      ));
                    }}
                    onBlur={(e) => {
                      if (!selectedSegmentId) return;
                      const maxAge = Math.min(
                        parseInt(e.target.value) || defaultFilterData?.max_age || 80,
                        defaultFilterData?.max_age || 80
                      );
                      const minAge = Math.min(currentMinAge, maxAge);
                      updateSegmentApi(selectedSegmentId, {
                        target_min_age: minAge,
                        target_max_age: maxAge,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && selectedSegmentId) {
                        const maxAge = Math.min(
                          parseInt(e.currentTarget.value) || defaultFilterData?.max_age || 80,
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
                    className="text-sm h-8"
                  />
                </div>
              </div>

              {/* Display current range */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 space-x-reverse bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-700">
                    {currentMinAge} تا {currentMaxAge} سال
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <Slider
                  value={currentAgeRange}
                  onValueChange={(value) => {
                    if (!selectedSegmentId || !Array.isArray(value) || value.length !== 2) return;
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_min_age: value[0], target_max_age: value[1] } 
                        : s
                    ));
                  }}
                  onValueCommit={(value) => {
                    if (!selectedSegmentId || !Array.isArray(value) || value.length !== 2) return;
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
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{defaultFilterData?.min_age || 15} سال</span>
                  <span>{defaultFilterData?.max_age || 80} سال</span>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    // Update both local state and API immediately for preset buttons
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_min_age: 18, target_max_age: 30 } 
                        : s
                    ));
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
                  className="text-xs h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_min_age: 31, target_max_age: 45 } 
                        : s
                    ));
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
                  className="text-xs h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_min_age: 46, target_max_age: 65 } 
                        : s
                    ));
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
                  className="text-xs h-7"
                  onClick={() => {
                    if (!selectedSegmentId) return;
                    const minAge = defaultFilterData?.min_age || 15;
                    const maxAge = defaultFilterData?.max_age || 80;
                    setSegments(segments.map((s) => 
                      s.id === selectedSegmentId 
                        ? { ...s, target_min_age: minAge, target_max_age: maxAge } 
                        : s
                    ));
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
        <h4 className="font-medium">{filterLabel.title}</h4>
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
              <span className="text-sm">{metric.title}</span>
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

  // Check if a general filter is applied for any segment
  const isGeneralFilterApplied = (filterType: string) => {
    return segments.some(segment => {
      switch (filterType) {
        case "location":
          return segment.target_city && segment.target_city.length > 0;
        case "gender":
          return segment.target_gender !== null;
        case "age":
          return segment.target_min_age !== (defaultFilterData?.min_age || 18) || 
                 segment.target_max_age !== (defaultFilterData?.max_age || 65);
        default:
          return false;
      }
    });
  };

  // Check if an API filter has any selected metrics across segments
  const isApiFilterApplied = (labelId: number) => {
    return Object.values(segmentMetrics).some(metrics => 
      metrics.some(metricId => {
        // Find if this metric belongs to this label
        const filterLabel = filterCategories
          .flatMap(cat => cat.labels)
          .find(label => label.id === labelId);
        return filterLabel?.metrics.some(metric => metric.id === metricId);
      })
    );
  };

  // Check if a category has any selected metrics across segments
  const isCategoryApplied = (categoryId: number) => {
    const category = filterCategories.find(cat => cat.id === categoryId);
    if (!category) return false;
    
    return category.labels.some(label => isApiFilterApplied(label.id));
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
    } else {
      setLoading(false);
    }
  }, [id, accessToken, navigate]);

  // Fetch details for all segments when segments are loaded
  useEffect(() => {
    if (segments.length > 0) {
      segments.forEach(segment => {
        fetchSegmentDetails(segment.id);
      });
    }
  }, [segments.length]);

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex flex-col font-['Vazirmatn']"
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

      <div className="flex flex-1 h-[calc(100vh-64px)] mt-16">
        {/* Fixed Segments Sidebar */}
        <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 h-[calc(100vh-64px)] fixed top-16 right-0 flex flex-col shadow-xl">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                سگمنت‌های هدف
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">تعریف و مدیریت مخاطبان هدف پروژه</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {segments.length === 0 ? (
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
                    const segmentMetricsForId = segmentMetrics[segment.id] || [];
                    setSelectedMetrics(segmentMetricsForId);
                  }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        سگمنت {segments.findIndex(s => s.id === segment.id) + 1}
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
                          const maxValue = Math.min(value[0], defaultFilterData?.count_of_selectable_user || 5000);
                          setSegments(segments.map((s) => 
                            s.id === segment.id ? { ...s, user_limit: maxValue } : s
                          ));
                        }}
                        onValueCommit={(value) => {
                          const maxValue = Math.min(value[0], defaultFilterData?.count_of_selectable_user || 5000);
                          updateSegmentApi(segment.id, { user_limit: maxValue });
                        }}
                        min={1}
                        max={defaultFilterData?.count_of_active_user || 5000}
                        step={1}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        min="1"
                        max={defaultFilterData?.count_of_selectable_user || 5000}
                        value={segment.user_limit}
                        onChange={(e) => {
                          const newValue = Math.min(
                            parseInt(e.target.value) || 1,
                            defaultFilterData?.count_of_selectable_user || 5000
                          );
                          setSegments(segments.map((s) => 
                            s.id === segment.id ? { ...s, user_limit: newValue } : s
                          ));
                        }}
                        onBlur={(e) => {
                          const newValue = Math.min(
                            parseInt(e.target.value) || 1,
                            defaultFilterData?.count_of_selectable_user || 5000
                          );
                          updateSegmentApi(segment.id, { user_limit: newValue });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newValue = Math.min(
                              parseInt(e.currentTarget.value) || 1,
                              defaultFilterData?.count_of_selectable_user || 5000
                            );
                            updateSegmentApi(segment.id, { user_limit: newValue });
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
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن سگمنت جدید
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content with margin for fixed sidebar */}
        <div className="flex-1 mr-80 p-4">
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
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">فیلترهای هدفمندی</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">تعریف ویژگی‌های مخاطبان هدف</p>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 pt-0">
                    {filtersLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        {/* General Filters Section */}
                        <Collapsible
                          open={expandedCategories.includes("general")}
                          onOpenChange={() => {
                            setExpandedCategories(prev =>
                              prev.includes("general")
                                ? prev.filter(id => id !== "general")
                                : [...prev, "general"]
                            );
                          }}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 transition-all duration-200 bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 hover:shadow-md">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    فیلترهای عمومی
                                  </span>
                                </div>
                                {expandedCategories.includes("general") ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="space-y-2 mt-3 mr-4">
                              <div
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                  isGeneralFilterApplied("location")
                                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-sm"
                                    : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                                onClick={() => selectFilter("location")}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                      isGeneralFilterApplied("location")
                                        ? "bg-green-500"
                                        : "bg-green-100 dark:bg-green-900/30"
                                    }`}>
                                      <MapPin className={`w-3 h-3 ${
                                        isGeneralFilterApplied("location")
                                          ? "text-white"
                                          : "text-green-600 dark:text-green-400"
                                      }`} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                      isGeneralFilterApplied("location")
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-900 dark:text-white"
                                    }`}>محل سکونت</span>
                                  </div>
                                  {isGeneralFilterApplied("location") && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                  isGeneralFilterApplied("gender")
                                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-sm"
                                    : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                                onClick={() => selectFilter("gender")}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                      isGeneralFilterApplied("gender")
                                        ? "bg-purple-500"
                                        : "bg-purple-100 dark:bg-purple-900/30"
                                    }`}>
                                      <Users className={`w-3 h-3 ${
                                        isGeneralFilterApplied("gender")
                                          ? "text-white"
                                          : "text-purple-600 dark:text-purple-400"
                                      }`} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                      isGeneralFilterApplied("gender")
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-900 dark:text-white"
                                    }`}>جنسیت</span>
                                  </div>
                                  {isGeneralFilterApplied("gender") && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                  isGeneralFilterApplied("age")
                                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-600/50 shadow-sm"
                                    : "border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/30 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                                onClick={() => selectFilter("age")}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                      isGeneralFilterApplied("age")
                                        ? "bg-orange-500"
                                        : "bg-orange-100 dark:bg-orange-900/30"
                                    }`}>
                                      <Target className={`w-3 h-3 ${
                                        isGeneralFilterApplied("age")
                                          ? "text-white"
                                          : "text-orange-600 dark:text-orange-400"
                                      }`} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                      isGeneralFilterApplied("age")
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-900 dark:text-white"
                                    }`}>سن</span>
                                  </div>
                                  {isGeneralFilterApplied("age") && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* API Filters Sections */}
                        {filterCategories.map((category) => (
                          <Collapsible
                            key={category.id}
                            open={expandedCategories.includes(
                              category.id.toString()
                            )}
                            onOpenChange={() => toggleCategory(category.id)}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className={`p-2 rounded-lg border transition-colors ${
                                isCategoryApplied(category.id)
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <img
                                      src={category.icon}
                                      alt=""
                                      className="w-4 h-4"
                                    />
                                    <span className={`text-sm font-medium ${
                                      isCategoryApplied(category.id)
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-900 dark:text-white"
                                    }`}>
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
                              <div className="space-y-2 mt-2 mr-4">
                                                        {category.labels?.map((label) => {
                          // Check if any of this label's metrics are selected
                          const hasSelectedMetrics = label.metrics.some(metric => 
                            selectedMetrics.includes(metric.id)
                          );
                          
                          return (
                            <div
                              key={label.id}
                              className={`p-2 rounded-lg cursor-pointer transition-colors border ${
                                hasSelectedMetrics
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                              onClick={() => selectFilter(label.id)}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${
                                  hasSelectedMetrics 
                                    ? "text-blue-700 dark:text-blue-300 font-medium" 
                                    : "text-gray-900 dark:text-white"
                                }`}>
                                  {label.title}
                                </span>
                                {hasSelectedMetrics && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
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
              <div className="col-span-5">
                <Card className="rounded-2xl shadow-lg sticky top-20 max-h-[calc(100vh-100px)] overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="pb-4 flex-shrink-0 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">تنظیمات پیشرفته</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">تنظیم دقیق پارامترهای انتخاب شده</p>
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
                      <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-xs text-gray-900 dark:text-white">
                            {generalFilterType 
                              ? getFilterLabel(generalFilterType)
                              : getFilterLabel(selectedFilterForSettings!.toString())
                            }
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedFilterForSettings(null);
                              setGeneralFilterType(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {renderFilterSettings()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Column 3: Summary */}
              <div className="col-span-3">
                <Card className="rounded-2xl shadow-xl sticky top-24 h-[calc(100vh-120px)] flex flex-col bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-4 flex-shrink-0 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        خلاصه پروژه
                      </CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">جزئیات هزینه و مخاطبان</p>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col min-h-0 p-6 pt-0">
                    <div className="text-center flex-shrink-0 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {totalRespondents.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">کل پاسخ‌دهنده هدف</div>
                    </div>

                    {/* Restaurant-style itemization */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-2 flex-shrink-0">
                      <h4 className="font-medium text-xs mb-2 text-gray-900 dark:text-white">جزئیات محاسبه:</h4>
                      {segments.map((segment, index) => {
                        const invoiceSegment = invoiceData?.[index]; // Assume array order matches segments order
                        const isExpanded = expandedSegmentDetails.includes(segment.id);
                        
                        return (
                          <Collapsible
                            key={segment.id}
                            open={isExpanded}
                            onOpenChange={() => toggleSegmentDetails(segment.id)}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex justify-between items-center text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  {isExpanded ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  <span>سگمنت {index + 1}</span>
                                </div>
                                <span>
                                  {segment.user_limit} ×{" "}
                                  {invoiceSegment?.cost_of_each_person?.toLocaleString() || 0} ={" "}
                                  {invoiceSegment?.cost_of_all_persons?.toLocaleString() || 0} تومان
                                </span>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              {invoiceSegment && (
                                <div className="mr-5 mt-2 space-y-1.5 text-xs">
                                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>هزینه هر پاسخ:</span>
                                    <span>{invoiceSegment.cost_of_each_person.toLocaleString()} تومان</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>هزینه پایه:</span>
                                    <span>{invoiceSegment.base_price.toLocaleString()} تومان</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>هزینه فیلترهای انتخاب شده:</span>
                                    <span>{invoiceSegment.cost_of_filters.toLocaleString()} تومان</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>هزینه زمان پاسخگویی:</span>
                                    <span>{invoiceSegment.cost_of_answer_time.toLocaleString()} تومان</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>مالیات بر ارزش افزوده:</span>
                                    <span>{invoiceSegment.cost_of_tax.toLocaleString()} تومان</span>
                                  </div>
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>

                    {/* Applied Filters Summary - Scrollable Section */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex-1 min-h-0 flex flex-col">
                      <h4 className="font-medium text-xs mb-2 flex-shrink-0 text-gray-900 dark:text-white">
                        فیلترهای اعمال شده:
                      </h4>
                      <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
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
                                  {segment.target_gender === 'M' ? 'مرد' : 'زن'}
                                </span>
                              </div>
                            )}
                            
                            {/* Age Filter */}
                            {(segment.target_min_age !== (defaultFilterData?.min_age || 18) || 
                              segment.target_max_age !== (defaultFilterData?.max_age || 65)) && (
                              <div className="text-xs mr-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  سن:
                                </span>{" "}
                                <span className="text-gray-600 dark:text-gray-300">
                                  {segment.target_min_age} تا {segment.target_max_age} سال
                                </span>
                              </div>
                            )}
                            
                            {/* Cities Filter */}
                            {segment.target_city && segment.target_city.length > 0 && (
                              <div className="text-xs mr-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  شهرها:
                                </span>{" "}
                                <span className="text-gray-600 dark:text-gray-300">
                                  {segment.target_city.length} شهر انتخاب شده
                                </span>
                              </div>
                            )}

                            {/* API Filters */}
                            {segmentMetrics[segment.id] && segmentMetrics[segment.id].length > 0 && (
                              <div className="text-xs mr-2 space-y-1">
                                <span className="font-medium text-gray-900 dark:text-white block">
                                  فیلترهای تخصصی:
                                </span>
                                {(() => {
                                  // Group metrics by their labels
                                  const metricsByLabel: Record<string, string[]> = {};
                                  segmentMetrics[segment.id].forEach(metricId => {
                                    filterCategories.forEach(cat => {
                                      cat.labels.forEach(label => {
                                        const metric = label.metrics.find(m => m.id === metricId);
                                        if (metric) {
                                          if (!metricsByLabel[label.title]) {
                                            metricsByLabel[label.title] = [];
                                          }
                                          metricsByLabel[label.title].push(metric.title);
                                        }
                                      });
                                    });
                                  });

                                  return Object.entries(metricsByLabel).map(([labelTitle, metrics]) => (
                                    <div key={labelTitle} className="mr-2">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {labelTitle}:
                                      </span>{" "}
                                      <span className="text-gray-600 dark:text-gray-300">
                                        {metrics.join(", ")}
                                      </span>
                                    </div>
                                  ));
                                })()}
                              </div>
                            )}
                            
                            {/* Empty state for this segment */}
                            {segment.target_gender === null &&
                             segment.target_min_age === (defaultFilterData?.min_age || 18) &&
                             segment.target_max_age === (defaultFilterData?.max_age || 65) &&
                             (!segment.target_city || segment.target_city.length === 0) &&
                             (!segmentMetrics[segment.id] || segmentMetrics[segment.id].length === 0) && (
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

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex-shrink-0">
                      {invoiceData && (
                        <div className="space-y-2 mb-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 dark:text-gray-300">مجموع هزینه:</span>
                            <span className="text-gray-900 dark:text-white">{totalCost.toLocaleString()} تومان</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 dark:text-gray-300">مالیات بر ارزش افزوده:</span>
                            <span className="text-gray-900 dark:text-white">{totalTax.toLocaleString()} تومان</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">کل هزینه:</span>
                        <span className="font-bold text-base text-gray-900 dark:text-white">
                          {loading
                            ? "..."
                            : `${grandTotal.toLocaleString()} تومان`}
                        </span>
                      </div>

                      {segments.some((s) => s.estimatedTime) && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 dark:text-gray-300">زمان تخمینی:</span>
                          <span className="text-gray-900 dark:text-white">2-3 روز کاری</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200/50 dark:border-gray-600/50 pt-6 flex-shrink-0">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 h-12 rounded-xl"
                        disabled={!allSegmentsPossible || grandTotal === 0}
                        size="lg"
                      >
                        <DollarSign className="w-5 h-5 ml-2" />
                        تأیید و پرداخت
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audience;
