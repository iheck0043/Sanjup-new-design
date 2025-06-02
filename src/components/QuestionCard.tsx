import React, { useRef } from "react";
import { useDrag, useDrop, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Settings, Copy, Trash2 } from "lucide-react";
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
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

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

  const isOver = false;
  const canDrop = false;

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 mb-4 cursor-move hover:border-blue-300 transition-colors ${
        isDragging ? "opacity-50" : ""
      } ${isOver && canDrop ? "border-blue-400 bg-blue-50" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {question.label}
          </h3>
          <p className="text-sm text-gray-500">نوع: {question.type}</p>
          {question.required && (
            <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
              اجباری
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="text-green-600 hover:text-green-800"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Question Preview */}
      <div className="bg-gray-50 rounded-md p-3">
        {question.type === "متن کوتاه" && (
          <>
            <Label htmlFor={`preview-short-text-${question.id}`}>
              {question.label}
            </Label>
            <Input
              type="text"
              id={`preview-short-text-${question.id}`}
              placeholder="پاسخ خود را وارد کنید"
              disabled
            />
          </>
        )}

        {question.type === "متن بلند" && (
          <>
            <Label htmlFor={`preview-long-text-${question.id}`}>
              {question.label}
            </Label>
            <textarea
              id={`preview-long-text-${question.id}`}
              placeholder="پاسخ خود را وارد کنید"
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
              disabled
            />
          </>
        )}

        {question.type === "انتخاب چند گزینه" && (
          <>
            <Label className="block text-sm font-medium text-gray-700">
              {question.label}
            </Label>
            <div className="mt-2 space-y-2">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                    disabled
                  />
                  <span className="ml-2 text-gray-900">گزینه 1</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                    disabled
                  />
                  <span className="ml-2 text-gray-900">گزینه 2</span>
                </label>
              </div>
            </div>
          </>
        )}

        {question.type === "انتخاب یک گزینه" && (
          <>
            <Label className="block text-sm font-medium text-gray-700">
              {question.label}
            </Label>
            <div className="mt-2 space-y-2">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="rounded-full text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                    disabled
                  />
                  <span className="ml-2 text-gray-900">گزینه 1</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="rounded-full text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                    disabled
                  />
                  <span className="ml-2 text-gray-900">گزینه 2</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
