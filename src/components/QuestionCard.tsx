
import React, { useRef } from "react";
import { useDrag, useDrop, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Settings, Copy, Trash2, GripVertical } from "lucide-react";
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
      className={`group bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1 cursor-move ${
        isDragging ? "opacity-60 scale-95" : ""
      } animate-fade-in`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 space-x-reverse flex-1">
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" />
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm">
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors duration-200">
                {question.label}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                نوع: {question.type}
              </p>
              {question.required && (
                <span className="inline-flex items-center bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full mt-2 font-medium">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                  اجباری
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg p-2"
              title="ویرایش سوال"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200 rounded-lg p-2"
              title="کپی سوال"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg p-2"
              title="حذف سوال"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Preview */}
        <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100 group-hover:bg-blue-50/30 group-hover:border-blue-200/50 transition-all duration-300">
          {question.type === "متن کوتاه" && (
            <div className="space-y-2">
              <Label htmlFor={`preview-short-text-${question.id}`} className="text-sm font-medium text-gray-700">
                {question.label}
              </Label>
              <Input
                type="text"
                id={`preview-short-text-${question.id}`}
                placeholder="پاسخ خود را وارد کنید"
                disabled
                className="bg-white/60"
              />
            </div>
          )}

          {question.type === "متن بلند" && (
            <div className="space-y-2">
              <Label htmlFor={`preview-long-text-${question.id}`} className="text-sm font-medium text-gray-700">
                {question.label}
              </Label>
              <textarea
                id={`preview-long-text-${question.id}`}
                placeholder="پاسخ خود را وارد کنید"
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-white/60 p-3 resize-none"
                disabled
                rows={3}
              />
            </div>
          )}

          {question.type === "انتخاب چند گزینه" && (
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-gray-700">
                {question.label}
              </Label>
              <div className="space-y-2">
                {[1, 2].map((num) => (
                  <div key={num} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                      disabled
                    />
                    <span className="mr-3 text-gray-700">گزینه {num}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.type === "انتخاب یک گزینه" && (
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-gray-700">
                {question.label}
              </Label>
              <div className="space-y-2">
                {[1, 2].map((num) => (
                  <div key={num} className="flex items-center">
                    <input
                      type="radio"
                      name={`preview-radio-${question.id}`}
                      className="text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                      disabled
                    />
                    <span className="mr-3 text-gray-700">گزینه {num}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
