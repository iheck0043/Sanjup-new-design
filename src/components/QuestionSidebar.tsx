import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Text, 
  SquareCheck, 
  ListCheck, 
  Hash,
  Mail,
  Link,
  ArrowUp,
  ArrowDown,
  SquarePlus
} from 'lucide-react';

interface QuestionTypeProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onAdd: () => void;
}

const QuestionType: React.FC<QuestionTypeProps> = ({ type, label, icon, color, onAdd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'question',
    item: { type },
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        onAdd();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${color} ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onAdd}
    >
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </div>
  );
};

interface QuestionSidebarProps {
  onAddQuestion: (type: string) => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({ onAddQuestion }) => {
  const questionTypes = [
    {
      type: 'متنی با پاسخ کوتاه',
      label: 'متنی با پاسخ کوتاه',
      icon: <Text className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      type: 'متنی با پاسخ بلند',
      label: 'متنی با پاسخ بلند',
      icon: <Text className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      type: 'گروه سوال',
      label: 'گروه سوال',
      icon: <SquarePlus className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      type: 'چندگزینه‌ای',
      label: 'چندگزینه‌ای',
      icon: <SquareCheck className="w-5 h-5 text-pink-600" />,
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
    },
    {
      type: 'چندگزینه‌ای تصویری',
      label: 'چندگزینه‌ای تصویری',
      icon: <SquareCheck className="w-5 h-5 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      type: 'لیست کشویی',
      label: 'لیست کشویی',
      icon: <ListCheck className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100'
    },
    {
      type: 'طیفی',
      label: 'طیفی',
      icon: <ArrowUp className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    },
    {
      type: 'درخت‌بندی',
      label: 'درخت‌بندی',
      icon: <ArrowDown className="w-5 h-5 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      type: 'اولویت‌دهی',
      label: 'اولویت‌دهی',
      icon: <ArrowUp className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      type: 'لینک/وب‌سایت',
      label: 'لینک/وب‌سایت',
      icon: <Link className="w-5 h-5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
    },
    {
      type: 'متن بدون پاسخ',
      label: 'متن بدون پاسخ',
      icon: <Text className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      type: 'درگاه پرداخت',
      label: 'درگاه پرداخت',
      icon: <SquareCheck className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      type: 'عدد',
      label: 'عدد',
      icon: <Hash className="w-5 h-5 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      type: 'ایمیل',
      label: 'ایمیل',
      icon: <Mail className="w-5 h-5 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      type: 'صفحه پایان',
      label: 'صفحه پایان',
      icon: <SquareCheck className="w-5 h-5 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">صفحه خوش‌آمد گویی</h2>
        <button className="text-sm text-gray-500 hover:text-gray-700">←</button>
      </div>
      
      <div className="space-y-3">
        {questionTypes.map((questionType) => (
          <QuestionType
            key={questionType.type}
            type={questionType.type}
            label={questionType.label}
            icon={questionType.icon}
            color={questionType.color}
            onAdd={() => onAddQuestion(questionType.type)}
          />
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>متغیرهای محاسباتی</span>
          <button className="text-blue-600 hover:text-blue-700">Fx</button>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>درج اطلاعات مخفی</span>
          <button className="text-blue-600 hover:text-blue-700">&lt;/&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSidebar;
