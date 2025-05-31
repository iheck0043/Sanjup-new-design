import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2, GripVertical, Upload, Image as ImageIcon } from 'lucide-react';
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

  useEffect(() => {
    if (question) {
      setLocalQuestion({ ...question });
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
    if (localQuestion.options) {
      const newOptions = [...localQuestion.options, `گزینه ${localQuestion.options.length + 1}`];
      handleUpdateField('options', newOptions);
    } else {
      handleUpdateField('options', ['گزینه ۱', 'گزینه ۲']);
    }
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

  const addRow = () => {
    const currentRows = localQuestion.rows || [];
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
    const currentColumns = localQuestion.columns || [];
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

  const addImageOption = () => {
    const currentOptions = localQuestion.imageOptions || [];
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

  const hasOptions = localQuestion.type === 'چندگزینه‌ای' || localQuestion.type === 'لیست کشویی';
  const isMultiChoice = localQuestion.type === 'چندگزینه‌ای';
  const isScale = localQuestion.type === 'طیفی';
  const isText = localQuestion.type === 'متنی';
  const isNumber = localQuestion.type === 'عددی';
  const isMatrix = localQuestion.type === 'ماتریسی';
  const isPriority = localQuestion.type === 'اولویت‌دهی';
  const isImageChoice = localQuestion.type === 'چند‌گزینه‌ای تصویری';
  const isQuestionGroup = localQuestion.type === 'گروه سوال';
  const isDescription = localQuestion.type === 'متن بدون پاسخ';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-screen p-0 m-0 rounded-none" dir="rtl">
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
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="question-label" className="text-sm font-medium">
                    {isQuestionGroup ? 'متن گروه سوال' : 'عنوان سوال'}
                  </Label>
                  <Input
                    id="question-label"
                    value={localQuestion.label}
                    onChange={(e) => handleUpdateField('label', e.target.value)}
                    className="mt-2"
                  />
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
                            {localQuestion.rows && localQuestion.rows.length > 2 && (
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
                            {localQuestion.columns && localQuestion.columns.length > 2 && (
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

                {/* Priority Question Settings - using options */}
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
                          {localQuestion.options && localQuestion.options.length > 2 && (
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
                            {localQuestion.imageOptions && localQuestion.imageOptions.length > 2 && (
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
                            <Button variant="outline" size="sm" className="w-full">
                              <Upload className="w-4 h-4 ml-2" />
                              آپلود تصویر
                            </Button>
                            {option.imageUrl && (
                              <div className="w-full h-20 bg-gray-100 rounded-md flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                <span className="text-xs text-gray-500 mr-2">پیش‌نمایش تصویر</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Options for Multi-choice and Dropdown */}
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
                          {localQuestion.options && localQuestion.options.length > 2 && (
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

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={!hasChanges}>
                  ذخیره
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  انصراف
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section - keeping existing code */}
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
                    
                    <div className="mt-3">
                      {localQuestion.type === 'متنی' && (
                        <Textarea
                          placeholder={localQuestion.placeholder || 'پاسخ خود را وارد کنید'}
                          disabled
                          className="bg-gray-50 min-h-[100px]"
                        />
                      )}
                      
                      {localQuestion.type === 'عددی' && (
                        <Input
                          type="number"
                          placeholder="عدد را وارد کنید"
                          disabled
                          className="bg-gray-50"
                        />
                      )}
                      
                      {localQuestion.type === 'ایمیل' && (
                        <Input
                          type="email"
                          placeholder="ایمیل خود را وارد کنید"
                          disabled
                          className="bg-gray-50"
                        />
                      )}

                      {localQuestion.type === 'توضیح' && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {localQuestion.placeholder || 'متن توضیحات اینجا قرار می‌گیرد'}
                        </div>
                      )}
                      
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
