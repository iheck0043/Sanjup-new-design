
import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormBuilder from '../components/FormBuilder';
import QuestionSidebar from '../components/QuestionSidebar';
import FormHeader from '../components/FormHeader';

export interface Question {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formTitle, setFormTitle] = useState('بدون عنوان');

  const addQuestion = useCallback((questionType: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: questionType,
      label: `سوال جدید`,
      required: false,
    };

    if (questionType === 'چندگزینه‌ای' || questionType === 'چندگزینه‌ای تصویری') {
      newQuestion.options = ['گزینه ۱', 'گزینه ۲'];
    }

    setQuestions(prev => [...prev, newQuestion]);
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const moveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
    setQuestions(prev => {
      const draggedItem = prev[dragIndex];
      const newItems = [...prev];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 flex flex-col font-vazir" dir="rtl">
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
        
        <div className="flex flex-1 h-[calc(100vh-80px)]">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-4xl mx-auto">
              <FormBuilder
                questions={questions}
                onRemoveQuestion={removeQuestion}
                onUpdateQuestion={updateQuestion}
                onMoveQuestion={moveQuestion}
              />
            </div>
          </div>
          
          <QuestionSidebar onAddQuestion={addQuestion} />
        </div>
      </div>
    </DndProvider>
  );
};

export default Index;
