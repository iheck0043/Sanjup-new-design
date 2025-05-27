
import React from 'react';
import { useDrop } from 'react-dnd';
import QuestionCard from './QuestionCard';
import { Question } from '../pages/Index';

interface FormBuilderProps {
  questions: Question[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onRemoveQuestion,
  onUpdateQuestion,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'question',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`min-h-[600px] p-6 rounded-lg border-2 border-dashed transition-colors ${
        isOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium mb-2">صفحه خوش‌آمدگویی</h3>
          <p className="text-center max-w-md">
            سوالات خود را از سایدبار سمت راست به اینجا بکشید یا روی آنها کلیک کنید
          </p>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">صفحه پایان +</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">صفحه خوش‌آمدگویی</h2>
            <div className="w-12 h-1 bg-blue-500 mx-auto"></div>
          </div>
          
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onRemove={onRemoveQuestion}
              onUpdate={onUpdateQuestion}
            />
          ))}
          
          <div className="text-center py-6">
            <button className="text-gray-500 hover:text-gray-700">
              صفحه پایان +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
