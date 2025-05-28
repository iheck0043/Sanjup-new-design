
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
  onQuestionClick: (question: Question) => void;
  onAddQuestion: (type: string, insertIndex?: number) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onRemoveQuestion,
  onUpdateQuestion,
  onMoveQuestion,
  onQuestionClick,
  onAddQuestion,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'question',
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return;
      onAddQuestion(item.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  return (
    <div className="w-full">
      <div
        ref={drop}
        className={`min-h-[500px] transition-all duration-200 ${
          isOver
            ? 'bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-xl p-6'
            : ''
        }`}
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <MousePointer2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-600">شروع ساخت فرم</h3>
            <p className="text-center max-w-sm text-gray-500">
              سوالات خود را از سایدبار سمت چپ به اینجا بکشید یا روی آنها کلیک کنید
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onRemove={onRemoveQuestion}
                onUpdate={onUpdateQuestion}
                onMove={onMoveQuestion}
                onClick={onQuestionClick}
                onAddQuestion={onAddQuestion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
