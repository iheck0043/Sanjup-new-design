
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
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

  // Calculate total cost for all segments
  const totalCost = segments.reduce((sum, segment) => sum + (segment.cost || 0), 0);
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
  };

  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      setSegments(segments.filter(s => s.id !== id));
    }
  };

  const duplicateSegment = (segment: Segment) => {
    const newSegment: Segment = {
      ...segment,
      id: Date.now().toString(),
      title: `${segment.title} (کپی)`
    };
    setSegments([...segments, newSegment]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">انتخاب جامعه هدف و تعداد پاسخ‌دهنده</h1>
            <p className="text-gray-600">فیلترها را با دقت تنظیم کنید تا داده‌های دقیق و قابل‌اعتماد دریافت کنید.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Segments */}
            <div className="lg:col-span-2 space-y-6">
              {segments.map((segment, index) => (
                <Card key={segment.id} className="rounded-2xl shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={segment.title}
                        onChange={(e) => updateSegment(segment.id, { title: e.target.value })}
                        className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                        placeholder="عنوان سگمنت"
                      />
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateSegment(segment)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {segments.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSegment(segment.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Segment Status */}
                    {segment.possible === false && (
                      <div className="flex items-center space-x-2 space-x-reverse p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-700">{segment.errorMessage}</span>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Response Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تعداد پاسخ‌دهنده (1-5000 نفر)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="5000"
                        value={segment.count}
                        onChange={(e) => updateSegment(segment.id, { count: parseInt(e.target.value) || 1 })}
                        className="w-full"
                      />
                      {segment.count < 100 && (
                        <p className="text-sm text-yellow-600 mt-1">
                          تعداد کمتر از 100 نفر ممکن است داده کافی نداشته باشد.
                        </p>
                      )}
                    </div>

                    {/* Filters */}
                    <Accordion type="multiple" className="w-full">
                      {/* Demographics */}
                      <AccordionItem value="demographics">
                        <AccordionTrigger>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Users className="w-5 h-5" />
                            <span>اطلاعات دموگرافیک</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          {/* Age Range */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              محدوده سنی (18-100 سال)
                            </label>
                            <Slider
                              value={segment.filters.ageRange || [18, 100]}
                              onValueChange={(value) => updateSegmentFilter(segment.id, 'ageRange', value)}
                              min={18}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>{segment.filters.ageRange?.[0] || 18} سال</span>
                              <span>{segment.filters.ageRange?.[1] || 100} سال</span>
                            </div>
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">جنسیت</label>
                            <div className="space-y-2">
                              {genderOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                                  <Checkbox
                                    checked={segment.filters.gender?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = segment.filters.gender || [];
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((g: string) => g !== option.value);
                                      updateSegmentFilter(segment.id, 'gender', updated);
                                    }}
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Education */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">تحصیلات</label>
                            <div className="space-y-2">
                              {educationOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                                  <Checkbox
                                    checked={segment.filters.education?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = segment.filters.education || [];
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((e: string) => e !== option.value);
                                      updateSegmentFilter(segment.id, 'education', updated);
                                    }}
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Geographic */}
                      <AccordionItem value="geographic">
                        <AccordionTrigger>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <MapPin className="w-5 h-5" />
                            <span>اطلاعات جغرافیایی</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">استان محل سکونت</label>
                            <div className="space-y-2">
                              {provinces.map((province) => (
                                <div key={province} className="flex items-center space-x-2 space-x-reverse">
                                  <Checkbox
                                    checked={segment.filters.provinces?.includes(province)}
                                    onCheckedChange={(checked) => {
                                      const current = segment.filters.provinces || [];
                                      const updated = checked
                                        ? [...current, province]
                                        : current.filter((p: string) => p !== province);
                                      updateSegmentFilter(segment.id, 'provinces', updated);
                                    }}
                                  />
                                  <span className="text-sm">{province}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Socioeconomic */}
                      <AccordionItem value="socioeconomic">
                        <AccordionTrigger>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <DollarSign className="w-5 h-5" />
                            <span>اطلاعات اجتماعی-اقتصادی</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          {/* Social Level */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">سطح اجتماعی</label>
                            <div className="space-y-2">
                              {socialLevelOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                                  <Checkbox
                                    checked={segment.filters.socialLevel?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = segment.filters.socialLevel || [];
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((s: string) => s !== option.value);
                                      updateSegmentFilter(segment.id, 'socialLevel', updated);
                                    }}
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Online Purchase */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">میزان خرید آنلاین</label>
                            <div className="space-y-2">
                              {onlinePurchaseOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                                  <Checkbox
                                    checked={segment.filters.onlinePurchase?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = segment.filters.onlinePurchase || [];
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((o: string) => o !== option.value);
                                      updateSegmentFilter(segment.id, 'onlinePurchase', updated);
                                    }}
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Applied Filters */}
                    {Object.keys(segment.filters).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">فیلترهای اعمال شده:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(segment.filters).map(([key, value]) => {
                            if (Array.isArray(value) && value.length > 0) {
                              return value.map((v: string) => (
                                <Badge key={`${key}-${v}`} variant="secondary" className="flex items-center space-x-1 space-x-reverse">
                                  <span>{v}</span>
                                  <X 
                                    className="w-3 h-3 cursor-pointer" 
                                    onClick={() => {
                                      const updated = value.filter((item: string) => item !== v);
                                      if (updated.length === 0) {
                                        removeSegmentFilter(segment.id, key);
                                      } else {
                                        updateSegmentFilter(segment.id, key, updated);
                                      }
                                    }}
                                  />
                                </Badge>
                              ));
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Segment Cost */}
                    {segment.cost && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <DollarSign className="w-4 h-4" />
                            <span>هزینه:</span>
                          </span>
                          <span className="font-semibold">
                            {segment.count} × {segment.perUnitPrice?.toLocaleString()} = {segment.cost.toLocaleString()} تومان
                          </span>
                        </div>
                        {segment.estimatedTime && (
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="flex items-center space-x-1 space-x-reverse">
                              <Clock className="w-4 h-4" />
                              <span>زمان تخمینی اجرا:</span>
                            </span>
                            <span>{segment.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Add Segment Button */}
              <Button
                onClick={addSegment}
                variant="outline"
                className="w-full border-dashed border-2 h-16 text-lg"
              >
                <Plus className="w-5 h-5 ml-2" />
                ➕ افزودن سگمنت جدید
              </Button>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
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
                      {segments.reduce((sum, s) => sum + s.count, 0)}
                    </div>
                    <div className="text-sm text-gray-600">کل پاسخ‌دهنده</div>
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
                      مرحله بعد: پرداخت و انتشار
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                    >
                      بازگشت به ویرایش سوالات
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
