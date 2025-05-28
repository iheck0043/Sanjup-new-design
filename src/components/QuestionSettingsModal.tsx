
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2 } from 'lucide-react';
import { Question } from '../pages/Index';

interface QuestionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
}

const QuestionSettingsModal: React.FC<QuestionSettingsModalProps> = ({
  isOpen,
  onClose,
  question,
  onUpdateQuestion,
}) => {
  const [localQuestion, setLocalQuestion] = useState<Question | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (question) {
      setLocalQuestion({ ...question });
      setHasChanges(false);
    }
  }, [question]);

  if (!localQuestion) return null;

  const handleUpdateField = (field: keyof Question, value: any) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (hasChanges) {
      onUpdateQuestion(localQuestion.id, localQuestion);
    }
    onClose();
  };

  const handleCancel = () => {
    setHasChanges(false);
    onClose();
  };

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

  const hasOptions = localQuestion.type === 'چندگزینه‌ای' || localQuestion.type === 'چندگزینه‌ای تصویری' || localQuestion.type === 'لیست کشویی';

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
                    عنوان سوال
                  </Label>
                  <Input
                    id="question-label"
                    value={localQuestion.label}
                    onChange={(e) => handleUpdateField('label', e.target.value)}
                    className="mt-2"
                  />
                </div>

                {(localQuestion.type === 'متنی با پاسخ کوتاه' || localQuestion.type === 'متنی با پاسخ بلند') && (
                  <div>
                    <Label htmlFor="question-placeholder" className="text-sm font-medium">
                      متن راهنما
                    </Label>
                    <Input
                      id="question-placeholder"
                      value={localQuestion.placeholder || ''}
                      onChange={(e) => handleUpdateField('placeholder', e.target.value)}
                      className="mt-2"
                      placeholder="متن راهنما برای کاربر"
                    />
                  </div>
                )}

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

                {hasOptions && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">گزینه‌ها</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addOption}
                        className="h-8 px-2"
                      >
                        <Plus className="w-4 h-4 ml-1" />
                        افزودن
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {localQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1"
                            placeholder={`گزینه ${index + 1}`}
                          />
                          {localQuestion.options && localQuestion.options.length > 2 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOption(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  className="flex-1"
                  disabled={!hasChanges}
                >
                  ذخیره
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  انصراف
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-white overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium mb-6 text-gray-800 border-b border-gray-200 pb-3">پیش‌نمایش سوال</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      {localQuestion.label}
                      {localQuestion.required && <span className="text-red-500 mr-1">*</span>}
                    </Label>
                    
                    <div className="mt-3">
                      {localQuestion.type === 'متنی با پاسخ کوتاه' && (
                        <Input
                          placeholder={localQuestion.placeholder || 'پاسخ خود را وارد کنید'}
                          disabled
                          className="bg-gray-50"
                        />
                      )}
                      
                      {localQuestion.type === 'متنی با پاسخ بلند' && (
                        <Textarea
                          placeholder={localQuestion.placeholder || 'پاسخ خود را وارد کنید'}
                          disabled
                          className="bg-gray-50 min-h-[100px]"
                        />
                      )}
                      
                      {localQuestion.type === 'عدد' && (
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
                      
                      {hasOptions && localQuestion.options && (
                        <div className="space-y-3">
                          {localQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <input
                                type={localQuestion.type === 'چندگزینه‌ای' ? 'checkbox' : 'radio'}
                                name="preview-options"
                                disabled
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </div>
                          ))}
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
