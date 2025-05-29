
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
  conditions?: Array<{
    id: string;
    sourceOption: string;
    targetQuestionId: string;
  }>;
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formTitle, setFormTitle] = useState('بدون عنوان');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [conditionQuestion, setConditionQuestion] = useState<Question | null>(null);

  const addQuestion = useCallback((questionType: string, insertIndex?: number) => {
    console.log('Adding question:', questionType, 'at index:', insertIndex);
    
    const newQuestion: Question = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: questionType,
      label: `سوال جدید`,
      required: false,
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

  const duplicateQuestion = useCallback((question: Question) => {
    const duplicatedQuestion: Question = {
      ...question,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      label: `کپی ${question.label}`,
    };
    
    const questionIndex = questions.findIndex(q => q.id === question.id);
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions.splice(questionIndex + 1, 0, duplicatedQuestion);
      return newQuestions;
    });
  }, [questions]);

  const removeQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
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

  const openConditionModal = useCallback((question: Question) => {
    setConditionQuestion(question);
    setIsConditionModalOpen(true);
  }, []);

  const closeConditionModal = useCallback(() => {
    setIsConditionModalOpen(false);
    setConditionQuestion(null);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn'] overflow-x-hidden" dir="rtl">
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
        
        <div className="flex flex-1 h-[calc(100vh-80px)] relative">
          <FormBuilder
            questions={questions}
            onRemoveQuestion={removeQuestion}
            onUpdateQuestion={updateQuestion}
            onMoveQuestion={moveQuestion}
            onQuestionClick={openQuestionSettings}
            onAddQuestion={addQuestion}
            onDuplicateQuestion={duplicateQuestion}
            onConditionClick={openConditionModal}
          />
          
          <QuestionSidebar onAddQuestion={addQuestion} />
        </div>

        <QuestionSettingsModal
          isOpen={isModalOpen}
          onClose={closeQuestionSettings}
          question={selectedQuestion}
          onUpdateQuestion={updateQuestion}
        />

        <ConditionalLogicModal
          isOpen={isConditionModalOpen}
          onClose={closeConditionModal}
          question={conditionQuestion}
          questions={questions}
          onUpdateQuestion={updateQuestion}
        />
      </div>
    </DndProvider>
  );
};

export default Index;
