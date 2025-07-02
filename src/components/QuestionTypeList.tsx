import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuestionType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface QuestionTypeListProps {
  questionTypes: QuestionType[];
  onAddQuestion: (type: string) => void;
}

const QuestionTypeList: React.FC<QuestionTypeListProps> = ({
  questionTypes,
  onAddQuestion,
}) => {
  return (
    <div className="w-96 h-full bg-white border-l p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">انواع سوالات</h2>
      <div className="space-y-2">
        {questionTypes.map((type, index) => (
          <Draggable key={type.id} draggableId={type.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  ...provided.draggableProps.style,
                  opacity: snapshot.isDragging ? 1 : 1,

                  pointerEvents: "auto",
                }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow cursor-move">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{type.title}</h3>
                      <p className="text-sm text-gray-500">
                        {type.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onAddQuestion(type.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </Draggable>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypeList;
