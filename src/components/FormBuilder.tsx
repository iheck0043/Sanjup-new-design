
import React from 'react';
import { useDrop } from 'react-dnd';
import QuestionCard from './QuestionCard';
import { Question } from '../pages/Index';
import { Plus } from 'lucide-react';

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
    <div className="w-full">
      {/* Form Title Section */}
      <div className="text-center mb-16">
        <div className="inline-block">
          <input
            type="text"
            placeholder="عنوان فرم خود را وارد کنید..."
            className="text-5xl font-bold text-gray-900 bg-transparent border-none outline-none text-center placeholder-gray-300 hover:placeholder-gray-400 focus:placeholder-gray-500 transition-all duration-200 min-w-0"
            style={{ width: 'auto', minWidth: '300px' }}
          />
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Questions Drop Zone */}
      <div
        ref={drop}
        className={`min-h-[500px] transition-all duration-300 ${
          isOver
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-2xl p-8'
            : ''
        }`}
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-600">شروع ساخت فرم</h3>
            <p className="text-center max-w-md text-gray-500 leading-relaxed">
              سوالات خود را از سایدبار سمت راست به اینجا بکشید یا روی آنها کلیک کنید
            </p>
            <div className="mt-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onRemove={onRemoveQuestion}
                onUpdate={onUpdateQuestion}
              />
            ))}
            
            <div className="text-center py-12">
              <button className="group flex items-center gap-3 mx-auto px-6 py-3 text-gray-400 hover:text-indigo-600 text-sm font-medium transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-gray-100/50 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-200">
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                افزودن سوال جدید
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
