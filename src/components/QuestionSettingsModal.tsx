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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (question) {
      const questionCopy = { ...question };
      
      // Set empty title for new questions
      if (isNewQuestion) {
        questionCopy.label = '';
        // Set required to true by default for new questions
        questionCopy.required = true;
      }
      
      setLocalQuestion(questionCopy);
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
      return; // Don't save if title is empty
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

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        handleUpdateField('mediaUrl', imageUrl);
        handleUpdateField('mediaType', 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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
        <div className="flex h-full bg-gradient-to-br from-gray-50/50 to-blue-50/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="absolute left-4 top-4 z-10 w-8 h-8 p-0 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="w-80 border-l border-gray-200/60 bg-white/80 backdrop-blur-sm flex flex-col h-full">
            {/* Header with question type */}
            <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {isNewQuestion ? 'سوال جدید' : 'ویرایش سوال'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">نوع سوال:</span>
                <span className="text-sm font-medium text-blue-600 bg-blue-100/80 px-2 py-1 rounded-md">
                  {localQuestion.type}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="question-label" className="text-sm font-medium text-red-600">
                    {isQuestionGroup ? 'متن گروه سوال' : 'عنوان سوال'} *
                  </Label>
                  <Input
                    id="question-label"
                    value={localQuestion.label}
                    onChange={(e) => handleUpdateField('label', e.target.value)}
                    className={`mt-2 ${!localQuestion.label.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder={isQuestionGroup ? 'عنوان گروه سوال را وارد کنید' : 'عنوان سوال را وارد کنید'}
                  />
                  {!localQuestion.label.trim() && (
                    <p className="text-xs text-red-500 mt-1">عنوان سوال اجباری است</p>
                  )}
                </div>

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

                {/* Required field for non-description questions - default enabled */}
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

                {/* Enhanced Image/Video Upload */}
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
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        onClick={triggerImageUpload}
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        آپلود تصویر
                      </Button>
                      {(isQuestionGroup || isDescription) && (
                        <Button variant="outline" size="sm" className="w-full hover:bg-green-50 hover:border-green-300 transition-all duration-200">
                          <Video className="w-4 h-4 ml-2" />
                          آپلود ویدیو
                        </Button>
                      )}
                      {localQuestion.mediaUrl && localQuestion.mediaType === 'image' && (
                        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border">
                          <img
                            src={localQuestion.mediaUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
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
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">یا وارد کنید</Label>
                          <Input
                            type="number"
                            value={localQuestion.scaleMax || 5}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value >= 3 && value <= 11 && value % 2 === 1) {
                                handleUpdateField('scaleMax', value);
                              }
                            }}
                            min={3}
                            max={11}
                            step={2}
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">برچسب‌های طیف</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="برچسب چپ"
                          value={localQuestion.scaleLabels?.left || ''}
                          onChange={(e) => handleUpdateField('scaleLabels', {
                            ...localQuestion.scaleLabels,
                            left: e.target.value
                          })}
                        />
                        <Input
                          placeholder="برچسب وسط"
                          value={localQuestion.scaleLabels?.center || ''}
                          onChange={(e) => handleUpdateField('scaleLabels', {
                            ...localQuestion.scaleLabels,
                            center: e.target.value
                          })}
                        />
                        <Input
                          placeholder="برچسب راست"
                          value={localQuestion.scaleLabels?.right || ''}
                          onChange={(e) => handleUpdateField('scaleLabels', {
                            ...localQuestion.scaleLabels,
                            right: e.target.value
                          })}
                        />
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
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1</span>
                            <span>10</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">یا وارد کنید</Label>
                          <Input
                            type="number"
                            value={localQuestion.ratingMax || 5}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value >= 1 && value <= 10) {
                                handleUpdateField('ratingMax', value);
                              }
                            }}
                            min={1}
                            max={10}
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">شکل درجه‌بندی</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { type: 'star', icon: <Star className="w-5 h-5" />, label: 'ستاره' },
                          { type: 'heart', icon: <Heart className="w-5 h-5" />, label: 'قلب' },
                          { type: 'thumbs', icon: <ThumbsUp className="w-5 h-5" />, label: 'لایک' }
                        ].map(({ type, icon, label }) => (
                          <button
                            key={type}
                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                              localQuestion.ratingStyle === type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleUpdateField('ratingStyle', type)}
                          >
                            {icon}
                            <span className="text-xs mt-1">{label}</span>
                          </button>
                        ))}
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
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium">حداقل کاراکتر</Label>
                        <Input
                          type="number"
                          value={localQuestion.minChars || ''}
                          onChange={(e) => handleUpdateField('minChars', parseInt(e.target.value) || 0)}
                          min={0}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">حداکثر کاراکتر</Label>
                        <Input
                          type="number"
                          value={localQuestion.maxChars || ''}
                          onChange={(e) => handleUpdateField('maxChars', parseInt(e.target.value) || 0)}
                          min={0}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Number Question Settings */}
                {isNumber && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">حداقل عدد</Label>
                      <Input
                        type="number"
                        value={localQuestion.minNumber || ''}
                        onChange={(e) => handleUpdateField('minNumber', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">حداکثر عدد</Label>
                      <Input
                        type="number"
                        value={localQuestion.maxNumber || ''}
                        onChange={(e) => handleUpdateField('maxNumber', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Matrix Question Settings */}
                {isMatrix && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">سطرها</Label>
                        <Button size="sm" variant="outline" onClick={addRow} className="h-8 px-2">
                          <Plus className="w-4 h-4 ml-1" />
                          افزودن
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(localQuestion.rows || ['سطر ۱', 'سطر ۲']).map((row, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={row}
                              onChange={(e) => updateRow(index, e.target.value)}
                              className="flex-1"
                            />
                            {(localQuestion.rows?.length || 2) > 2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeRow(index)}
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">ستون‌ها</Label>
                        <Button size="sm" variant="outline" onClick={addColumn} className="h-8 px-2">
                          <Plus className="w-4 h-4 ml-1" />
                          افزودن
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(localQuestion.columns || ['ستون ۱', 'ستون ۲']).map((column, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={column}
                              onChange={(e) => updateColumn(index, e.target.value)}
                              className="flex-1"
                            />
                            {(localQuestion.columns?.length || 2) > 2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeColumn(index)}
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Priority Question Settings */}
                {isPriority && (
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

                {/* Image Choice Question Settings */}
                {isImageChoice && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">گزینه‌ها</Label>
                      <Button size="sm" variant="outline" onClick={addImageOption} className="h-8 px-2">
                        <Plus className="w-4 h-4 ml-1" />
                        افزودن
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(localQuestion.imageOptions || [{ text: 'گزینه ۱', imageUrl: '' }, { text: 'گزینه ۲', imageUrl: '' }]).map((option, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={option.text}
                              onChange={(e) => updateImageOption(index, 'text', e.target.value)}
                              placeholder={`گزینه ${index + 1}`}
                              className="flex-1"
                            />
                            {(localQuestion.imageOptions?.length || 2) > 2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeImageOption(index)}
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Button variant="outline" size="sm" className="w-full">
                                <Upload className="w-4 h-4 ml-2" />
                                آپلود تصویر
                              </Button>
                            </div>
                            {option.imageUrl && (
                              <div className="w-full h-20 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                  src={option.imageUrl}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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

                {/* Dropdown Options */}
                {isDropdown && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">گزینه‌ها</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <Input
                          ref={inputRef}
                          value={newDropdownOption}
                          onChange={(e) => setNewDropdownOption(e.target.value)}
                          onKeyPress={handleDropdownKeyPress}
                          placeholder="گزینه جدید را تایپ کنید و Enter بزنید"
                          className="mb-2"
                        />
                        <div className="flex flex-wrap gap-2">
                          {(localQuestion.options || []).map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                            >
                              <span>{option}</span>
                              <button
                                onClick={() => removeDropdownOption(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
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

            <div className="border-t border-gray-200/60 p-4 bg-white/90 backdrop-blur-sm">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" 
                  disabled={!hasChanges || !localQuestion.label.trim()}
                >
                  ذخیره
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  className="flex-1 hover:bg-gray-50 transition-all duration-200"
                >
                  انصراف
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Preview Section */}
          <div className="flex-1 p-8 bg-gradient-to-br from-white/60 to-blue-50/30 overflow-y-auto backdrop-blur-sm">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 shadow-lg">
                <h3 className="text-xl font-semibold mb-8 text-gray-800 border-b border-gray-200/60 pb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  پیش‌نمایش سوال
                </h3>
                
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
                      {/* Text Question Preview */}
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
                      
                      {/* Number Question Preview */}
                      {isNumber && (
                        <Input
                          type="number"
                          placeholder="عدد را وارد کنید"
                          disabled
                          className="bg-gray-50"
                        />
                      )}
                      
                      {/* Email Question Preview */}
                      {isEmail && (
                        <Input
                          type="email"
                          placeholder="ایمیل خود را وارد کنید"
                          disabled
                          className="bg-gray-50"
                        />
                      )}

                      {/* Description Preview */}
                      {isDescription && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          این یک متن بدون پاسخ است که فقط اطلاعات ارائه می‌دهد
                        </div>
                      )}

                      {/* Scale Question Preview */}
                      {isScale && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{localQuestion.scaleLabels?.left || 'کم'}</span>
                            <span>{localQuestion.scaleLabels?.center || 'متوسط'}</span>
                            <span>{localQuestion.scaleLabels?.right || 'زیاد'}</span>
                          </div>
                          <div className="flex justify-between">
                            {Array.from({ length: localQuestion.scaleMax || 5 }, (_, i) => (
                              <label key={i} className="flex flex-col items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="scale-preview"
                                  disabled
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                                />
                                <span className="text-xs mt-1">{i + 1}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rating Question Preview */}
                      {isRating && (
                        <div className="flex gap-2">
                          {Array.from({ length: localQuestion.ratingMax || 5 }, (_, i) => (
                            <button key={i} className="text-gray-300 hover:text-yellow-400 disabled:cursor-not-allowed" disabled>
                              {localQuestion.ratingStyle === 'heart' && <Heart className="w-6 h-6" />}
                              {localQuestion.ratingStyle === 'thumbs' && <ThumbsUp className="w-6 h-6" />}
                              {(!localQuestion.ratingStyle || localQuestion.ratingStyle === 'star') && <Star className="w-6 h-6" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Dropdown Preview */}
                      {isDropdown && (
                        <Select disabled>
                          <SelectTrigger className="bg-gray-50">
                            <SelectValue placeholder="گزینه‌ای را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            {(localQuestion.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Matrix Preview */}
                      {isMatrix && (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                                {(localQuestion.columns || ['ستون ۱', 'ستون ۲']).map((column, index) => (
                                  <th key={index} className="border border-gray-300 p-2 bg-gray-50 text-sm">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(localQuestion.rows || ['سطر ۱', 'سطر ۲']).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td className="border border-gray-300 p-2 bg-gray-50 text-sm">{row}</td>
                                  {(localQuestion.columns || ['ستون ۱', 'ستون ۲']).map((_, colIndex) => (
                                    <td key={colIndex} className="border border-gray-300 p-2 text-center">
                                      <input
                                        type="radio"
                                        name={`matrix-${rowIndex}`}
                                        disabled
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Priority Preview */}
                      {isPriority && (
                        <div className="space-y-2">
                          {(localQuestion.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 border border-gray-200 rounded bg-gray-50 cursor-move">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{index + 1}.</span>
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Choice Preview */}
                      {isImageChoice && (
                        <div className="grid grid-cols-2 gap-4">
                          {(localQuestion.imageOptions || [{ text: 'گزینه ۱', imageUrl: '' }, { text: 'گزینه ۲', imageUrl: '' }]).map((option, index) => (
                            <label key={index} className="cursor-pointer">
                              <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                                <input
                                  type="radio"
                                  name="image-choice-preview"
                                  disabled
                                  className="sr-only"
                                />
                                <div className="space-y-2">
                                  {option.imageUrl ? (
                                    <div className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                                      <img
                                        src={option.imageUrl}
                                        alt={option.text}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                                      <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                  <p className="text-sm text-center">{option.text}</p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {/* Multi-choice Preview */}
                      {hasOptions && localQuestion.options && (
                        <div className="space-y-3">
                          {localQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <input
                                type={localQuestion.isMultiSelect ? 'checkbox' : 'radio'}
                                name="preview-options"
                                disabled
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </div>
                          ))}
                          
                          {localQuestion.hasOther && (
                            <div className="flex items-center gap-3">
                              <input
                                type={localQuestion.isMultiSelect ? 'checkbox' : 'radio'}
                                name="preview-options"
                                disabled
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">سایر:</span>
                              <Input className="text-xs h-8 bg-gray-50" disabled placeholder="توضیح دهید..." />
                            </div>
                          )}
                          
                          {localQuestion.hasNone && (
                            <div className="flex items-center gap-3">
                              <input
                                type={localQuestion.isMultiSelect ? 'checkbox' : 'radio'}
                                name="preview-options"
                                disabled
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">هیچکدام</span>
                            </div>
                          )}
                          
                          {localQuestion.hasAll && (
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                disabled
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">همه موارد</span>
                            </div>
                          )}
                        </div>
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
