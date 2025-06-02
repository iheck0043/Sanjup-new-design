import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { Question } from '../pages/QuestionnaireForm';

interface Condition {
  id: string;
  sourceOption: string;
  targetQuestionId: string;
}

interface ConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  questions: Question[];
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
}

const ConditionalLogicModal: React.FC<ConditionalLogicModalProps> = ({
  isOpen,
  onClose,
  question,
  questions,
  onUpdateQuestion,
}) => {
  const [conditions, setConditions] = useState<Condition[]>([]);

  useEffect(() => {
    if (question?.conditions) {
      setConditions([...question.conditions]);
    } else {
      setConditions([]);
    }
  }, [question]);

  if (!question) return null;

  const hasOptions = question.type === 'چندگزینه‌ای' || question.type === 'چندگزینه‌ای تصویری' || question.type === 'لیست کشویی';

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sourceOption: '',
      targetQuestionId: '',
    };
    setConditions(prev => [...prev, newCondition]);
  };

  const removeCondition = (conditionId: string) => {
    setConditions(prev => prev.filter(c => c.id !== conditionId));
  };

  const updateCondition = (conditionId: string, field: keyof Condition, value: string) => {
    setConditions(prev => prev.map(c => 
      c.id === conditionId ? { ...c, [field]: value } : c
    ));
  };

  const handleSave = () => {
    onUpdateQuestion(question.id, { conditions });
    onClose();
  };

  const targetQuestions = questions.filter((q, index) => {
    const currentIndex = questions.findIndex(iq => iq.id === question.id);
    return index > currentIndex;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">شرط‌گذاری سوال</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!hasOptions ? (
          <div className="text-center py-8">
            <p className="text-gray-500">این نوع سوال امکان شرط‌گذاری ندارد</p>
            <p className="text-sm text-gray-400 mt-2">فقط سوالات چندگزینه‌ای امکان شرط‌گذاری دارند</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">سوال: {question.label}</Label>
            </div>

            <div className="space-y-4">
              {conditions.map((condition) => (
                <div key={condition.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-sm">شرط جدید</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">اگر گزینه:</Label>
                      <Select 
                        value={condition.sourceOption} 
                        onValueChange={(value) => updateCondition(condition.id, 'sourceOption', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="انتخاب گزینه" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options?.map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">انتخاب شد، برو به سوال:</Label>
                      <Select 
                        value={condition.targetQuestionId} 
                        onValueChange={(value) => updateCondition(condition.id, 'targetQuestionId', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="انتخاب سوال" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetQuestions.map((targetQuestion, index) => (
                            <SelectItem key={targetQuestion.id} value={targetQuestion.id}>
                              {targetQuestion.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                onClick={addCondition}
                variant="outline" 
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 ml-2" />
                افزودن شرط جدید
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                ذخیره شرط‌ها
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                انصراف
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalLogicModal;
