
import React from 'react';
import { ArrowLeft, Share2, Eye, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ formTitle, setFormTitle }) => {
  const navigate = useNavigate();

  return (
    <div className="h-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/surveys')}
          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-gray-300"></div>
        
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 min-w-0 max-w-md"
          placeholder="عنوان فرم"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Settings className="w-4 h-4 ml-2" />
          تنظیمات
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Eye className="w-4 h-4 ml-2" />
          پیش‌نمایش
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Share2 className="w-4 h-4 ml-2" />
          انتشار
        </Button>
      </div>
    </div>
  );
};

export default FormHeader;
