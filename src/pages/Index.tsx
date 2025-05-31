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
  hasOther?: boolean;
  hasNone?: boolean;
  hasAll?: boolean;
  isRequired?: boolean;
  isMultiSelect?: boolean;
  randomizeOptions?: boolean;
  conditions?: Array<{
    id: string;
    sourceOption: string;
    targetQuestionId: string;
  }>;
  // Description fields
  description?: string;
  hasDescription?: boolean;
  // Scale question fields
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: {
    left: string;
    center: string;
    right: string;
  };
  // Rating question fields
  ratingMax?: number;
  ratingStyle?: 'star' | 'heart' | 'thumbs';
  // Text question fields
  textType?: 'short' | 'long';
  minChars?: number;
  maxChars?: number;
  // Number question fields
  minNumber?: number;
  maxNumber?: number;
  // Matrix question fields
  rows?: string[];
  columns?: string[];
  // Image question fields
  imageOptions?: Array<{
    text: string;
    imageUrl?: string;
  }>;
  // Media fields
  hasMedia?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  // Question group fields
  parentId?: string;
  children?: string[];
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formTitle, setFormTitle] = useState('بدون عنوان');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [conditionQuestion, setConditionQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [pendingQuestionData, setPendingQuestionData] = useState<{type: string, insertIndex?: number, parentId?: string} | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const createQuestion = useCallback(async (questionData: Partial<Question>) => {
    // API call for creating question
    console.log('Creating question:', questionData);
    return questionData;
  }, []);

  const updateQuestion = useCallback(async (id: string, updates: Partial<Question>) => {
    // API call for updating question
    console.log('Updating question:', id, updates);
    return updates;
  }, []);

  const addQuestion = useCallback((questionType: string, insertIndex?: number, parentId?: string) => {
    console.log('Adding question:', questionType, 'at index:', insertIndex, 'parent:', parentId);
    
    const newQuestion: Question = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: questionType,
      label: `سوال جدید`,
      required: false,
      parentId: parentId,
    };

    if (questionType === 'چندگزینه‌ای') {
      newQuestion.options = ['گزینه ۱', 'گزینه ۲'];
      newQuestion.hasOther = false;
      newQuestion.hasNone = false;
      newQuestion.hasAll = false;
      newQuestion.isRequired = false;
      newQuestion.isMultiSelect = false;
      newQuestion.randomizeOptions = false;
    }

    // Set as new question and open modal
    setSelectedQuestion(newQuestion);
    setIsNewQuestion(true);
    setPendingQuestionData({ type: questionType, insertIndex, parentId });
    setIsModalOpen(true);
  }, []);

  const handleQuestionSave = useCallback(async (questionData: Question) => {
    if (isNewQuestion && pendingQuestionData) {
      // Create new question
      await createQuestion(questionData);
      
      setQuestions(prev => {
        if (pendingQuestionData.insertIndex !== undefined && !pendingQuestionData.parentId) {
          const newQuestions = [...prev];
          newQuestions.splice(pendingQuestionData.insertIndex, 0, questionData);
          console.log('Questions after insert:', newQuestions.length);
          return newQuestions;
        }
        console.log('Questions after append:', [...prev, questionData].length);
        return [...prev, questionData];
      });

      // If this is a group question, expand it by default
      if (questionData.type === 'گروه سوال') {
        setExpandedGroups(prev => [...prev, questionData.id]);
      }
    } else {
      // Update existing question
      await updateQuestion(questionData.id, questionData);
      setQuestions(prev =>
        prev.map(q => (q.id === questionData.id ? { ...q, ...questionData } : q))
      );
    }
    
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
  }, [isNewQuestion, pendingQuestionData, createQuestion, updateQuestion]);

  const handleQuestionCancel = useCallback(() => {
    // Don't add question if cancelled
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
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
    setQuestions(prev => {
      // Also remove child questions if removing a group
      const questionToRemove = prev.find(q => q.id === id);
      if (questionToRemove?.type === 'گروه سوال') {
        return prev.filter(q => q.id !== id && q.parentId !== id);
      }
      return prev.filter(q => q.id !== id);
    });
    
    // Remove from expanded groups if it was a group
    setExpandedGroups(prev => prev.filter(groupId => groupId !== id));
  }, []);

  const updateQuestionInList = useCallback((id: string, updates: Partial<Question>) => {
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

  const moveToGroup = useCallback((questionId: string, groupId: string) => {
    setQuestions(prev =>
      prev.map(q => 
        q.id === questionId 
          ? { ...q, parentId: groupId }
          : q
      )
    );
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  const openQuestionSettings = useCallback((question: Question) => {
    setSelectedQuestion(question);
    setIsNewQuestion(false);
    setIsModalOpen(true);
  }, []);

  const closeQuestionSettings = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsNewQuestion(false);
    setPendingQuestionData(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 flex flex-col font-vazirmatn overflow-x-hidden relative" dir="rtl">
        {/* Enhanced background with modern patterns */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none"></div>
        
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
        
        <div className="flex flex-1 h-[calc(100vh-80px)] relative">
          <FormBuilder
            questions={questions}
            onRemoveQuestion={removeQuestion}
            onUpdateQuestion={updateQuestionInList}
            onMoveQuestion={moveQuestion}
            onQuestionClick={openQuestionSettings}
            onAddQuestion={addQuestion}
            onDuplicateQuestion={duplicateQuestion}
            onConditionClick={openConditionModal}
            onMoveToGroup={moveToGroup}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
          />
          
          <QuestionSidebar onAddQuestion={addQuestion} />
        </div>

        <QuestionSettingsModal
          isOpen={isModalOpen}
          onClose={closeQuestionSettings}
          question={selectedQuestion}
          onSave={handleQuestionSave}
          onCancel={handleQuestionCancel}
          isNewQuestion={isNewQuestion}
        />

        <ConditionalLogicModal
          isOpen={isConditionModalOpen}
          onClose={closeConditionModal}
          question={conditionQuestion}
          questions={questions}
          onUpdateQuestion={updateQuestionInList}
        />
      </div>
    </DndProvider>
  );
};

export default Index;
