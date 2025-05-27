
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
    <div className="max-w-4xl mx-auto">
      {/* Form Title Section */}
      <div className="text-center mb-12">
        <input
          type="text"
          placeholder="عنوان فرم را وارد کنید..."
          className="text-4xl font-bold text-gray-800 bg-transparent border-none outline-none text-center w-full placeholder-gray-400 hover:bg-gray-50 focus:bg-white focus:shadow-lg rounded-lg p-4 transition-all duration-200"
        />
      </div>

      {/* Questions Drop Zone */}
      <div
        ref={drop}
        className={`min-h-[400px] transition-all duration-200 ${
          isOver
            ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl'
            : ''
        }`}
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <div className="text-6xl mb-6 opacity-50">📝</div>
            <h3 className="text-2xl font-medium mb-3 text-gray-700">شروع ساخت فرم</h3>
            <p className="text-center max-w-md text-gray-500 leading-relaxed">
              سوالات خود را از سایدبار سمت راست به اینجا بکشید یا روی آنها کلیک کنید
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onRemove={onRemoveQuestion}
                onUpdate={onUpdateQuestion}
              />
            ))}
            
            <div className="text-center py-8">
              <button className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">
                + افزودن سوال جدید
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
