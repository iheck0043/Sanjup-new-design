import React, { useRef } from "react";
import { useDrag, useDrop, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Settings, Copy, Trash2, GripVertical, GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  parentId?: string;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  parentId?: string;
}

const QuestionCard = ({
  question,
  index,
  onEdit,
  onDuplicate,
  onRemove,
  onMove,
  parentId,
}: QuestionCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.QUESTION,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.QUESTION,
    item: () => {
      return { id: question.id, index: index };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`group bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 ease-out transform hover:scale-[1.01] cursor-move ${
        isDragging ? "opacity-60 scale-95" : ""
      } animate-fade-in`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse flex-1">
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" />
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-md flex items-center justify-center text-xs font-semibold shadow-sm">
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
                {question.label}
              </h3>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                {question.type}
              </p>
              {question.required && (
                <span className="inline-flex items-center bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full mt-1 font-medium">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                  اجباری
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Open condition modal */}}
              className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 rounded-md p-1.5"
              title="شرط‌های منطقی"
            >
              <GitBranch className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-md p-1.5"
              title="ویرایش سوال"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200 rounded-md p-1.5"
              title="کپی سوال"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-md p-1.5"
              title="حذف سوال"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
