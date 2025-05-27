
import React from 'react';
import { useDrop } from 'react-dnd';
import QuestionCard from './QuestionCard';
import { Question } from '../pages/Index';
import { MousePointer2 } from 'lucide-react';

interface FormBuilderProps {
  questions: Question[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onRemoveQuestion,
  onUpdateQuestion,
  onMoveQuestion,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'question',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="w-full">
      {/* Questions Drop Zone */}
      <div
        ref={drop}
        className={`min-h-[600px] transition-all duration-200 ${
          isOver
            ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6'
            : ''
        }`}
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <MousePointer2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-600">شروع ساخت فرم</h3>
            <p className="text-center max-w-sm text-gray-500">
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
                onMove={onMoveQuestion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
