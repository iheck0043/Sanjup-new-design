
import React, { useState, useEffect } from 'react';
import FormHeader from '../components/FormHeader';
import { 
  Users, 
  Target, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  X,
  Plus,
  Search,
  Copy,
  MapPin,
  DollarSign,
  Clock,
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
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

  const removeSegmentFilter = (segmentId: string, filterKey: string) => {
    setSegments(segments.map(s => {
      if (s.id === segmentId) {
        const newFilters = { ...s.filters };
        delete newFilters[filterKey];
        return { ...s, filters: newFilters };
      }
      return s;
    }));
  };

  const renderFilterDetails = () => {
    if (!selectedFilter || !selectedSegment) return null;

    switch (selectedFilter) {
      case 'age':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">محدوده سنی (18-100 سال)</h3>
            <Slider
              value={selectedSegment.filters.ageRange || [18, 100]}
              onValueChange={(value) => updateSegmentFilter(selectedSegmentId, 'ageRange', value)}
              min={18}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{selectedSegment.filters.ageRange?.[0] || 18} سال</span>
              <span>{selectedSegment.filters.ageRange?.[1] || 100} سال</span>
            </div>
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">جنسیت</h3>
            <div className="space-y-2">
              {genderOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={selectedSegment.filters.gender?.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = selectedSegment.filters.gender || [];
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
            <h3 className="font-medium">سطح تحصیلات</h3>
            <div className="space-y-2">
              {educationOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={selectedSegment.filters.education?.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = selectedSegment.filters.education || [];
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
            <h3 className="font-medium">محل سکونت</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">استان</label>
                <Select
                  value={selectedSegment.filters.selectedProvince || ''}
                  onValueChange={(value) => {
                    updateSegmentFilter(selectedSegmentId, 'selectedProvince', value);
                    updateSegmentFilter(selectedSegmentId, 'selectedCity', '');
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
              
              {selectedSegment.filters.selectedProvince && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شهر</label>
                  <Select
                    value={selectedSegment.filters.selectedCity || ''}
                    onValueChange={(value) => updateSegmentFilter(selectedSegmentId, 'selectedCity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب شهر" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities[selectedSegment.filters.selectedProvince]?.map((city) => (
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
            <h3 className="font-medium">سطح اجتماعی</h3>
            <div className="space-y-2">
              {socialLevelOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={selectedSegment.filters.socialLevel?.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = selectedSegment.filters.socialLevel || [];
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
            <h3 className="font-medium">میزان خرید آنلاین</h3>
            <div className="space-y-2">
              {onlinePurchaseOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    checked={selectedSegment.filters.onlinePurchase?.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = selectedSegment.filters.onlinePurchase || [];
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
      
      <div className="flex-1 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">انتخاب جامعه هدف و تعداد پاسخ‌دهنده</h1>
            <p className="text-gray-600">فیلترها را با دقت تنظیم کنید تا داده‌های دقیق و قابل‌اعتماد دریافت کنید.</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Column 1: Segment List */}
            <div className="col-span-3">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">سگمنت‌ها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segments.map((segment) => (
                    <div 
                      key={segment.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
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
                          className="text-sm border-none p-0 h-auto bg-transparent font-medium"
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
                          className="text-xs h-8"
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
                    className="w-full border-dashed border-2 h-12"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن سگمنت
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Filter Categories */}
            <div className="col-span-3">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">دسته‌بندی فیلترها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filterCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 border-blue-500 border-2'
                          : 'border border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedFilter(null);
                      }}
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <category.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Filters */}
            <div className="col-span-3">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">فیلترها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedCategory && filtersByCategory[selectedCategory]?.map((filter) => (
                    <div
                      key={filter.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFilter === filter.id
                          ? 'bg-blue-50 border-blue-500 border-2'
                          : 'border border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFilter(filter.id)}
                    >
                      <span className="text-sm font-medium">{filter.label}</span>
                    </div>
                  ))}
                  
                  {!selectedCategory && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      ابتدا یک دسته‌بندی انتخاب کنید
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 4: Summary & Filter Details */}
            <div className="col-span-3 space-y-6">
              {/* Filter Details */}
              {selectedFilter && (
                <Card className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">تنظیمات فیلتر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderFilterDetails()}
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card className="rounded-2xl shadow-lg sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Target className="w-5 h-5" />
                    <span>خلاصه پروژه</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {totalRespondents}
                    </div>
                    <div className="text-sm text-gray-600">کل پاسخ‌دهنده</div>
                  </div>

                  {/* Restaurant-style itemization */}
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-medium text-sm mb-3">جزئیات محاسبه:</h4>
                    {segments.map((segment, index) => (
                      <div key={segment.id} className="flex justify-between items-center text-sm">
                        <span>{segment.title}</span>
                        <span>
                          {segment.count} × {segment.perUnitPrice?.toLocaleString() || 0} = {segment.cost?.toLocaleString() || 0} تومان
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">کل هزینه:</span>
                      <span className="font-bold text-lg">
                        {loading ? '...' : `${totalCost.toLocaleString()} تومان`}
                      </span>
                    </div>
                    
                    {segments.some(s => s.estimatedTime) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">زمان تخمینی:</span>
                        <span>2-3 روز کاری</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!allSegmentsPossible || totalCost === 0}
                    >
                      پرداخت
                    </Button>
                  </div>

                  {/* Applied Filters Summary */}
                  {selectedSegment && Object.keys(selectedSegment.filters).length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">فیلترهای اعمال شده:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedSegment.filters).map(([key, value]) => {
                          if (Array.isArray(value) && value.length > 0) {
                            return value.map((v: string) => (
                              <Badge key={`${key}-${v}`} variant="secondary" className="flex items-center space-x-1 space-x-reverse">
                                <span className="text-xs">{v}</span>
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => {
                                    const updated = value.filter((item: string) => item !== v);
                                    if (updated.length === 0) {
                                      removeSegmentFilter(selectedSegmentId, key);
                                    } else {
                                      updateSegmentFilter(selectedSegmentId, key, updated);
                                    }
                                  }}
                                />
                              </Badge>
                            ));
                          }
                          if (key === 'ageRange' && Array.isArray(value)) {
                            return (
                              <Badge key={key} variant="secondary" className="flex items-center space-x-1 space-x-reverse">
                                <span className="text-xs">سن: {value[0]}-{value[1]} سال</span>
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => removeSegmentFilter(selectedSegmentId, key)}
                                />
                              </Badge>
                            );
                          }
                          if (key === 'selectedProvince' && value) {
                            return (
                              <Badge key={key} variant="secondary" className="flex items-center space-x-1 space-x-reverse">
                                <span className="text-xs">استان: {value}</span>
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => removeSegmentFilter(selectedSegmentId, key)}
                                />
                              </Badge>
                            );
                          }
                          if (key === 'selectedCity' && value) {
                            return (
                              <Badge key={key} variant="secondary" className="flex items-center space-x-1 space-x-reverse">
                                <span className="text-xs">شهر: {value}</span>
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => removeSegmentFilter(selectedSegmentId, key)}
                                />
                              </Badge>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
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
