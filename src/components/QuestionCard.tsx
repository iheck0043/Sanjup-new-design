
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Copy, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuestionCardProps {
  id: string;
  title: string;
  type: string;
  onSettings: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  title,
  type,
  onSettings,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <GripVertical
            {...attributes}
            {...listeners}
            className="cursor-grab mr-2"
          />
          <div>
            <div className="font-semibold">{title}</div>
            <Badge variant="secondary">{type}</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onDuplicate}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onSettings}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
