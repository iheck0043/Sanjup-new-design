
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import QuestionCard from './QuestionCard';
import QuestionGroup from './QuestionGroup';
import { Question } from '../pages/Index';
import { MousePointer2 } from 'lucide-react';

interface FormBuilderProps {
  questions: Question[];
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: Question) => void;
  onAddQuestion: (type: string, insertIndex?: number, parentId?: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onConditionClick: (question: Question) => void;
  onMoveToGroup: (questionId: string, groupId: string) => void;
  expandedGroups: string[];
  onToggleGroup: (groupId: string) => void;
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
  onMoveToGroup,
  expandedGroups,
  onToggleGroup,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'question',
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return;
      
      console.log('Dropped question type:', item.type, 'at index:', dragOverIndex);
      const targetIndex = dragOverIndex !== null ? dragOverIndex : questions.length;
      onAddQuestion(item.type, targetIndex);
      setDragOverIndex(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    hover: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (dragOverIndex === null) {
        setDragOverIndex(questions.length);
      }
    },
  }));

  const DropZone: React.FC<{ index: number }> = ({ index }) => {
    const [{ isOver: isZoneOver }, zoneDrop] = useDrop(() => ({
      accept: 'question',
      drop: (item: { type: string }, monitor) => {
        if (monitor.didDrop()) return;
        console.log('Dropped in zone at index:', index, 'question type:', item.type);
        onAddQuestion(item.type, index);
        setDragOverIndex(null);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
      hover: (item, monitor) => {
        if (!monitor.isOver({ shallow: true })) return;
        setDragOverIndex(index);
      },
    }));

    return (
      <div
        ref={zoneDrop}
        className={`transition-all duration-300 ease-in-out ${
          isZoneOver || dragOverIndex === index
            ? 'h-12 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg mb-3 mx-4 flex items-center justify-center opacity-100 scale-105'
            : 'h-1 opacity-0'
        }`}
      >
        {(isZoneOver || dragOverIndex === index) && (
          <span className="text-blue-600 text-sm font-medium animate-pulse">
            سوال جدید را اینجا رها کنید
          </span>
        )}
      </div>
    );
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  // Separate top-level questions from grouped questions
  const topLevelQuestions = questions.filter(q => !q.parentId);
  const groupedQuestions = questions.filter(q => q.parentId);

  const getChildQuestions = (groupId: string) => {
    return groupedQuestions.filter(q => q.parentId === groupId);
  };

  return (
    <div className="flex-1 overflow-y-auto pr-96">
      <div
        ref={drop}
        className={`min-h-[500px] transition-all duration-200 p-6 max-w-4xl mx-auto ${
          isOver && dragOverIndex === topLevelQuestions.length
            ? 'bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-xl'
            : ''
        }`}
        onDragEnd={handleDragEnd}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setDragOverIndex(null);
          }
        }}
      >
        {topLevelQuestions.length === 0 ? (
          <>
            <DropZone index={0} />
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <MousePointer2 className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-600">شروع ساخت فرم</h3>
              <p className="text-center max-w-sm text-gray-500 text-sm">
                سوالات خود را از سایدبار سمت راست به اینجا بکشید یا روی آنها کلیک کنید
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <DropZone index={0} />
            {topLevelQuestions.map((question, index) => (
              <React.Fragment key={question.id}>
                <div className="transform transition-all duration-300 ease-in-out hover:scale-[1.02]">
                  {question.type === 'گروه سوال' ? (
                    <QuestionGroup
                      group={question}
                      children={getChildQuestions(question.id)}
                      index={index}
                      onRemoveQuestion={onRemoveQuestion}
                      onUpdateQuestion={onUpdateQuestion}
                      onMoveQuestion={onMoveQuestion}
                      onQuestionClick={onQuestionClick}
                      onAddQuestion={onAddQuestion}
                      onDuplicateQuestion={onDuplicateQuestion}
                      onConditionClick={onConditionClick}
                      onMoveToGroup={onMoveToGroup}
                      isExpanded={expandedGroups.includes(question.id)}
                      onToggleExpand={onToggleGroup}
                    />
                  ) : (
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
                  )}
                </div>
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
