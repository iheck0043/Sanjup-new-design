
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { Question } from '../pages/Index';

interface SingleCondition {
  questionId: string;
  option: string;
}

interface CombinedCondition {
  id: string;
  conditions: SingleCondition[];
  logic: 'AND' | 'OR';
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
  const [combinedConditions, setCombinedConditions] = useState<CombinedCondition[]>([]);

  useEffect(() => {
    if (question?.combinedConditions) {
      setCombinedConditions([...question.combinedConditions]);
    } else {
      setCombinedConditions([]);
    }
  }, [question]);

  if (!question) return null;

  const hasOptions = question.type === 'چندگزینه‌ای' || question.type === 'چندگزینه‌ای تصویری' || question.type === 'لیست کشویی';

  const addCombinedCondition = () => {
    const newCondition: CombinedCondition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      conditions: [{ questionId: '', option: '' }],
      logic: 'AND',
      targetQuestionId: '',
    };
    setCombinedConditions(prev => [...prev, newCondition]);
  };

  const removeCombinedCondition = (conditionId: string) => {
    setCombinedConditions(prev => prev.filter(c => c.id !== conditionId));
  };

  const updateCombinedCondition = (conditionId: string, field: keyof CombinedCondition, value: any) => {
    setCombinedConditions(prev => prev.map(c => 
      c.id === conditionId ? { ...c, [field]: value } : c
    ));
  };

  const addSingleCondition = (conditionId: string) => {
    setCombinedConditions(prev => prev.map(c => 
      c.id === conditionId 
        ? { ...c, conditions: [...c.conditions, { questionId: '', option: '' }] }
        : c
    ));
  };

  const removeSingleCondition = (conditionId: string, conditionIndex: number) => {
    setCombinedConditions(prev => prev.map(c => 
      c.id === conditionId 
        ? { ...c, conditions: c.conditions.filter((_, i) => i !== conditionIndex) }
        : c
    ));
  };

  const updateSingleCondition = (conditionId: string, conditionIndex: number, field: keyof SingleCondition, value: string) => {
    setCombinedConditions(prev => prev.map(c => 
      c.id === conditionId 
        ? {
            ...c,
            conditions: c.conditions.map((sc, i) => 
              i === conditionIndex ? { ...sc, [field]: value } : sc
            )
          }
        : c
    ));
  };

  const handleSave = () => {
    onUpdateQuestion(question.id, { combinedConditions });
    onClose();
  };

  const targetQuestions = questions.filter((q, index) => {
    const currentIndex = questions.findIndex(iq => iq.id === question.id);
    return index > currentIndex;
  });

  // Get questions that have options for condition selection
  const questionsWithOptions = questions.filter(q => 
    q.type === 'چندگزینه‌ای' || q.type === 'چندگزینه‌ای تصویری' || q.type === 'لیست کشویی'
  ).filter((q, index) => {
    const currentIndex = questions.findIndex(iq => iq.id === question.id);
    return index < currentIndex;
  });

  const getQuestionOptions = (questionId: string) => {
    const selectedQuestion = questions.find(q => q.id === questionId);
    if (selectedQuestion?.type === 'چندگزینه‌ای تصویری') {
      return selectedQuestion.imageOptions?.map(opt => opt.text) || [];
    }
    return selectedQuestion?.options || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">شرط‌گذاری ترکیبی سوال</h2>
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
              <p className="text-sm text-gray-600 mt-1">
                شرط‌های ترکیبی می‌توانند چندین شرط را با منطق AND یا OR ترکیب کنند
              </p>
            </div>

            <div className="space-y-6">
              {combinedConditions.map((combinedCondition) => (
                <div key={combinedCondition.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-base">شرط ترکیبی</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCombinedCondition(combinedCondition.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Single Conditions */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">شرط‌های جزئی:</Label>
                      {combinedCondition.conditions.map((singleCondition, conditionIndex) => (
                        <div key={conditionIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">شرط {conditionIndex + 1}</span>
                            {combinedCondition.conditions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSingleCondition(combinedCondition.id, conditionIndex)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-600">اگر در سوال:</Label>
                              <Select 
                                value={singleCondition.questionId} 
                                onValueChange={(value) => updateSingleCondition(combinedCondition.id, conditionIndex, 'questionId', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="انتخاب سوال" />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionsWithOptions.map((q) => (
                                    <SelectItem key={q.id} value={q.id}>
                                      {q.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs text-gray-600">گزینه انتخاب شد:</Label>
                              <Select 
                                value={singleCondition.option} 
                                onValueChange={(value) => updateSingleCondition(combinedCondition.id, conditionIndex, 'option', value)}
                                disabled={!singleCondition.questionId}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="انتخاب گزینه" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getQuestionOptions(singleCondition.questionId).map((option, index) => (
                                    <SelectItem key={index} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button 
                        onClick={() => addSingleCondition(combinedCondition.id)}
                        variant="outline" 
                        size="sm"
                        className="w-full border-dashed"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        افزودن شرط جزئی
                      </Button>
                    </div>

                    {/* Logic Selection */}
                    {combinedCondition.conditions.length > 1 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">منطق ترکیب شرط‌ها:</Label>
                        <Select 
                          value={combinedCondition.logic} 
                          onValueChange={(value: 'AND' | 'OR') => updateCombinedCondition(combinedCondition.id, 'logic', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">همه شرط‌ها (AND)</SelectItem>
                            <SelectItem value="OR">یکی از شرط‌ها (OR)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {combinedCondition.logic === 'AND' 
                            ? 'همه شرط‌ها باید برقرار باشند' 
                            : 'کافی است یکی از شرط‌ها برقرار باشد'
                          }
                        </p>
                      </div>
                    )}

                    {/* Target Question */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {combinedCondition.logic === 'AND' ? 'اگر همه شرط‌ها برقرار بود' : 'اگر یکی از شرط‌ها برقرار بود'}، برو به سوال:
                      </Label>
                      <Select 
                        value={combinedCondition.targetQuestionId} 
                        onValueChange={(value) => updateCombinedCondition(combinedCondition.id, 'targetQuestionId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب سوال مقصد" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetQuestions.map((targetQuestion) => (
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
                onClick={addCombinedCondition}
                variant="outline" 
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 ml-2" />
                افزودن شرط ترکیبی جدید
              </Button>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSave} className="flex-1">
                ذخیره شرط‌های ترکیبی
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
