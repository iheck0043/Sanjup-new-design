
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChevronDown, ChevronUp, SquarePlus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuestionCard from './QuestionCard';

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  parentId?: string;
  options?: { id: string; text: string }[];
}

interface QuestionGroupProps {
  question: Question;
  children: Question[];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onAddChild: (type: string) => void;
  parentId?: string;
}

const QuestionGroup: React.FC<QuestionGroupProps> = ({
  question,
  children,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDuplicate,
  onRemove,
  onMove,
  onAddChild,
  parentId,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Make question group draggable
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'question-card',
    item: { id: question.id, index, type: 'question-group' },
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
        onAddChild(item.type);
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

      onMove(dragIndex, hoverIndex);
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
      className={`group bg-white/90 backdrop-blur-sm border border-gray-200/70 rounded-xl shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 ease-out transform hover:scale-[1.01] ${
        isDragging ? 'opacity-50 scale-95' : 'scale-100'
      } ${isOver ? 'border-blue-300 shadow-lg shadow-blue-500/20' : ''} animate-fade-in`}
    >
      {/* Group Header */}
      <div
        className="flex items-center p-4 gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 rounded-t-xl group/header transition-all duration-200"
        onClick={onEdit}
      >
        <div 
          ref={drag}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>

        <div className="flex-shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm">
            {index + 1}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover/header:bg-green-200 transition-colors duration-200">
            <SquarePlus className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors duration-200">
            {question.label}
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-full font-semibold shadow-sm">
            گروه سوال
          </span>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            {children.length} سوال
          </span>
        </div>

        <div 
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 p-0 rounded-lg transition-all duration-200"
            title="حذف گروه"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
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
        <div className="border-t border-gray-200/50 p-4 space-y-3 animate-accordion-down">
          {children.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/30">
              <SquarePlus className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">سوالات را به اینجا بکشید</p>
              <p className="text-xs text-gray-400 mt-1">یا از نوار کناری اضافه کنید</p>
            </div>
          ) : (
            children.map((child, childIndex) => (
              <div key={child.id} className="pr-4 border-r-2 border-indigo-200 transform transition-all duration-300 ease-out">
                <QuestionCard
                  question={child}
                  index={childIndex}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onRemove={onRemove}
                  onMove={onMove}
                  parentId={question.id}
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
