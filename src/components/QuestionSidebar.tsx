import React from "react";
import {
  Draggable,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import {
  SquareCheck,
  BarChart3,
  SquarePlus,
  FileText,
  Type,
  Hash,
  Grid3X3,
  ArrowUpDown,
  Image,
  ChevronDown,
  Star,
  Mail,
  Sparkles,
} from "lucide-react";

interface QuestionTypeProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onAdd: () => void;
  index: number;
}

const QuestionType: React.FC<QuestionTypeProps> = ({
  type,
  label,
  icon,
  color,
  onAdd,
  index,
}) => {
  return (
    <Draggable draggableId={String(index)} index={index}>
      {(provided, snapshot) => (
        <React.Fragment>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              left: "auto !important",
              top: "auto !important",

              transform: snapshot.isDragging
                ? provided.draggableProps.style?.transform
                : "translate(0px, 0px)",
            }}
            className={` flex items-center p-2.5 rounded-lg border cursor-move  hover:shadow-sm hover:scale-[1.02] ${color} `}
            onClick={onAdd}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-shrink-0  ">{icon}</div>
              <span className="text-xs font-medium text-gray-700 truncate">
                {label}
              </span>
            </div>
          </div>

          {snapshot.isDragging && (
            <div
              style={{ transform: "none !important", opacity: 0.7 }}
              className={` flex items-center p-2.5 rounded-lg border cursor-move  hover:shadow-sm hover:scale-[1.02] ${color} `}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex-shrink-0  ">{icon}</div>
                <span className="text-xs font-medium text-gray-700 truncate">
                  {label}
                </span>
              </div>
            </div>
          )}
        </React.Fragment>
      )}
    </Draggable>
  );
};

interface QuestionSidebarProps {
  onAddQuestion: (type: string, insertIndex?: number) => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({ onAddQuestion }) => {
  const questionTypes = [
    {
      type: "چندگزینه‌ای",
      label: "چندگزینه‌ای",
      icon: <SquareCheck className="w-4 h-4 text-blue-600" />,
      color:
        "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200",
    },
    {
      type: "طیفی",
      label: "طیفی",
      icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      color:
        "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200",
    },
    {
      type: "گروه سوال",
      label: "گروه سوال",
      icon: <SquarePlus className="w-4 h-4 text-green-600" />,
      color:
        "bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-200",
    },
    {
      type: "متن بدون پاسخ",
      label: "متن بدون پاسخ",
      icon: <FileText className="w-4 h-4 text-gray-600" />,
      color:
        "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200",
    },
    {
      type: "متنی",
      label: "متنی",
      icon: <Type className="w-4 h-4 text-purple-600" />,
      color:
        "bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-200",
    },
    {
      type: "عددی",
      label: "عددی",
      icon: <Hash className="w-4 h-4 text-orange-600" />,
      color:
        "bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-200",
    },
    {
      type: "ماتریسی",
      label: "ماتریسی",
      icon: <Grid3X3 className="w-4 h-4 text-cyan-600" />,
      color:
        "bg-cyan-50 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200",
    },
    {
      type: "اولویت‌دهی",
      label: "اولویت‌دهی",
      icon: <ArrowUpDown className="w-4 h-4 text-pink-600" />,
      color:
        "bg-pink-50 border-pink-100 hover:bg-pink-100 hover:border-pink-200",
    },
    {
      type: "چند‌گزینه‌ای تصویری",
      label: "چند‌گزینه‌ای تصویری",
      icon: <Image className="w-4 h-4 text-yellow-600" />,
      color:
        "bg-yellow-50 border-yellow-100 hover:bg-yellow-100 hover:border-yellow-200",
    },
    {
      type: "لیست کشویی",
      label: "لیست کشویی",
      icon: <ChevronDown className="w-4 h-4 text-teal-600" />,
      color:
        "bg-teal-50 border-teal-100 hover:bg-teal-100 hover:border-teal-200",
    },
    {
      type: "درجه‌بندی",
      label: "درجه‌بندی",
      icon: <Star className="w-4 h-4 text-amber-600" />,
      color:
        "bg-amber-50 border-amber-100 hover:bg-amber-100 hover:border-amber-200",
    },
    {
      type: "ایمیل",
      label: "ایمیل",
      icon: <Mail className="w-4 h-4 text-red-600" />,
      color: "bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200",
    },
  ];

  return (
    <div className="w-96 bg-white/90 backdrop-blur-sm border-l border-gray-200/70 h-[calc(100vh-80px)] flex flex-col fixed top-20 right-0">
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            انواع سوالات
          </h2>
        </div>
        <p className="text-xs text-gray-500">سوال مورد نظر را انتخاب کنید</p>
      </div>

      <div className="flex-1  p-4">
        <Droppable
          droppableId="questionTypes"
          type="QUESTION_TYPE"
          isDropDisabled={true}
        >
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap gap-2"
            >
              {questionTypes.map((questionType, index) => (
                <div
                  key={questionType.type + "_" + index}
                  className="w-[calc(50%-4px)]"
                >
                  <QuestionType
                    type={questionType.type}
                    label={questionType.label}
                    icon={questionType.icon}
                    color={questionType.color}
                    onAdd={() => onAddQuestion(questionType.type)}
                    index={index}
                  />
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default QuestionSidebar;
