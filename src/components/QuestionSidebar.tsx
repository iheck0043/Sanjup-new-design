
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
  SquarePlus,
  BarChart3,
  CreditCard,
  Flag
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
      className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${color} ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      onClick={onAdd}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
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
      label: 'متن کوتاه',
      icon: <Text className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      type: 'متنی با پاسخ بلند',
      label: 'متن بلند',
      icon: <Text className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      type: 'گروه سوال',
      label: 'گروه سوال',
      icon: <SquarePlus className="w-4 h-4 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      type: 'چندگزینه‌ای',
      label: 'چندگزینه‌ای',
      icon: <SquareCheck className="w-4 h-4 text-pink-600" />,
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
    },
    {
      type: 'چندگزینه‌ای تصویری',
      label: 'چندگزینه تصویری',
      icon: <SquareCheck className="w-4 h-4 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    },
    {
      type: 'لیست کشویی',
      label: 'لیست کشویی',
      icon: <ListCheck className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100'
    },
    {
      type: 'طیفی',
      label: 'طیفی',
      icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    },
    {
      type: 'درخت‌بندی',
      label: 'درخت‌بندی',
      icon: <ArrowDown className="w-4 h-4 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    },
    {
      type: 'اولویت‌دهی',
      label: 'اولویت‌دهی',
      icon: <ArrowUp className="w-4 h-4 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      type: 'لینک/وب‌سایت',
      label: 'لینک',
      icon: <Link className="w-4 h-4 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
    },
    {
      type: 'متن بدون پاسخ',
      label: 'متن توضیحی',
      icon: <Text className="w-4 h-4 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    },
    {
      type: 'درگاه پرداخت',
      label: 'پرداخت',
      icon: <CreditCard className="w-4 h-4 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      type: 'عدد',
      label: 'عدد',
      icon: <Hash className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      type: 'ایمیل',
      label: 'ایمیل',
      icon: <Mail className="w-4 h-4 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100'
    },
    {
      type: 'صفحه پایان',
      label: 'صفحه پایان',
      icon: <Flag className="w-4 h-4 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">انواع سوالات</h2>
        <p className="text-sm text-gray-500">سوال مورد نظر را انتخاب کنید</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
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
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="space-y-3 text-sm">
          <button className="flex items-center justify-between w-full text-gray-600 hover:text-blue-600 transition-colors">
            <span>متغیرهای محاسباتی</span>
            <span className="text-blue-600 font-mono">Fx</span>
          </button>
          <button className="flex items-center justify-between w-full text-gray-600 hover:text-blue-600 transition-colors">
            <span>درج اطلاعات مخفی</span>
            <span className="text-blue-600 font-mono">&lt;/&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSidebar;
