
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { Question, Condition } from '../pages/Index';

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
    if (question) {
      setConditions(question.conditions || []);
    }
  }, [question]);

  if (!question) return null;

  const targetQuestions = questions.filter(q => q.id !== question.id);

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sourceQuestionId: question.id,
      targetQuestionId: '',
      operator: 'equals',
      value: '',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const handleSave = () => {
    onUpdateQuestion(question.id, { conditions });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0" dir="rtl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">شرط گذاری سوال</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">سوال مورد نظر:</h3>
                <p className="text-blue-800">{question.label}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">شرط های اعمال شده</Label>
                  <Button
                    onClick={addCondition}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن شرط
                  </Button>
                </div>

                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    هنوز شرطی تعریف نشده است
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map((condition) => (
                      <div key={condition.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div>
                            <Label className="text-sm">اگر پاسخ</Label>
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => updateCondition(condition.id, { operator: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">برابر باشد با</SelectItem>
                                <SelectItem value="not_equals">برابر نباشد با</SelectItem>
                                <SelectItem value="contains">شامل باشد</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">مقدار</Label>
                            <Input
                              value={condition.value}
                              onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                              placeholder="مقدار مورد نظر"
                            />
                          </div>

                          <div>
                            <Label className="text-sm">برو به سوال</Label>
                            <Select
                              value={condition.targetQuestionId}
                              onValueChange={(value) => updateCondition(condition.id, { targetQuestionId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="سوال مقصد را انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                {targetQuestions.map((q) => (
                                  <SelectItem key={q.id} value={q.id}>
                                    {q.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(condition.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t p-6">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button onClick={handleSave}>
                ذخیره شرط ها
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalLogicModal;
