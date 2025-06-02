
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import QuestionCard from "./QuestionCard";

interface Question {
  id: string;
  title: string;
  type: string;
  required: boolean;
}

interface QuestionGroupProps {
  group: {
    id: string;
    title: string;
    questions: Question[];
  };
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditQuestion: (groupId: string, questionId: string) => void;
  onDeleteQuestion: (groupId: string, questionId: string) => void;
  onDuplicateQuestion: (groupId: string, questionId: string) => void;
}

export default function QuestionGroup({
  group,
  onEditGroup,
  onDeleteGroup,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
}: QuestionGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: group.id,
    data: {
      type: "group",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:text-gray-500"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{group.title}</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditGroup(group.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteGroup(group.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.questions.map((question) => (
          <QuestionCard
            key={question.id}
            id={question.id}
            title={question.title}
            type={question.type}
            onSettings={() => onEditQuestion(group.id, question.id)}
            onDelete={() => onDeleteQuestion(group.id, question.id)}
            onDuplicate={() => onDuplicateQuestion(group.id, question.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
