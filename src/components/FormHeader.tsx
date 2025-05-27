
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Eye, Share2, MoreVertical } from 'lucide-react';

const FormHeader = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">سازنده فرم</h1>
          </div>
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-500 font-medium">فعال</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
            <Eye className="w-4 h-4 ml-2" />
            پیش‌نمایش
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
            <Share2 className="w-4 h-4 ml-2" />
            اشتراک
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">
            <Settings className="w-4 h-4 ml-2" />
            تنظیمات
          </Button>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200"
            size="sm"
          >
            انتشار
          </Button>
        </div>
      </div>
    </header>
  );
};

export default FormHeader;
