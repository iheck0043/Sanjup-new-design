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
import { Copy, Trash2 } from 'lucide-react';

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
      });
    }
  }, [question]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
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
      return; // Don't save if label is empty
    }
    
    onSave(formData);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isNewQuestion ? 'افزودن سوال جدید' : 'ویرایش سوال'}</DialogTitle>
          <DialogDescription>
            تنظیمات مربوط به سوال را در این قسمت وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              متن سوال
            </Label>
            <Input id="name" value={formData.label || ''} className="col-span-3" onChange={(e) => handleChange(e)} name="label" />
          </div>

          {/* Common Settings */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="general">
              <AccordionTrigger>عمومی</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 py-4">
                  {/* Required */}
                  <div className="flex items-center space-x-2">
                    <Switch id="required" name="required" checked={!!formData.required} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))} />
                    <Label htmlFor="required">اجباری</Label>
                  </div>

                  {/* Description */}
                  <div className="flex items-center space-x-2">
                    <Switch id="hasDescription" name="hasDescription" checked={!!formData.hasDescription} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDescription: checked }))} />
                    <Label htmlFor="hasDescription">توضیحات</Label>
                  </div>

                  {formData.hasDescription && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        توضیحات سوال
                      </Label>
                      <Textarea id="description" value={formData.description || ''} className="col-span-3" onChange={(e) => handleChange(e)} name="description" />
                    </div>
                  )}

                  {/* Media */}
                  <div className="flex items-center space-x-2">
                    <Switch id="hasMedia" name="hasMedia" checked={!!formData.hasMedia} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasMedia: checked }))} />
                    <Label htmlFor="hasMedia">رسانه</Label>
                  </div>

                  {formData.hasMedia && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="mediaUrl" className="text-right">
                        آدرس رسانه
                      </Label>
                      <Input id="mediaUrl" value={formData.mediaUrl || ''} className="col-span-3" onChange={(e) => handleChange(e)} name="mediaUrl" />

                      <Label htmlFor="mediaType" className="text-right">
                        نوع رسانه
                      </Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, mediaType: value }))} defaultValue={formData.mediaType || 'image'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="انتخاب نوع رسانه" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">تصویر</SelectItem>
                          <SelectItem value="video">ویدیو</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Question Type Specific Settings */}
            {formData.type === 'چندگزینه‌ای' && (
              <AccordionItem value="multipleChoice">
                <AccordionTrigger>چندگزینه‌ای</AccordionTrigger>
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
              <AccordionItem value="scale">
                <AccordionTrigger>طیفی</AccordionTrigger>
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
              <AccordionItem value="rating">
                <AccordionTrigger>درجه‌بندی</AccordionTrigger>
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
              <AccordionItem value="text">
                <AccordionTrigger>متنی</AccordionTrigger>
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
              <AccordionItem value="number">
                <AccordionTrigger>عددی</AccordionTrigger>
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
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            انصراف
          </Button>
          <Button type="button" onClick={handleSave}>
            ذخیره
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
