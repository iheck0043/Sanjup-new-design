
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
  Flag,
  Sparkles
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
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`group flex items-center p-2.5 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm hover:scale-[1.02] ${color} ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      onClick={onAdd}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-700 truncate">{label}</span>
      </div>
    </div>
  );
};

interface QuestionSidebarProps {
  onAddQuestion: (type: string, insertIndex?: number) => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({ onAddQuestion }) => {
  const questionTypes = [
    {
      type: 'متنی با پاسخ کوتاه',
      label: 'متن کوتاه',
      icon: <Text className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200'
    },
    {
      type: 'متنی با پاسخ بلند',
      label: 'متن بلند',
      icon: <Text className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-200'
    },
    {
      type: 'گروه سوال',
      label: 'گروه سوال',
      icon: <SquarePlus className="w-4 h-4 text-green-600" />,
      color: 'bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-200'
    },
    {
      type: 'چندگزینه‌ای',
      label: 'چندگزینه‌ای',
      icon: <SquareCheck className="w-4 h-4 text-pink-600" />,
      color: 'bg-pink-50 border-pink-100 hover:bg-pink-100 hover:border-pink-200'
    },
    {
      type: 'چندگزینه‌ای تصویری',
      label: 'چندگزینه تصویری',
      icon: <SquareCheck className="w-4 h-4 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100 hover:border-yellow-200'
    },
    {
      type: 'لیست کشویی',
      label: 'لیست کشویی',
      icon: <ListCheck className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-50 border-teal-100 hover:bg-teal-100 hover:border-teal-200'
    },
    {
      type: 'طیفی',
      label: 'طیفی',
      icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
    },
    {
      type: 'درخت‌بندی',
      label: 'درخت‌بندی',
      icon: <ArrowDown className="w-4 h-4 text-orange-600" />,
      color: 'bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-200'
    },
    {
      type: 'اولویت‌دهی',
      label: 'اولویت‌دهی',
      icon: <ArrowUp className="w-4 h-4 text-red-600" />,
      color: 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200'
    },
    {
      type: 'لینک/وب‌سایت',
      label: 'لینک',
      icon: <Link className="w-4 h-4 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-100 hover:bg-cyan-100 hover:border-cyan-200'
    },
    {
      type: 'متن بدون پاسخ',
      label: 'متن توضیحی',
      icon: <Text className="w-4 h-4 text-gray-600" />,
      color: 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
    },
    {
      type: 'درگاه پرداخت',
      label: 'پرداخت',
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200'
    },
    {
      type: 'عدد',
      label: 'عدد',
      icon: <Hash className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200'
    },
    {
      type: 'ایمیل',
      label: 'ایمیل',
      icon: <Mail className="w-4 h-4 text-red-600" />,
      color: 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200'
    },
    {
      type: 'صفحه پایان',
      label: 'صفحه پایان',
      icon: <Flag className="w-4 h-4 text-gray-600" />,
      color: 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
    }
  ];

  return (
    <div className="w-96 bg-white/90 backdrop-blur-sm border-l border-gray-200/70 h-screen overflow-hidden flex flex-col fixed left-0 top-0 z-10">
      <div className="p-4 border-b border-gray-200/50 mt-20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">انواع سوالات</h2>
        </div>
        <p className="text-xs text-gray-500">سوال مورد نظر را انتخاب کنید</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
};

export default QuestionSidebar;
