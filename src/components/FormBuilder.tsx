import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import QuestionCard from './QuestionCard';
import QuestionGroup from './QuestionGroup';
import { Question } from '../pages/Index';
import { MousePointer2, Sparkles, Wand2 } from 'lucide-react';

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
    accept: ['question', 'question-card'],
    drop: (item: { type?: string; index?: number }, monitor) => {
      if (monitor.didDrop()) return;
      
      if (item.type) {
        console.log('Dropped question type:', item.type, 'at index:', dragOverIndex);
        const targetIndex = dragOverIndex !== null ? dragOverIndex : topLevelQuestions.length;
        onAddQuestion(item.type, targetIndex);
      } else if (item.index !== undefined) {
        // Handle moving existing questions
        const dragIndex = item.index;
        const hoverIndex = dragOverIndex !== null ? dragOverIndex : topLevelQuestions.length;
        if (dragIndex !== hoverIndex) {
          onMoveQuestion(dragIndex, hoverIndex);
        }
      }
      setDragOverIndex(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    hover: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (dragOverIndex === null) {
        setDragOverIndex(topLevelQuestions.length);
      }
    },
  }));

  const DropZone: React.FC<{ index: number }> = ({ index }) => {
    const [{ isOver: isZoneOver }, zoneDrop] = useDrop(() => ({
      accept: ['question', 'question-card'],
      drop: (item: { type?: string; index?: number }, monitor) => {
        if (monitor.didDrop()) return;
        
        if (item.type) {
          console.log('Dropped in zone at index:', index, 'question type:', item.type);
          onAddQuestion(item.type, index);
        } else if (item.index !== undefined) {
          const dragIndex = item.index;
          if (dragIndex !== index) {
            onMoveQuestion(dragIndex, index);
          }
        }
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
        className={`transition-all duration-300 ${
          isZoneOver || dragOverIndex === index
            ? 'h-12 bg-gradient-to-r from-blue-100/80 via-indigo-100/60 to-purple-100/80 border-2 border-dashed border-blue-400/60 rounded-xl mb-3 mx-4 flex items-center justify-center backdrop-blur-sm'
            : 'h-2'
        }`}
      >
        {(isZoneOver || dragOverIndex === index) && (
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Sparkles className="w-4 h-4 animate-pulse" />
            سوال را اینجا رها کنید
          </div>
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
    <div className="flex-1 overflow-y-auto pr-96 relative">
      {/* Modern background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.04"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      <div
        ref={drop}
        className={`min-h-[500px] transition-all duration-300 p-8 max-w-5xl mx-auto relative ${
          isOver && dragOverIndex === topLevelQuestions.length
            ? 'bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/30 border-2 border-dashed border-blue-400/50 rounded-2xl backdrop-blur-sm'
            : ''
        }`}
        onDragEnd={() => setDragOverIndex(null)}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setDragOverIndex(null);
          }
        }}
      >
        {topLevelQuestions.length === 0 ? (
          <>
            <DropZone index={0} />
            <div className="flex flex-col items-center justify-center h-96 text-gray-400 relative">
              {/* Decorative floating elements */}
              <div className="absolute top-16 right-20 w-20 h-20 bg-gradient-to-br from-blue-100/60 to-indigo-100/40 rounded-2xl opacity-60 animate-pulse backdrop-blur-sm"></div>
              <div className="absolute bottom-24 left-16 w-14 h-14 bg-gradient-to-br from-purple-100/60 to-pink-100/40 rounded-xl opacity-50 animate-pulse delay-1000 backdrop-blur-sm"></div>
              <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-gradient-to-br from-yellow-100/60 to-orange-100/40 rounded-lg opacity-40 animate-pulse delay-500 backdrop-blur-sm"></div>
              
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100/80 via-indigo-100/60 to-purple-100/80 rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-white/60 backdrop-blur-sm relative">
                <MousePointer2 className="w-12 h-12 text-gray-400" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-60 animate-ping"></div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-600 bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                شروع ساخت فرم
              </h3>
              <p className="text-center max-w-md text-gray-500 text-sm leading-relaxed">
                سوالات خود را از ساید بار سمت راست به اینجا بکشید یا روی آنها کلیک کنید
              </p>
              
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                <Wand2 className="w-4 h-4" />
                فرم خود را با کشیدن سوالات بسازید
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <DropZone index={0} />
            {topLevelQuestions.map((question, index) => (
              <React.Fragment key={question.id}>
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
