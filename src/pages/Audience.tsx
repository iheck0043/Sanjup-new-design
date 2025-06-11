
import React, { useState, useEffect } from 'react';
import FormHeader from '../components/FormHeader';
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
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

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

const Audience = () => {
  const [formTitle, setFormTitle] = useState('بدون عنوان');
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: '1',
      title: 'سگمنت 1',
      filters: {},
      count: 100,
      possible: true
    }
  ]);
  const [selectedSegmentId, setSelectedSegmentId] = useState('1');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter options data
  const genderOptions: FilterOption[] = [
    { value: 'male', label: 'مرد' },
    { value: 'female', label: 'زن' }
  ];

  const educationOptions: FilterOption[] = [
    { value: 'under_diploma', label: 'زیر دیپلم' },
    { value: 'diploma', label: 'دیپلم' },
    { value: 'bachelor', label: 'کارشناسی' },
    { value: 'master', label: 'کارشناسی ارشد' },
    { value: 'phd', label: 'دکتری' }
  ];

  const socialLevelOptions: FilterOption[] = [
    { value: 'A', label: 'A (بالا)' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E (پایین)' }
  ];

  const onlinePurchaseOptions: FilterOption[] = [
    { value: 'low', label: 'کم' },
    { value: 'medium', label: 'متوسط' },
    { value: 'high', label: 'زیاد' }
  ];

  const provinces = [
    'تهران', 'اصفهان', 'فارس', 'خوزستان', 'کرمان', 'مازندران', 'گیلان'
  ];

  const cities: Record<string, string[]> = {
    'تهران': ['تهران', 'کرج', 'شهریار', 'ورامین'],
    'اصفهان': ['اصفهان', 'کاشان', 'نجف‌آباد'],
    'فارس': ['شیراز', 'مرودشت', 'کازرون'],
    'خوزستان': ['اهواز', 'آبادان', 'خرمشهر'],
    'کرمان': ['کرمان', 'رفسنجان', 'سیرجان'],
    'مازندران': ['ساری', 'بابل', 'آمل'],
    'گیلان': ['رشت', 'انزلی', 'لاهیجان']
  };

  const filterCategories = [
    { id: 'demographic', label: 'اطلاعات دموگرافیک', icon: Users },
    { id: 'education', label: 'تحصیلات', icon: GraduationCap },
    { id: 'geographic', label: 'اطلاعات جغرافیایی', icon: MapPin },
    { id: 'socioeconomic', label: 'اطلاعات اجتماعی-اقتصادی', icon: DollarSign }
  ];

  const filtersByCategory: Record<string, any[]> = {
    demographic: [
      { id: 'age', label: 'محدوده سنی' },
      { id: 'gender', label: 'جنسیت' }
    ],
    education: [
      { id: 'education', label: 'سطح تحصیلات' }
    ],
    geographic: [
      { id: 'location', label: 'محل سکونت' }
    ],
    socioeconomic: [
      { id: 'socialLevel', label: 'سطح اجتماعی' },
      { id: 'onlinePurchase', label: 'میزان خرید آنلاین' }
    ]
  };

  const selectedSegment = segments.find(s => s.id === selectedSegmentId);

  // Calculate total cost for all segments
  const totalCost = segments.reduce((sum, segment) => sum + (segment.cost || 0), 0);
  const totalRespondents = segments.reduce((sum, segment) => sum + segment.count, 0);
  const allSegmentsPossible = segments.every(segment => segment.possible !== false);

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
      const updatedSegments = segments.map(segment => {
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
          estimatedTime: '2-3 روز کاری',
          possible,
          errorMessage: !possible ? 'با این فیلترها تعداد پاسخ‌دهنده کافی یافت نمی‌شود. لطفاً تنظیمات را تغییر دهید.' : undefined
        };
      });
      
      setSegments(updatedSegments);
    } catch (error) {
      toast.error('خطا در محاسبه هزینه');
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
      possible: true
    };
    setSegments([...segments, newSegment]);
    setSelectedSegmentId(newSegment.id);
  };

  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      const updatedSegments = segments.filter(s => s.id !== id);
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
      title: `${segment.title} (کپی)`
    };
    setSegments([...segments, newSegment]);
    setSelectedSegmentId(newSegment.id);
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    setSegments(segments.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updateSegmentFilter = (segmentId: string, filterKey: string, value: any) => {
    setSegments(segments.map(s => 
      s.id === segmentId 
        ? { ...s, filters: { ...s.filters, [filterKey]: value } }
        : s
    ));
  };

  const removeAppliedFilter = (filterKey: string) => {
    setSegments(segments.map(s => {
      if (s.id === selectedSegmentId) {
        const newFilters = { ...s.filters };
        delete newFilters[filterKey];
        return { ...s, filters: newFilters };
      }
      return s;
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectFilter = (filterId: string) => {
    if (!selectedSegment) return;
    
    // Add filter to segment if it doesn't exist
    if (!selectedSegment.filters[filterId]) {
      let defaultValue;
      
      // Set default values based on filter type
      switch (filterId) {
        case 'age':
          defaultValue = [18, 100];
          break;
        case 'gender':
        case 'education':
        case 'socialLevel':
        case 'onlinePurchase':
          defaultValue = [];
          break;
        case 'location':
          defaultValue = { selectedProvince: '', selectedCity: '' };
          break;
        default:
          defaultValue = '';
      }
      
      updateSegmentFilter(selectedSegmentId, filterId, defaultValue);
    }
  };

  const renderFilterSettings = (filterId: string, value: any) => {
    switch (filterId) {
      case 'age':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">محدوده سنی (18-100 سال)</h4>
            <Slider
              value={value || [18, 100]}
              onValueChange={(newValue) => updateSegmentFilter(selectedSegmentId, 'age', newValue)}
              min={18}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{value?.[0] || 18} سال</span>
              <span>{value?.[1] || 100} سال</span>
            </div>
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">جنسیت</h4>
            <div className="space-y-2">
              {genderOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = value || [];
                      const updated = checked
                        ? [...current, option.value]
                        : current.filter((g: string) => g !== option.value);
                      updateSegmentFilter(selectedSegmentId, 'gender', updated);
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">سطح تحصیلات</h4>
            <div className="space-y-2">
              {educationOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = value || [];
                      const updated = checked
                        ? [...current, option.value]
                        : current.filter((e: string) => e !== option.value);
                      updateSegmentFilter(selectedSegmentId, 'education', updated);
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">محل سکونت</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">استان</label>
                <Select
                  value={(value || {}).selectedProvince || ''}
                  onValueChange={(newValue) => {
                    const updated = { ...(value || {}), selectedProvince: newValue, selectedCity: '' };
                    updateSegmentFilter(selectedSegmentId, 'location', updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب استان" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(value || {}).selectedProvince && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شهر</label>
                  <Select
                    value={(value || {}).selectedCity || ''}
                    onValueChange={(newValue) => {
                      const updated = { ...(value || {}), selectedCity: newValue };
                      updateSegmentFilter(selectedSegmentId, 'location', updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب شهر" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities[(value || {}).selectedProvince]?.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 'socialLevel':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">سطح اجتماعی</h4>
            <div className="space-y-2">
              {socialLevelOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = value || [];
                      const updated = checked
                        ? [...current, option.value]
                        : current.filter((s: string) => s !== option.value);
                      updateSegmentFilter(selectedSegmentId, 'socialLevel', updated);
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'onlinePurchase':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">میزان خرید آنلاین</h4>
            <div className="space-y-2">
              {onlinePurchaseOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = value || [];
                      const updated = checked
                        ? [...current, option.value]
                        : current.filter((o: string) => o !== option.value);
                      updateSegmentFilter(selectedSegmentId, 'onlinePurchase', updated);
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Get filter label by ID
  const getFilterLabel = (filterId: string) => {
    switch (filterId) {
      case 'age': return 'محدوده سنی';
      case 'gender': return 'جنسیت';
      case 'education': return 'سطح تحصیلات';
      case 'location': return 'محل سکونت';
      case 'socialLevel': return 'سطح اجتماعی';
      case 'onlinePurchase': return 'میزان خرید آنلاین';
      default: return 'فیلتر';
    }
  };

  // Check if filter has meaningful values
  const hasValidFilterValue = (value: any) => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some(v => v && v !== '');
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
      
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
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSegmentId(segment.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Input
                          value={segment.title}
                          onChange={(e) => updateSegment(segment.id, { title: e.target.value })}
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
                          onValueChange={(value) => updateSegment(segment.id, { count: value[0] })}
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
                          onChange={(e) => updateSegment(segment.id, { count: parseInt(e.target.value) || 1 })}
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
                  {filterCategories.map((category) => (
                    <Collapsible
                      key={category.id}
                      open={expandedCategories.includes(category.id)}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <category.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{category.label}</span>
                            </div>
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 mt-2 mr-4">
                          {filtersByCategory[category.id]?.map((filter) => (
                            <div
                              key={filter.id}
                              className={`p-2 rounded-lg cursor-pointer transition-colors border ${
                                selectedSegment?.filters[filter.id] 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => selectFilter(filter.id)}
                            >
                              <span className="text-sm">{filter.label}</span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
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
                  {!selectedSegment || Object.keys(selectedSegment.filters).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">برای تنظیم فیلترها، یک فیلتر از فهرست انتخاب کنید</p>
                    </div>
                  ) : (
                    Object.entries(selectedSegment.filters).map(([filterId, value]) => {
                      // Only show filters that have meaningful values
                      if (!hasValidFilterValue(value)) {
                        return null;
                      }
                      
                      return (
                        <div key={filterId} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">
                              {getFilterLabel(filterId)}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAppliedFilter(filterId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {renderFilterSettings(filterId, value)}
                        </div>
                      );
                    })
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
                      <div key={segment.id} className="flex justify-between items-center text-xs">
                        <span>{segment.title}</span>
                        <span>
                          {segment.count} × {segment.perUnitPrice?.toLocaleString() || 0} = {segment.cost?.toLocaleString() || 0} تومان
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">کل هزینه:</span>
                      <span className="font-bold text-base">
                        {loading ? '...' : `${totalCost.toLocaleString()} تومان`}
                      </span>
                    </div>
                    
                    {segments.some(s => s.estimatedTime) && (
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
