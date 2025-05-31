import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2, GripVertical, Upload, Image as ImageIcon, Star, Heart, ThumbsUp, Play, Video } from 'lucide-react';
import { Question } from '../pages/Index';

interface QuestionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (question: Question) => void;
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
  const [localQuestion, setLocalQuestion] = useState<Question | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newDropdownOption, setNewDropdownOption] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (question) {
      const updatedQuestion = { ...question };
      
      // For new questions, empty the label and set required to true by default
      if (isNewQuestion) {
        updatedQuestion.label = '';
        updatedQuestion.required = true;
      }
      
      setLocalQuestion(updatedQuestion);
      setHasChanges(isNewQuestion);
    }
  }, [question, isNewQuestion]);

  if (!localQuestion) return null;

  const handleUpdateField = (field: keyof Question, value: any) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Check if title is required and empty
    if (!localQuestion.label.trim()) {
      // Focus on the title input if it's empty
      inputRef.current?.focus();
      return;
    }
    
    if (hasChanges && localQuestion) {
      onSave(localQuestion);
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (isNewQuestion) {
      onCancel();
    } else {
      setHasChanges(false);
      onClose();
    }
  };

  // Helper functions for different question types
  const addOption = () => {
    const currentOptions = localQuestion.options || [];
    const newOptions = [...currentOptions, `گزینه ${currentOptions.length + 1}`];
    handleUpdateField('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (localQuestion.options && localQuestion.options.length > 2) {
      const newOptions = localQuestion.options.filter((_, i) => i !== index);
      handleUpdateField('options', newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (localQuestion.options) {
      const newOptions = [...localQuestion.options];
      newOptions[index] = value;
      handleUpdateField('options', newOptions);
    }
  };

  // Dropdown options management
  const addDropdownOption = () => {
    if (newDropdownOption.trim()) {
      const currentOptions = localQuestion.options || [];
      const newOptions = [...currentOptions, newDropdownOption.trim()];
      handleUpdateField('options', newOptions);
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
    if (localQuestion.options && localQuestion.options.length > 1) {
      const newOptions = localQuestion.options.filter((_, i) => i !== index);
      handleUpdateField('options', newOptions);
    }
  };

  // Matrix functions - fixed to ensure minimum 2 items
  const addRow = () => {
    const currentRows = localQuestion.rows || ['سطر ۱', 'سطر ۲'];
    const newRows = [...currentRows, `سطر ${currentRows.length + 1}`];
    handleUpdateField('rows', newRows);
  };

  const removeRow = (index: number) => {
    if (localQuestion.rows && localQuestion.rows.length > 2) {
      const newRows = localQuestion.rows.filter((_, i) => i !== index);
      handleUpdateField('rows', newRows);
    }
  };

  const updateRow = (index: number, value: string) => {
    if (localQuestion.rows) {
      const newRows = [...localQuestion.rows];
      newRows[index] = value;
      handleUpdateField('rows', newRows);
    }
  };

  const addColumn = () => {
    const currentColumns = localQuestion.columns || ['ستون ۱', 'ستون ۲'];
    const newColumns = [...currentColumns, `ستون ${currentColumns.length + 1}`];
    handleUpdateField('columns', newColumns);
  };

  const removeColumn = (index: number) => {
    if (localQuestion.columns && localQuestion.columns.length > 2) {
      const newColumns = localQuestion.columns.filter((_, i) => i !== index);
      handleUpdateField('columns', newColumns);
    }
  };

  const updateColumn = (index: number, value: string) => {
    if (localQuestion.columns) {
      const newColumns = [...localQuestion.columns];
      newColumns[index] = value;
      handleUpdateField('columns', newColumns);
    }
  };

  // Image choice functions - fixed
  const addImageOption = () => {
    const currentOptions = localQuestion.imageOptions || [{ text: 'گزینه ۱', imageUrl: '' }, { text: 'گزینه ۲', imageUrl: '' }];
    const newOptions = [...currentOptions, { text: `گزینه ${currentOptions.length + 1}`, imageUrl: '' }];
    handleUpdateField('imageOptions', newOptions);
  };

  const removeImageOption = (index: number) => {
    if (localQuestion.imageOptions && localQuestion.imageOptions.length > 2) {
      const newOptions = localQuestion.imageOptions.filter((_, i) => i !== index);
      handleUpdateField('imageOptions', newOptions);
    }
  };

  const updateImageOption = (index: number, field: 'text' | 'imageUrl', value: string) => {
    if (localQuestion.imageOptions) {
      const newOptions = [...localQuestion.imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      handleUpdateField('imageOptions', newOptions);
    }
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateImageOption(index, 'imageUrl', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasOptions = localQuestion.type === 'چندگزینه‌ای';
  const isMultiChoice = localQuestion.type === 'چندگزینه‌ای';
  const isDropdown = localQuestion.type === 'لیست کشویی';
  const isScale = localQuestion.type === 'طیفی';
  const isText = localQuestion.type === 'متنی';
  const isNumber = localQuestion.type === 'عددی';
  const isMatrix = localQuestion.type === 'ماتریسی';
  const isPriority = localQuestion.type === 'اولویت‌دهی';
  const isImageChoice = localQuestion.type === 'چند‌گزینه‌ای تصویری';
  const isQuestionGroup = localQuestion.type === 'گروه سوال';
  const isDescription = localQuestion.type === 'متن بدون پاسخ';
  const isRating = localQuestion.type === 'درجه‌بندی';
  const isEmail = localQuestion.type === 'ایمیل';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-screen p-0 m-0 rounded-none font-vazirmatn" dir="rtl">
        <div className="flex h-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="absolute left-4 top-4 z-10 w-8 h-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="w-80 border-l border-gray-200 bg-gray-50/50 flex flex-col h-full">
            {/* Fixed header with question type */}
            <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                  {localQuestion.type}
                </span>
              </div>
              <div>
                <Label htmlFor="question-label" className="text-sm font-medium">
                  {isQuestionGroup ? 'متن گروه سوال' : 'عنوان سوال'}
                  <span className="text-red-500 mr-1">*</span>
                </Label>
                <Input
                  ref={inputRef}
                  id="question-label"
                  value={localQuestion.label}
                  onChange={(e) => handleUpdateField('label', e.target.value)}
                  placeholder={isQuestionGroup ? "عنوان گروه سوال را وارد کنید" : "عنوان سوال را وارد کنید"}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 pb-20">
                {/* Question Description */}
                {!isQuestionGroup && !isDescription && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">توضیحات سوال</Label>
                      <Switch
                        checked={localQuestion.hasDescription || false}
                        onCheckedChange={(checked) => handleUpdateField('hasDescription', checked)}
                      />
                    </div>
                    {localQuestion.hasDescription && (
                      <Textarea
                        value={localQuestion.description || ''}
                        onChange={(e) => handleUpdateField('description', e.target.value)}
                        placeholder="توضیحات اضافی برای سوال"
                        className="min-h-[80px]"
                      />
                    )}
                  </div>
                )}

                {/* Required field for non-description questions */}
                {!isDescription && !isQuestionGroup && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="required-toggle" className="text-sm font-medium">
                      سوال اجباری
                    </Label>
                    <Switch
                      id="required-toggle"
                      checked={localQuestion.required || false}
                      onCheckedChange={(checked) => handleUpdateField('required', checked)}
                    />
                  </div>
                )}

                {/* Image/Video Upload for all question types */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {isQuestionGroup || isDescription ? 'تصویر/ویدیو' : 'تصویر'}
                    </Label>
                    <Switch
                      checked={localQuestion.hasMedia || false}
                      onCheckedChange={(checked) => handleUpdateField('hasMedia', checked)}
                    />
                  </div>
                  {localQuestion.hasMedia && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="w-4 h-4 ml-2" />
                        آپلود تصویر
                      </Button>
                      {(isQuestionGroup || isDescription) && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Video className="w-4 h-4 ml-2" />
                          آپلود ویدیو
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Scale Question Settings */}
                {isScale && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">تنظیم طیف</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">تعداد گزینه‌ها</Label>
                          <Slider
                            value={[localQuestion.scaleMax || 5]}
                            onValueChange={(value) => handleUpdateField('scaleMax', value[0])}
                            min={3}
                            max={11}
                            step={2}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>3</span>
                            <span>11</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Question Settings */}
                {isRating && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">تنظیم درجه</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">تعداد درجه‌ها (1-10)</Label>
                          <Slider
                            value={[localQuestion.ratingMax || 5]}
                            onValueChange={(value) => handleUpdateField('ratingMax', value[0])}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Question Settings */}
                {isText && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">نوع متن</Label>
                      <Select value={localQuestion.textType || 'short'} onValueChange={(value) => handleUpdateField('textType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">متن کوتاه</SelectItem>
                          <SelectItem value="long">متن بلند</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Regular Options for Multi-choice */}
                {hasOptions && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">گزینه‌ها</Label>
                      <Button size="sm" variant="outline" onClick={addOption} className="h-8 px-2">
                        <Plus className="w-4 h-4 ml-1" />
                        افزودن
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(localQuestion.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1"
                          />
                          {(localQuestion.options?.length || 2) > 2 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOption(index)}
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advanced Multi-choice Settings */}
                {isMultiChoice && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900">تنظیمات پیشرفته</h4>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'hasOther', label: 'گزینه سایر' },
                        { key: 'hasNone', label: 'گزینه هیچکدام' },
                        { key: 'hasAll', label: 'گزینه همه موارد' },
                        { key: 'isRequired', label: 'پاسخ اجباری باشد' },
                        { key: 'isMultiSelect', label: 'سوال چند انتخابی' },
                        { key: 'randomizeOptions', label: 'گزینه‌های تصادفی' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{label}</Label>
                          <Switch
                            checked={localQuestion[key as keyof Question] as boolean || false}
                            onCheckedChange={(checked) => handleUpdateField(key as keyof Question, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed footer with save/cancel buttons */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  className="flex-1" 
                  disabled={!hasChanges || !localQuestion.label.trim()}
                >
                  ذخیره
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  انصراف
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium mb-6 text-gray-800 border-b border-gray-200 pb-3">پیش‌نمایش سوال</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      {localQuestion.label}
                      {(localQuestion.required || localQuestion.isRequired) && <span className="text-red-500 mr-1">*</span>}
                    </Label>
                    
                    {localQuestion.hasDescription && localQuestion.description && (
                      <p className="text-sm text-gray-600 mt-1 mb-3">{localQuestion.description}</p>
                    )}
                    
                    <div className="mt-3">
                      {/* Preview content based on question type */}
                      {isText && (
                        localQuestion.textType === 'long' ? (
                          <Textarea
                            placeholder="پاسخ خود را وارد کنید"
                            disabled
                            className="bg-gray-50 min-h-[100px]"
                          />
                        ) : (
                          <Input
                            placeholder="پاسخ خود را وارد کنید"
                            disabled
                            className="bg-gray-50"
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
