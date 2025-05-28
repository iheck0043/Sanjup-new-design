
import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormBuilder from '../components/FormBuilder';
import QuestionSidebar from '../components/QuestionSidebar';
import FormHeader from '../components/FormHeader';
import QuestionSettingsModal from '../components/QuestionSettingsModal';
import ConditionalLogicModal from '../components/ConditionalLogicModal';

export interface Question {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  conditions?: Condition[];
}

export interface Condition {
  id: string;
  sourceQuestionId: string;
  targetQuestionId: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: string;
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formTitle, setFormTitle] = useState('بدون عنوان');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionalQuestion, setConditionalQuestion] = useState<Question | null>(null);
  const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false);

  const addQuestion = useCallback((questionType: string, insertIndex?: number) => {
    console.log('Adding question:', questionType, 'at index:', insertIndex);
    
    const newQuestion: Question = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: questionType,
      label: `سوال جدید`,
      required: false,
      conditions: [],
    };

    if (questionType === 'چندگزینه‌ای' || questionType === 'چندگزینه‌ای تصویری') {
      newQuestion.options = ['گزینه ۱', 'گزینه ۲'];
    }

    setQuestions(prev => {
      if (insertIndex !== undefined) {
        const newQuestions = [...prev];
        newQuestions.splice(insertIndex, 0, newQuestion);
        console.log('Questions after insert:', newQuestions.length);
        return newQuestions;
      }
      console.log('Questions after append:', [...prev, newQuestion].length);
      return [...prev, newQuestion];
    });
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const duplicateQuestion = useCallback((question: Question) => {
    const duplicatedQuestion: Question = {
      ...question,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      label: `${question.label} (کپی)`,
    };
    
    setQuestions(prev => {
      const originalIndex = prev.findIndex(q => q.id === question.id);
      const newQuestions = [...prev];
      newQuestions.splice(originalIndex + 1, 0, duplicatedQuestion);
      return newQuestions;
    });
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const moveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log('Moving question from', dragIndex, 'to', hoverIndex);
    setQuestions(prev => {
      const draggedItem = prev[dragIndex];
      const newItems = [...prev];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);

  const openQuestionSettings = useCallback((question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  }, []);

  const closeQuestionSettings = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
  }, []);

  const openConditionalLogic = useCallback((question: Question) => {
    setConditionalQuestion(question);
    setIsConditionalModalOpen(true);
  }, []);

  const closeConditionalLogic = useCallback(() => {
    setIsConditionalModalOpen(false);
    setConditionalQuestion(null);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
        
        <div className="flex flex-1 h-[calc(100vh-80px)]">
          <QuestionSidebar onAddQuestion={addQuestion} />
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-4xl mx-auto">
              <FormBuilder
                questions={questions}
                onRemoveQuestion={removeQuestion}
                onDuplicateQuestion={duplicateQuestion}
                onUpdateQuestion={updateQuestion}
                onMoveQuestion={moveQuestion}
                onQuestionClick={openQuestionSettings}
                onConditionalLogic={openConditionalLogic}
                onAddQuestion={addQuestion}
              />
            </div>
          </div>
        </div>

        <QuestionSettingsModal
          isOpen={isModalOpen}
          onClose={closeQuestionSettings}
          question={selectedQuestion}
          onUpdateQuestion={updateQuestion}
        />

        <ConditionalLogicModal
          isOpen={isConditionalModalOpen}
          onClose={closeConditionalLogic}
          question={conditionalQuestion}
          questions={questions}
          onUpdateQuestion={updateQuestion}
        />
      </div>
    </DndProvider>
  );
};

export default Index;
