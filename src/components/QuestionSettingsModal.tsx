import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Question } from '../pages/Index';
import { toast } from "@/components/ui/use-toast"
import { Copy, Trash2, Upload } from 'lucide-react';

interface QuestionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (questionData: Question) => void;
  onCancel: () => void;
  isNewQuestion: boolean;
}

const QuestionSettingsModal: React.FC<QuestionSettingsModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
  onCancel,
  isNewQuestion,
}) => {
  const [formData, setFormData] = useState<Question>(
    question || {
      id: '',
      type: '',
      label: '',
      required: true, // Default to true as requested
    }
  );
  const [newDropdownOption, setNewDropdownOption] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({ ...question });
    } else {
      setFormData({
        id: '',
        type: '',
        label: '',
        required: true, // Default to true as requested
      });
    }
  }, [question]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScaleLabelsChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      scaleLabels: {
        ...prev.scaleLabels,
        [name]: value,
      },
    }));
  };

  const addDropdownOption = () => {
    if (newDropdownOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newDropdownOption.trim()]
      }));
      setNewDropdownOption('');
    }
  };

  const handleDropdownKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDropdownOption();
    }
  };

  const removeDropdownOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    if (!formData.label?.trim()) {
      toast({
        title: "خطا",
        description: "لطفا عنوان سوال را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    
    onSave(formData);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleImageUpload = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create a URL for the uploaded image
        const imageUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          mediaUrl: imageUrl,
          mediaType: 'image' as const,
          hasMedia: true,
        }));
        toast({
          title: "موفق",
          description: "تصویر با موفقیت آپلود شد",
        });
      }
    };
    input.click();
  };

  const getQuestionTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'چندگزینه‌ای': 'چند گزینه‌ای',
      'متنی': 'متنی',
      'عددی': 'عددی',
      'طیفی': 'طیفی',
      'درجه‌بندی': 'درجه‌بندی',
      'گروه سوال': 'گروه سوال',
      'تاریخ': 'تاریخ',
      'زمان': 'زمان',
      'فایل': 'فایل',
      'ماتریس': 'ماتریس',
      'تصویری': 'تصویری',
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl" dir="rtl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="text-xl font-bold">
            {isNewQuestion ? 'افزودن سوال جدید' : 'ویرایش سوال'}
            {formData.type && (
              <span className="text-blue-100 text-sm mr-2">({getQuestionTypeDisplay(formData.type)})</span>
            )}
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            تنظیمات مربوط به سوال را در این قسمت وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right font-semibold text-gray-700">
              متن سوال *
            </Label>
            <Input 
              id="name" 
              value={formData.label || ''} 
              className="col-span-3 border-2 focus:border-blue-500 transition-colors" 
              onChange={(e) => handleChange(e)} 
              name="label"
              placeholder={isNewQuestion ? "عنوان سوال خود را وارد کنید" : ""}
              required
            />
          </div>

          {/* Common Settings */}
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="general" className="border border-gray-200 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-gray-700 font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  عمومی
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-6 py-4 space-y-4">
                  {/* Required */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="required" className="font-medium text-gray-700">اجباری</Label>
                    <Switch 
                      id="required" 
                      name="required" 
                      checked={!!formData.required} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))} 
                    />
                  </div>

                  {/* Description */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="hasDescription" className="font-medium text-gray-700">توضیحات</Label>
                    <Switch 
                      id="hasDescription" 
                      name="hasDescription" 
                      checked={!!formData.hasDescription} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDescription: checked }))} 
                    />
                  </div>

                  {formData.hasDescription && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right font-medium text-gray-700">
                        توضیحات سوال
                      </Label>
                      <Textarea 
                        id="description" 
                        value={formData.description || ''} 
                        className="col-span-3 border-2 focus:border-blue-500 transition-colors" 
                        onChange={(e) => handleChange(e)} 
                        name="description"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Media */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="hasMedia" className="font-medium text-gray-700">رسانه</Label>
                    <Switch 
                      id="hasMedia" 
                      name="hasMedia" 
                      checked={!!formData.hasMedia} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasMedia: checked }))} 
                    />
                  </div>

                  {formData.hasMedia && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mediaType" className="text-right font-medium text-gray-700">
                          نوع رسانه
                        </Label>
                        <Select 
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            mediaType: value as 'image' | 'video'
                          }))} 
                          defaultValue={formData.mediaType || 'image'}
                        >
                          <SelectTrigger className="col-span-3 border-2 focus:border-blue-500">
                            <SelectValue placeholder="انتخاب نوع رسانه" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">تصویر</SelectItem>
                            <SelectItem value="video">ویدیو</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mediaUrl" className="text-right font-medium text-gray-700">
                          آدرس رسانه
                        </Label>
                        <div className="col-span-3 flex gap-2">
                          <Input 
                            id="mediaUrl" 
                            value={formData.mediaUrl || ''} 
                            className="flex-1 border-2 focus:border-blue-500 transition-colors" 
                            onChange={(e) => handleChange(e)} 
                            name="mediaUrl"
                            placeholder="آدرس تصویر یا ویدیو"
                          />
                          <Button 
                            type="button" 
                            onClick={handleImageUpload}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                            size="sm"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {formData.mediaUrl && formData.mediaType === 'image' && (
                        <div className="mt-2">
                          <img 
                            src={formData.mediaUrl} 
                            alt="پیش‌نمایش" 
                            className="max-w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Question Type Specific Settings */}
            {formData.type === 'چندگزینه‌ای' && (
              <AccordionItem value="multipleChoice" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-gray-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    چندگزینه‌ای
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="isMultiSelect" name="isMultiSelect" checked={!!formData.isMultiSelect} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMultiSelect: checked }))} />
                      <Label htmlFor="isMultiSelect">انتخاب چندگانه</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="randomizeOptions" name="randomizeOptions" checked={!!formData.randomizeOptions} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomizeOptions: checked }))} />
                      <Label htmlFor="randomizeOptions">ترتیب تصادفی گزینه‌ها</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="hasOther" name="hasOther" checked={!!formData.hasOther} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOther: checked }))} />
                      <Label htmlFor="hasOther">گزینه "سایر"</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="hasNone" name="hasNone" checked={!!formData.hasNone} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasNone: checked }))} />
                      <Label htmlFor="hasNone">گزینه "هیچکدام"</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="hasAll" name="hasAll" checked={!!formData.hasAll} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasAll: checked }))} />
                      <Label htmlFor="hasAll">گزینه "همه موارد"</Label>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newOption" className="text-right">
                        افزودن گزینه
                      </Label>
                      <div className="col-span-3 flex gap-2">
                        <Input
                          type="text"
                          id="newOption"
                          placeholder="گزینه جدید"
                          value={newDropdownOption}
                          onChange={(e) => setNewDropdownOption(e.target.value)}
                          onKeyDown={handleDropdownKeyPress}
                        />
                        <Button type="button" size="sm" onClick={addDropdownOption}>
                          افزودن
                        </Button>
                      </div>
                    </div>

                    {formData.options && formData.options.length > 0 && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                          گزینه‌ها
                        </Label>
                        <div className="col-span-3 space-y-2">
                          {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                type="text"
                                value={option}
                                className="flex-1"
                                onChange={(e) => {
                                  const newOptions = [...formData.options!];
                                  newOptions[index] = e.target.value;
                                  setFormData(prev => ({ ...prev, options: newOptions }));
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDropdownOption(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {formData.type === 'طیفی' && (
              <AccordionItem value="scale" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-gray-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    طیفی
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="scaleMin" className="text-right">
                        حداقل مقدار
                      </Label>
                      <Input
                        type="number"
                        id="scaleMin"
                        className="col-span-3"
                        value={formData.scaleMin?.toString() || '0'}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('scaleMin', value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="scaleMax" className="text-right">
                        حداکثر مقدار
                      </Label>
                      <Input
                        type="number"
                        id="scaleMax"
                        className="col-span-3"
                        value={formData.scaleMax?.toString() || '10'}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('scaleMax', value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        برچسب‌ها
                      </Label>
                      <div className="col-span-3 space-y-2">
                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label htmlFor="scaleLeft" className="text-right">
                            چپ
                          </Label>
                          <Input
                            type="text"
                            id="scaleLeft"
                            value={formData.scaleLabels?.left || ''}
                            onChange={(e) => handleScaleLabelsChange('left', e.target.value)}
                            className="col-span-2"
                          />
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label htmlFor="scaleCenter" className="text-right">
                            وسط
                          </Label>
                          <Input
                            type="text"
                            id="scaleCenter"
                            value={formData.scaleLabels?.center || ''}
                            onChange={(e) => handleScaleLabelsChange('center', e.target.value)}
                            className="col-span-2"
                          />
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2">
                          <Label htmlFor="scaleRight" className="text-right">
                            راست
                          </Label>
                          <Input
                            type="text"
                            id="scaleRight"
                            value={formData.scaleLabels?.right || ''}
                            onChange={(e) => handleScaleLabelsChange('right', e.target.value)}
                            className="col-span-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {formData.type === 'درجه‌بندی' && (
              <AccordionItem value="rating" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-gray-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    درجه‌بندی
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ratingMax" className="text-right">
                        حداکثر مقدار
                      </Label>
                      <Input
                        type="number"
                        id="ratingMax"
                        className="col-span-3"
                        value={formData.ratingMax?.toString() || '5'}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('ratingMax', value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ratingStyle" className="text-right">
                        استایل
                      </Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, ratingStyle: value as 'star' | 'heart' | 'thumbs' }))} defaultValue={formData.ratingStyle || 'star'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="انتخاب استایل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="star">ستاره</SelectItem>
                          <SelectItem value="heart">قلب</SelectItem>
                          <SelectItem value="thumbs">لایک/دیسلایک</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {formData.type === 'متنی' && (
              <AccordionItem value="text" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-gray-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    متنی
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="textType" className="text-right">
                        نوع متن
                      </Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, textType: value as 'short' | 'long' }))} defaultValue={formData.textType || 'short'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="انتخاب نوع متن" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">کوتاه</SelectItem>
                          <SelectItem value="long">بلند</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="minChars" className="text-right">
                        حداقل کاراکتر
                      </Label>
                      <Input
                        type="number"
                        id="minChars"
                        className="col-span-3"
                        value={formData.minChars?.toString() || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('minChars', value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maxChars" className="text-right">
                        حداکثر کاراکتر
                      </Label>
                      <Input
                        type="number"
                        id="maxChars"
                        className="col-span-3"
                        value={formData.maxChars?.toString() || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('maxChars', value);
                        }}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {formData.type === 'عددی' && (
              <AccordionItem value="number" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-gray-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    عددی
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="minNumber" className="text-right">
                        حداقل مقدار
                      </Label>
                      <Input
                        type="number"
                        id="minNumber"
                        className="col-span-3"
                        value={formData.minNumber?.toString() || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('minNumber', value);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maxNumber" className="text-right">
                        حداکثر مقدار
                      </Label>
                      <Input
                        type="number"
                        id="maxNumber"
                        className="col-span-3"
                        value={formData.maxNumber?.toString() || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          handleNumberChange('maxNumber', value);
                        }}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
        <DialogFooter className="bg-gray-50 p-6 -m-6 mt-4 rounded-b-lg">
          <div className="flex gap-3 w-full justify-end">
            <Button type="button" variant="secondary" onClick={handleCancel} className="px-6">
              انصراف
            </Button>
            <Button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              ذخیره
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
