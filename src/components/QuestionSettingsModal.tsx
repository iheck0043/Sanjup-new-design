
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Video } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Question } from '../types/Question';
import ScaleSettings from './question-settings/ScaleSettings';
import RatingSettings from './question-settings/RatingSettings';
import TextSettings from './question-settings/TextSettings';
import NumberSettings from './question-settings/NumberSettings';
import MatrixSettings from './question-settings/MatrixSettings';
import OptionsSettings from './question-settings/OptionsSettings';
import ImageOptionsSettings from './question-settings/ImageOptionsSettings';
import DropdownSettings from './question-settings/DropdownSettings';
import AdvancedSettings from './question-settings/AdvancedSettings';
import QuestionPreview from './question-settings/QuestionPreview';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (question) {
      const updatedQuestion = { ...question };
      
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
    if (!localQuestion.label.trim()) {
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
      <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 m-0 rounded-none font-vazirmatn" dir="rtl">
        <DialogTitle className="sr-only">تنظیمات سوال</DialogTitle>
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

            {/* Scrollable content area */}
            <ScrollArea className="flex-1">
              <div className="p-6 pb-0">
                <div className="space-y-6">
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

                  {/* Question Type Specific Settings */}
                  {isScale && <ScaleSettings question={localQuestion} onUpdate={handleUpdateField} />}
                  {isRating && <RatingSettings question={localQuestion} onUpdate={handleUpdateField} />}
                  {isText && <TextSettings question={localQuestion} onUpdate={handleUpdateField} />}
                  {isNumber && <NumberSettings question={localQuestion} onUpdate={handleUpdateField} />}
                  {isMatrix && <MatrixSettings question={localQuestion} onUpdate={handleUpdateField} />}
                  {isPriority && <OptionsSettings question={localQuestion} onUpdate={handleUpdateField} questionType="priority" />}
                  {isImageChoice && <ImageOptionsSettings question={localQuestion} onUpdate={handleUpdateField} />}
                  {hasOptions && <OptionsSettings question={localQuestion} onUpdate={handleUpdateField} questionType="multi-choice" />}
                  {isDropdown && <DropdownSettings question={localQuestion} onUpdate={handleUpdateField} />}

                  {/* Advanced Multi-choice Settings */}
                  {isMultiChoice && <AdvancedSettings question={localQuestion} onUpdate={handleUpdateField} />}
                </div>
              </div>
            </ScrollArea>

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
          <div className="flex-1 flex flex-col bg-white h-full">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-800">پیش‌نمایش سوال</h3>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <QuestionPreview question={localQuestion} />
                </div>
              </div>
            </ScrollArea>

            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex gap-2 max-w-2xl mx-auto">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionSettingsModal;
