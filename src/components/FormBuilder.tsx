
import React, { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import QuestionCard from './QuestionCard';
import { Question } from '../pages/Index';
import { MousePointer2 } from 'lucide-react';

interface FormBuilderProps {
  questions: Question[];
  onRemoveQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: Question) => void;
  onConditionalLogic: (question: Question) => void;
  onAddQuestion: (type: string, insertIndex?: number) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onRemoveQuestion,
  onDuplicateQuestion,
  onUpdateQuestion,
  onMoveQuestion,
  onQuestionClick,
  onConditionalLogic,
  onAddQuestion,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'question',
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return;
      onAddQuestion(item.type, questions.length);
      setDragOverIndex(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    hover: (item, monitor) => {
      if (monitor.getItemType() === 'question') {
        setDragOverIndex(questions.length);
      }
    },
  }));

  const handleDropZoneHover = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDropZoneDrop = useCallback((item: { type: string }, index: number) => {
    onAddQuestion(item.type, index);
    setDragOverIndex(null);
  }, [onAddQuestion]);

  const DropZone: React.FC<{ index: number }> = ({ index }) => {
    const [{ isOver: isZoneOver }, zoneDrop] = useDrop(() => ({
      accept: 'question',
      drop: (item: { type: string }, monitor) => {
        if (monitor.didDrop()) return;
        handleDropZoneDrop(item, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
      hover: () => {
        handleDropZoneHover(index);
      },
    }));

    return (
      <div
        ref={zoneDrop}
        className={`transition-all duration-200 ${
          isZoneOver || dragOverIndex === index 
            ? 'h-12 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg my-2 flex items-center justify-center' 
            : 'h-2'
        }`}
      >
        {(isZoneOver || dragOverIndex === index) && (
          <span className="text-blue-600 text-sm font-medium">رها کنید تا سوال اضافه شود</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mr-96">
      <div
        ref={drop}
        className={`min-h-[500px] transition-all duration-200 ${
          isOver && dragOverIndex === questions.length
            ? 'bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-xl p-6'
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
              سوالات خود را از سایدبار سمت چپ به اینجا بکشید یا روی آنها کلیک کنید
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
                  onDuplicate={onDuplicateQuestion}
                  onUpdate={onUpdateQuestion}
                  onMove={onMoveQuestion}
                  onClick={onQuestionClick}
                  onConditionalLogic={onConditionalLogic}
                  onAddQuestion={onAddQuestion}
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
