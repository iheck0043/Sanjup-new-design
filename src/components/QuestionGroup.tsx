
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChevronDown, ChevronUp, SquarePlus, GripVertical } from 'lucide-react';
import { Question } from '../pages/Index';
import QuestionCard from './QuestionCard';

interface QuestionGroupProps {
  group: Question;
  children: Question[];
  index: number;
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onQuestionClick: (question: Question) => void;
  onAddQuestion: (type: string, insertIndex?: number, parentId?: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onConditionClick: (question: Question) => void;
  onMoveToGroup: (questionId: string, groupId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (groupId: string) => void;
}

const QuestionGroup: React.FC<QuestionGroupProps> = ({
  group,
  children,
  index,
  onRemoveQuestion,
  onUpdateQuestion,
  onMoveQuestion,
  onQuestionClick,
  onAddQuestion,
  onDuplicateQuestion,
  onConditionClick,
  onMoveToGroup,
  isExpanded,
  onToggleExpand,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Make the group draggable
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'question-card',
    item: () => ({ id: group.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop zone for adding questions to group
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['question-card', 'question'],
    drop: (item: { type?: string; id?: string; index?: number }, monitor) => {
      if (monitor.didDrop()) return;
      
      if (item.type && item.index === undefined) {
        // Adding new question from sidebar to group
        onAddQuestion(item.type, undefined, group.id);
        return;
      }
      
      if (item.id && item.index !== undefined) {
        // Moving existing question to group
        onMoveToGroup(item.id, group.id);
        return;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  // Enable drag for group header
  drag(dragRef);
  drop(preview(ref));

  return (
    <div 
      ref={ref}
      className={`bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
    >
      {/* Enhanced Group Header */}
      <div
        className="flex items-center p-4 gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 rounded-t-xl transition-all duration-200"
        onClick={() => onQuestionClick(group)}
      >
        <div 
          ref={dragRef}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-110"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>

        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
            {index + 1}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
            <SquarePlus className="w-4 h-4 text-green-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-800 font-semibold truncate">
            {group.label}
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-full font-semibold shadow-sm">
            گروه سوال
          </span>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-full font-medium">
            {children.length} سوال
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(group.id);
          }}
          className="flex-shrink-0 p-2 hover:bg-white/80 rounded-lg transition-all duration-200 hover:shadow-sm"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Enhanced Group Content */}
      {isExpanded && (
        <div
          className={`border-t border-gray-100 p-4 space-y-3 bg-gradient-to-br from-gray-50/30 to-blue-50/20 rounded-b-xl transition-all duration-300 ${
            isOver ? 'bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border-blue-200' : ''
          }`}
        >
          {children.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <SquarePlus className="w-8 h-8 text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-60 animate-pulse"></div>
              </div>
              <p className="text-sm font-medium">سوالات را به اینجا بکشید</p>
              <p className="text-xs text-gray-300 mt-1">یا از ساید بار اضافه کنید</p>
            </div>
          ) : (
            children.map((question, childIndex) => (
              <div key={question.id} className="pr-4 border-r-2 border-gradient-to-b from-blue-200 to-indigo-200 relative">
                <div className="absolute -right-1 top-3 w-2 h-2 bg-blue-400 rounded-full shadow-sm"></div>
                <QuestionCard
                  question={question}
                  index={childIndex}
                  onRemove={onRemoveQuestion}
                  onUpdate={onUpdateQuestion}
                  onMove={onMoveQuestion}
                  onClick={onQuestionClick}
                  onAddQuestion={onAddQuestion}
                  onDuplicate={onDuplicateQuestion}
                  onConditionClick={onConditionClick}
                  isChild={true}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionGroup;
