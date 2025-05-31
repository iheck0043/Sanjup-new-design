import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, ChevronUp, ChevronDown, Star, Heart, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [formData, setFormData] = useState<Question>({
    id: '',
    type: 'متنی با پاسخ کوتاه',
    label: '',
    required: true,
    hasDescription: false,
    description: '',
    hasMedia: false,
    mediaUrl: '',
    mediaType: 'image',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (question) {
      if (isNewQuestion) {
        // For new questions, start with empty label and placeholder
        setFormData({
          ...question,
          label: '',
          required: true,
          hasDescription: false,
          description: '',
          hasMedia: false,
          mediaUrl: '',
          mediaType: 'image',
        });
      } else {
        // For existing questions, load current data
        setFormData(question);
      }
    }
    setErrors({});
  }, [question, isNewQuestion]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.label.trim()) {
      newErrors.label = 'عنوان سوال اجباری است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    onSave(formData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          mediaUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newOptions = [...(formData.imageOptions || [])];
        newOptions[index] = {
          ...newOptions[index],
          imageUrl: e.target?.result as string,
        };
        setFormData(prev => ({
          ...prev,
          imageOptions: newOptions,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions for different question types
  const addOption = () => {
    const currentOptions = formData.options || ['گزینه ۱', 'گزینه ۲'];
    const newOptions = [...currentOptions, `گزینه ${currentOptions.length + 1}`];
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options && formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    if (formData.options) {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  // Dropdown options management
  const addDropdownOption = () => {
    if (newDropdownOption.trim()) {
      const currentOptions = formData.options || [];
      const newOptions = [...currentOptions, newDropdownOption.trim()];
      setFormData(prev => ({
        ...prev,
        options: newOptions
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
    if (formData.options && formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  // Matrix functions - fixed to ensure minimum 2 items
  const addRow = () => {
    const currentRows = formData.rows || ['سطر ۱', 'سطر ۲'];
    const newRows = [...currentRows, `سطر ${currentRows.length + 1}`];
    setFormData(prev => ({
      ...prev,
      rows: newRows
    }));
  };

  const removeRow = (index: number) => {
    if (formData.rows && formData.rows.length > 2) {
      const newRows = formData.rows.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        rows: newRows
      }));
    }
  };

  const updateRow = (index: number, value: string) => {
    if (formData.rows) {
      const newRows = [...formData.rows];
      newRows[index] = value;
      setFormData(prev => ({
        ...prev,
        rows: newRows
      }));
    }
  };

  const addColumn = () => {
    const currentColumns = formData.columns || ['ستون ۱', 'ستون ۲'];
    const newColumns = [...currentColumns, `ستون ${currentColumns.length + 1}`];
    setFormData(prev => ({
      ...prev,
      columns: newColumns
    }));
  };

  const removeColumn = (index: number) => {
    if (formData.columns && formData.columns.length > 2) {
      const newColumns = formData.columns.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        columns: newColumns
      }));
    }
  };

  const updateColumn = (index: number, value: string) => {
    if (formData.columns) {
      const newColumns = [...formData.columns];
      newColumns[index] = value;
      setFormData(prev => ({
        ...prev,
        columns: newColumns
      }));
    }
  };

  // Image choice functions - fixed
  const addImageOption = () => {
    const currentOptions = formData.imageOptions || [{ text: 'گزینه ۱', imageUrl: '' }, { text: 'گزینه ۲', imageUrl: '' }];
    const newOptions = [...currentOptions, { text: `گزینه ${currentOptions.length + 1}`, imageUrl: '' }];
    setFormData(prev => ({
      ...prev,
      imageOptions: newOptions
    }));
  };

  const removeImageOption = (index: number) => {
    if (formData.imageOptions && formData.imageOptions.length > 2) {
      const newOptions = formData.imageOptions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        imageOptions: newOptions
      }));
    }
  };

  const updateImageOption = (index: number, field: 'text' | 'imageUrl', value: string) => {
    if (formData.imageOptions) {
      const newOptions = [...formData.imageOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      setFormData(prev => ({
        ...prev,
        imageOptions: newOptions
      }));
    }
  };

  const addChip = (inputValue: string, field: 'options' | 'rows' | 'columns') => {
    if (inputValue.trim()) {
      const currentArray = formData[field] || [];
      setFormData(prev => ({
        ...prev,
        [field]: [...currentArray, inputValue.trim()]
      }));
      return '';
    }
    return inputValue;
  };

  const removeChip = (index: number, field: 'options' | 'rows' | 'columns') => {
    const currentArray = formData[field] || [];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const ChipsInput: React.FC<{
    label: string;
    field: 'options' | 'rows' | 'columns';
    placeholder: string;
  }> = ({ label, field, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const items = formData[field] || [];

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newValue = addChip(inputValue, field);
        setInputValue(newValue);
      }
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-[80px] bg-gray-50">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
            >
              <span>{item}</span>
              <button
                onClick={() => removeChip(index, field)}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 min-w-[120px] border-none shadow-none focus:ring-0 bg-transparent"
          />
        </div>
      </div>
    );
  };

  const getQuestionTypeLabel = (type: string) => {
    return type;
  };

  const renderPreview = () => {
    const previewData = {
      ...formData,
      label: formData.label || 'پیش‌نمایش سوال'
    };

    switch (previewData.type) {
      case 'متنی با پاسخ کوتاه':
      case 'متنی با پاسخ بلند':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            {previewData.textType === 'long' ? (
              <Textarea placeholder="پاسخ خود را اینجا بنویسید..." className="w-full" />
            ) : (
              <Input placeholder="پاسخ کوتاه..." className="w-full" />
            )}
            {(previewData.minChars || previewData.maxChars) && (
              <p className="text-xs text-gray-500">
                {previewData.minChars && `حداقل ${previewData.minChars} کاراکتر`}
                {previewData.minChars && previewData.maxChars && ' - '}
                {previewData.maxChars && `حداکثر ${previewData.maxChars} کاراکتر`}
              </p>
            )}
          </div>
        );

      case 'چندگزینه‌ای':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <div className="space-y-2">
              {(previewData.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
                <label key={index} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type={previewData.isMultiSelect ? 'checkbox' : 'radio'} 
                    name="preview-option" 
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'لیست کشویی':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>انتخاب کنید...</option>
              {(previewData.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
                <option key={index}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'طیفی':
        const scaleRange = Array.from(
          { length: (previewData.scaleMax || 5) - (previewData.scaleMin || 1) + 1 },
          (_, i) => (previewData.scaleMin || 1) + i
        );
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                {scaleRange.map((num) => (
                  <label key={num} className="flex flex-col items-center gap-1 cursor-pointer">
                    <input type="radio" name="scale" className="text-blue-600" />
                    <span className="text-sm">{num}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{previewData.scaleLabels?.left || ''}</span>
                <span>{previewData.scaleLabels?.center || ''}</span>
                <span>{previewData.scaleLabels?.right || ''}</span>
              </div>
            </div>
          </div>
        );

      case 'درجه‌بندی':
        const ratingIcons = {
          star: Star,
          heart: Heart,
          thumbs: ThumbsUp,
        };
        const RatingIcon = ratingIcons[previewData.ratingStyle || 'star'];
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <div className="flex gap-1">
              {Array.from({ length: previewData.ratingMax || 5 }, (_, i) => (
                <RatingIcon 
                  key={i} 
                  className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" 
                />
              ))}
            </div>
          </div>
        );

      case 'عدد':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <Input 
              type="number" 
              placeholder="عدد را وارد کنید..." 
              min={previewData.minNumber}
              max={previewData.maxNumber}
              className="w-full" 
            />
            {(previewData.minNumber !== undefined || previewData.maxNumber !== undefined) && (
              <p className="text-xs text-gray-500">
                {previewData.minNumber !== undefined && `حداقل ${previewData.minNumber}`}
                {previewData.minNumber !== undefined && previewData.maxNumber !== undefined && ' - '}
                {previewData.maxNumber !== undefined && `حداکثر ${previewData.maxNumber}`}
              </p>
            )}
          </div>
        );

      case 'ماتریسی':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 border border-gray-200"></th>
                    {(previewData.columns || ['ستون ۱', 'ستون ۲']).map((col, index) => (
                      <th key={index} className="p-2 border border-gray-200 text-sm">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(previewData.rows || ['سطر ۱', 'سطر ۲']).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 border border-gray-200 font-medium text-sm">{row}</td>
                      {(previewData.columns || ['ستون ۱', 'ستون ۲']).map((_, colIndex) => (
                        <td key={colIndex} className="p-2 border border-gray-200 text-center">
                          <input type="radio" name={`matrix-${rowIndex}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'اولویت‌دهی':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <div className="space-y-2">
              {(previewData.options || ['گزینه ۱', 'گزینه ۲']).map((option, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1">{option}</span>
                  <div className="flex gap-1">
                    <ChevronUp className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                    <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'چند‌گزینه‌ای تصویری':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {(previewData.imageOptions || [{ text: 'گزینه ۱' }, { text: 'گزینه ۲' }]).map((option, index) => (
                <label key={index} className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  {option.imageUrl ? (
                    <img src={option.imageUrl} alt={option.text} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">بدون تصویر</span>
                    </div>
                  )}
                  <input type="checkbox" className="text-blue-600" />
                  <span className="text-sm text-center">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'متن بدون پاسخ':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{previewData.label}</h4>
            {previewData.hasDescription && previewData.description && (
              <p className="text-sm text-gray-600">{previewData.description}</p>
            )}
            <p className="text-sm text-gray-500">پیش‌نمایش برای این نوع سوال موجود نیست</p>
          </div>
        );
    }
  };

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isNewQuestion ? 'افزودن سوال جدید' : 'ویرایش سوال'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Settings Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Question Type Display */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700">نوع سوال</Label>
              <div className="mt-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {getQuestionTypeLabel(formData.type)}
              </div>
            </div>

            {/* Question Title */}
            <div className="mb-6">
              <Label htmlFor="label" className="text-sm font-medium text-gray-700">
                عنوان سوال *
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="عنوان سوال خود را وارد کنید..."
                className={`mt-1 ${errors.label ? 'border-red-500' : ''}`}
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600">{errors.label}</p>
              )}
            </div>

            {/* Question Description */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">توضیحات سوال</Label>
                <Switch
                  checked={formData.hasDescription}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDescription: checked }))}
                />
              </div>
              {formData.hasDescription && (
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="توضیحات اضافی برای سوال..."
                  className="mt-2"
                  rows={3}
                />
              )}
            </div>

            {/* Media Upload */}
            {formData.type !== 'گروه سوال' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {(formData.type === 'متن بدون پاسخ' || formData.type === 'گروه سوال') ? 'رسانه (تصویر/ویدیو)' : 'تصویر'}
                  </Label>
                  <Switch
                    checked={formData.hasMedia}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasMedia: checked }))}
                  />
                </div>
                {formData.hasMedia && (
                  <div className="space-y-3">
                    {(formData.type === 'متن بدون پاسخ' || formData.type === 'گروه سوال') && (
                      <RadioGroup
                        value={formData.mediaType}
                        onValueChange={(value: 'image' | 'video') => setFormData(prev => ({ ...prev, mediaType: value }))}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="image" id="image" />
                          <Label htmlFor="image">تصویر</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="video" id="video" />
                          <Label htmlFor="video">ویدیو</Label>
                        </div>
                      </RadioGroup>
                    )}
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                        onChange={handleImageUpload}
                        className="hidden"
                        id="media-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('media-upload')?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        {formData.mediaType === 'video' ? 'آپلود ویدیو' : 'آپلود تصویر'}
                      </Button>
                      {formData.mediaUrl && (
                        <div className="mt-2">
                          {formData.mediaType === 'video' ? (
                            <video src={formData.mediaUrl} controls className="w-full max-h-48 rounded-lg" />
                          ) : (
                            <img src={formData.mediaUrl} alt="Uploaded" className="w-full max-h-48 object-cover rounded-lg" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Required Switch */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">سوال اجباری</Label>
                <Switch
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
                />
              </div>
            </div>

            {/* Type-specific settings */}
            {formData.type === 'چندگزینه‌ای' && (
              <div className="space-y-4">
                <ChipsInput
                  label="گزینه‌ها"
                  field="options"
                  placeholder="گزینه جدید را تایپ کنید و Enter بزنید..."
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">چندانتخابی</Label>
                    <Switch
                      checked={formData.isMultiSelect}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMultiSelect: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">گزینه "سایر"</Label>
                    <Switch
                      checked={formData.hasOther}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOther: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">گزینه "هیچ‌کدام"</Label>
                    <Switch
                      checked={formData.hasNone}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasNone: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">گزینه "همه"</Label>
                    <Switch
                      checked={formData.hasAll}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasAll: checked }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">ترتیب تصادفی</Label>
                  <Switch
                    checked={formData.randomizeOptions}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomizeOptions: checked }))}
                  />
                </div>
              </div>
            )}

            {formData.type === 'لیست کشویی' && (
              <ChipsInput
                label="گزینه‌ها"
                field="options"
                placeholder="گزینه جدید را تایپ کنید و Enter بزنید..."
              />
            )}

            {formData.type === 'طیفی' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">تنظیم طیف</Label>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">محدوده: {formData.scaleMin || 1} تا {formData.scaleMax || 5}</span>
                      </div>
                      <Slider
                        value={[formData.scaleMax || 5]}
                        onValueChange={([value]) => {
                          const newMax = value % 2 === 1 ? value : value - 1;
                          setFormData(prev => ({ 
                            ...prev, 
                            scaleMax: Math.max(3, Math.min(11, newMax)),
                            scaleMin: 1
                          }));
                        }}
                        min={3}
                        max={11}
                        step={2}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">یا مقدار دستی وارد کنید:</Label>
                      <Input
                        type="number"
                        value={formData.scaleMax || 5}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 3 && value <= 11 && value % 2 === 1) {
                            setFormData(prev => ({ ...prev, scaleMax: value, scaleMin: 1 }));
                          }
                        }}
                        min={3}
                        max={11}
                        step={2}
                        className="mt-1 w-32"
                      />
                      <p className="text-xs text-gray-500 mt-1">فقط اعداد فرد بین 3 تا 11</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">برچسب راست</Label>
                    <Input
                      value={formData.scaleLabels?.right || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scaleLabels: { ...prev.scaleLabels, right: e.target.value }
                      }))}
                      placeholder="مثل: خیلی بد"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">برچسب وسط</Label>
                    <Input
                      value={formData.scaleLabels?.center || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scaleLabels: { ...prev.scaleLabels, center: e.target.value }
                      }))}
                      placeholder="مثل: متوسط"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">برچسب چپ</Label>
                    <Input
                      value={formData.scaleLabels?.left || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scaleLabels: { ...prev.scaleLabels, left: e.target.value }
                      }))}
                      placeholder="مثل: خیلی خوب"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'درجه‌بندی' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">تنظیم درجه</Label>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">تعداد درجه: {formData.ratingMax || 5}</span>
                      </div>
                      <Slider
                        value={[formData.ratingMax || 5]}
                        onValueChange={([value]) => setFormData(prev => ({ ...prev, ratingMax: value }))}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">شکل درجه‌بندی</Label>
                  <RadioGroup
                    value={formData.ratingStyle || 'star'}
                    onValueChange={(value: 'star' | 'heart' | 'thumbs') => setFormData(prev => ({ ...prev, ratingStyle: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="star" id="star" />
                      <Label htmlFor="star" className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        ستاره
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="heart" id="heart" />
                      <Label htmlFor="heart" className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        قلب
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="thumbs" id="thumbs" />
                      <Label htmlFor="thumbs" className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-blue-500" />
                        لایک
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {(formData.type === 'متنی با پاسخ کوتاه' || formData.type === 'متنی با پاسخ بلند') && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">نوع متن</Label>
                  <RadioGroup
                    value={formData.textType || 'short'}
                    onValueChange={(value: 'short' | 'long') => setFormData(prev => ({ ...prev, textType: value }))}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">متن کوتاه</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="long" id="long" />
                      <Label htmlFor="long">متن بلند</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">حداقل کاراکتر</Label>
                    <Input
                      type="number"
                      value={formData.minChars || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, minChars: parseInt(e.target.value) || undefined }))}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">حداکثر کاراکتر</Label>
                    <Input
                      type="number"
                      value={formData.maxChars || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxChars: parseInt(e.target.value) || undefined }))}
                      placeholder="1000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'عدد' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">حداقل عدد</Label>
                  <Input
                    type="number"
                    value={formData.minNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, minNumber: parseInt(e.target.value) || undefined }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">حداکثر عدد</Label>
                  <Input
                    type="number"
                    value={formData.maxNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxNumber: parseInt(e.target.value) || undefined }))}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {formData.type === 'ماتریسی' && (
              <div className="space-y-4">
                <ChipsInput
                  label="سطرها"
                  field="rows"
                  placeholder="سطر جدید را تایپ کنید و Enter بزنید..."
                />
                <ChipsInput
                  label="ستون‌ها"
                  field="columns"
                  placeholder="ستون جدید را تایپ کنید و Enter بزنید..."
                />
              </div>
            )}

            {formData.type === 'اولویت‌دهی' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">گزینه‌ها</Label>
                  <div className="mt-2 space-y-2">
                    {(formData.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(formData.options || [])];
                            newOptions[index] = e.target.value;
                            setFormData(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="flex-1"
                        />
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const newOptions = [...(formData.options || [])];
                              [newOptions[index], newOptions[index - 1]] = [newOptions[index - 1], newOptions[index]];
                              setFormData(prev => ({ ...prev, options: newOptions }));
                            }
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (index < (formData.options || []).length - 1) {
                              const newOptions = [...(formData.options || [])];
                              [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
                              setFormData(prev => ({ ...prev, options: newOptions }));
                            }
                          }}
                          disabled={index === (formData.options || []).length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newOptions = (formData.options || []).filter((_, i) => i !== index);
                            if (newOptions.length >= 2) {
                              setFormData(prev => ({ ...prev, options: newOptions }));
                            }
                          }}
                          disabled={(formData.options || []).length <= 2}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentOptions = formData.options || ['گزینه ۱', 'گزینه ۲'];
                        setFormData(prev => ({
                          ...prev,
                          options: [...currentOptions, `گزینه ${currentOptions.length + 1}`]
                        }));
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      افزودن گزینه
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'چند‌گزینه‌ای تصویری' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">گزینه‌ها</Label>
                  <div className="mt-2 space-y-3">
                    {(formData.imageOptions || []).map((option, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...(formData.imageOptions || [])];
                              newOptions[index] = { ...newOptions[index], text: e.target.value };
                              setFormData(prev => ({ ...prev, imageOptions: newOptions }));
                            }}
                            placeholder="متن گزینه..."
                            className="flex-1"
                          />
                          <button
                            onClick={() => {
                              const newOptions = (formData.imageOptions || []).filter((_, i) => i !== index);
                              if (newOptions.length >= 1) {
                                setFormData(prev => ({ ...prev, imageOptions: newOptions }));
                              }
                            }}
                            disabled={(formData.imageOptions || []).length <= 1}
                            className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOptionImageUpload(index, e)}
                            className="hidden"
                            id={`option-image-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById(`option-image-${index}`)?.click()}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 ml-2" />
                            آپلود تصویر
                          </Button>
                          
                          {option.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={option.imageUrl} 
                                alt={option.text} 
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentOptions = formData.imageOptions || [{ text: 'گزینه ۱' }];
                        setFormData(prev => ({
                          ...prev,
                          imageOptions: [...currentOptions, { text: `گزینه ${currentOptions.length + 1}` }]
                        }));
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      افزودن گزینه
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">پیش‌نمایش</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              {renderPreview()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel}>
            انصراف
          </Button>
          <Button onClick={handleSave}>
            {isNewQuestion ? 'افزودن سوال' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSettingsModal;
