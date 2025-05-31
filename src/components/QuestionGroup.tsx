
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChevronDown, ChevronUp, SquarePlus, GripVertical, Trash2 } from 'lucide-react';
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

  // Make question group draggable
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'question-card',
    item: { id: group.id, index, type: 'question-group' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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
    hover: (item: { id: string; index: number; type?: string }, monitor) => {
      if (!ref.current) return;
      if (item.type === 'question' || item.index === undefined) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMoveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  // Combine drag and drop refs
  preview(drop(ref));

  return (
    <div 
      ref={ref}
      className={`bg-white/90 backdrop-blur-sm border border-gray-200/70 rounded-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isOver ? 'border-blue-300 shadow-md' : ''}`}
      style={{ transform: isDragging ? 'rotate(2deg)' : 'none' }}
    >
      {/* Group Header */}
      <div
        className="flex items-center p-3 gap-3 cursor-pointer hover:bg-gray-50/50 rounded-t-lg group"
        onClick={() => onQuestionClick(group)}
      >
        <div 
          ref={drag}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-shrink-0">
          <div className="w-5 h-5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
        </div>

        <div className="flex-shrink-0">
          <SquarePlus className="w-4 h-4 text-green-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-700 font-medium truncate">
            {group.label}
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md font-medium">
            گروه سوال
          </span>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {children.length} سوال
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveQuestion(group.id);
          }}
          className="flex-shrink-0 p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(group.id);
          }}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Group Content */}
      {isExpanded && (
        <div className="border-t border-gray-200/50 p-3 space-y-2 transition-all duration-200">
          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <SquarePlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">سوالات را به اینجا بکشید</p>
            </div>
          ) : (
            children.map((question, childIndex) => (
              <div key={question.id} className="pr-4 border-r-2 border-gray-200">
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
