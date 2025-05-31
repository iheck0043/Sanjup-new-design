import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { Question, CombinedCondition, ConditionalRule } from '../types/Question';

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
  const [rules, setRules] = useState<ConditionalRule[]>([]);

  useEffect(() => {
    if (question?.combinedConditions) {
      setRules([...question.combinedConditions]);
    } else {
      setRules([]);
    }
  }, [question]);

  if (!question) return null;

  const hasOptions = question.type === 'چندگزینه‌ای' || question.type === 'چندگزینه‌ای تصویری' || question.type === 'لیست کشویی';

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      conditions: [{
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        sourceQuestionId: question.id,
        sourceOption: '',
        operator: 'AND'
      }],
      targetQuestionId: '',
    };
    setRules(prev => [...prev, newRule]);
  };

  const removeRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const addConditionToRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? {
            ...rule,
            conditions: [
              ...rule.conditions,
              {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                sourceQuestionId: '',
                sourceOption: '',
                operator: 'AND'
              }
            ]
          }
        : rule
    ));
  };

  const removeConditionFromRule = (ruleId: string, conditionId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? {
            ...rule,
            conditions: rule.conditions.filter(c => c.id !== conditionId)
          }
        : rule
    ));
  };

  const updateCondition = (ruleId: string, conditionId: string, field: keyof CombinedCondition, value: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? {
            ...rule,
            conditions: rule.conditions.map(condition =>
              condition.id === conditionId 
                ? { ...condition, [field]: value }
                : condition
            )
          }
        : rule
    ));
  };

  const updateRuleTarget = (ruleId: string, targetQuestionId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, targetQuestionId }
        : rule
    ));
  };

  const handleSave = () => {
    onUpdateQuestion(question.id, { combinedConditions: rules });
    onClose();
  };

  const targetQuestions = questions.filter((q, index) => {
    const currentIndex = questions.findIndex(iq => iq.id === question.id);
    return index > currentIndex;
  });

  const getQuestionById = (id: string) => {
    return questions.find(q => q.id === id);
  };

  const getOptionsForQuestion = (questionId: string) => {
    const q = getQuestionById(questionId);
    if (!q) return [];
    
    if (q.type === 'چندگزینه‌ای' || q.type === 'لیست کشویی') {
      return q.options || [];
    } else if (q.type === 'چندگزینه‌ای تصویری') {
      return q.imageOptions?.map(opt => opt.text) || [];
    }
    return [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogTitle className="text-lg font-semibold">شرط‌گذاری ترکیبی سوال</DialogTitle>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">سوال: {question.label}</Label>
          </div>

          <div className="space-y-6">
            {rules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-base">قانون شرطی</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">شرط‌ها:</div>
                  
                  {rule.conditions.map((condition, index) => (
                    <div key={condition.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">
                          {index === 0 ? 'اگر' : condition.operator === 'AND' ? 'و' : 'یا'}
                        </span>
                        {rule.conditions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConditionFromRule(rule.id, condition.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">سوال:</Label>
                          <Select 
                            value={condition.sourceQuestionId} 
                            onValueChange={(value) => updateCondition(rule.id, condition.id, 'sourceQuestionId', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="انتخاب سوال" />
                            </SelectTrigger>
                            <SelectContent>
                              {questions.filter(q => 
                                q.type === 'چندگزینه‌ای' || 
                                q.type === 'چندگزینه‌ای تصویری' || 
                                q.type === 'لیست کشویی'
                              ).map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                  {q.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">گزینه:</Label>
                          <Select 
                            value={condition.sourceOption} 
                            onValueChange={(value) => updateCondition(rule.id, condition.id, 'sourceOption', value)}
                            disabled={!condition.sourceQuestionId}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="انتخاب گزینه" />
                            </SelectTrigger>
                            <SelectContent>
                              {getOptionsForQuestion(condition.sourceQuestionId).map((option, optIndex) => (
                                <SelectItem key={optIndex} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {index > 0 && (
                          <div>
                            <Label className="text-xs">عملگر:</Label>
                            <Select 
                              value={condition.operator} 
                              onValueChange={(value) => updateCondition(rule.id, condition.id, 'operator', value as 'AND' | 'OR')}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">و (AND)</SelectItem>
                                <SelectItem value="OR">یا (OR)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button 
                    onClick={() => addConditionToRule(rule.id)}
                    variant="outline" 
                    size="sm"
                    className="border-dashed"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن شرط جدید
                  </Button>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">در صورت برقراری، برو به سوال:</Label>
                    <Select 
                      value={rule.targetQuestionId} 
                      onValueChange={(value) => updateRuleTarget(rule.id, value)}
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
              onClick={addRule}
              variant="outline" 
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 ml-2" />
              افزودن قانون شرطی جدید
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
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalLogicModal;
