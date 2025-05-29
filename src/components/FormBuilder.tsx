
import React, { useState } from 'react';
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
  onDuplicateQuestion: (question: Question) => void;
  onConditionClick: (question: Question) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onRemoveQuestion,
  onUpdateQuestion,
  onMoveQuestion,
  onQuestionClick,
  onAddQuestion,
  onDuplicateQuestion,
  onConditionClick,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'question',
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return;
      
      const targetIndex = dragOverIndex !== null ? dragOverIndex : questions.length;
      onAddQuestion(item.type, targetIndex);
      setDragOverIndex(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  const DropZone: React.FC<{ index: number }> = ({ index }) => {
    const [{ isOver: isZoneOver }, zoneDrop] = useDrop(() => ({
      accept: 'question',
      drop: (item: { type: string }, monitor) => {
        if (monitor.didDrop()) return;
        onAddQuestion(item.type, index);
        setDragOverIndex(null);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
      hover: () => {
        setDragOverIndex(index);
      },
    }));

    return (
      <div
        ref={zoneDrop}
        className={`transition-all duration-150 ${
          isZoneOver || dragOverIndex === index
            ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg mb-2'
            : 'h-2'
        }`}
        onDragLeave={() => {
          if (dragOverIndex === index) {
            setDragOverIndex(null);
          }
        }}
      />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pr-96">
      <div
        ref={drop}
        className={`min-h-[500px] transition-all duration-200 p-6 max-w-4xl mx-auto ${
          isOver && dragOverIndex === questions.length
            ? 'bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-xl'
            : ''
        }`}
        onDragLeave={() => setDragOverIndex(null)}
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <MousePointer2 className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-600">شروع ساخت فرم</h3>
            <p className="text-center max-w-sm text-gray-500 text-sm">
              سوالات خود را از سایدبار سمت راست به اینجا بکشید یا روی آنها کلیک کنید
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <DropZone index={0} />
            {questions.map((question, index) => (
              <React.Fragment key={question.id}>
                <QuestionCard
                  question={question}
                  index={index}
                  onRemove={onRemoveQuestion}
                  onUpdate={onUpdateQuestion}
                  onMove={onMoveQuestion}
                  onClick={onQuestionClick}
                  onAddQuestion={onAddQuestion}
                  onDuplicate={onDuplicateQuestion}
                  onConditionClick={onConditionClick}
                />
                <DropZone index={index + 1} />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
