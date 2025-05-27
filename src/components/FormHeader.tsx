
import React from 'react';
import { Button } from '@/components/ui/button';

const FormHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <h1 className="text-xl font-semibold text-gray-900">صفحه خوش‌آمدگویی</h1>
          <span className="text-sm text-gray-500">+</span>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <Button variant="ghost" size="sm" className="text-gray-600">
            فعال
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            پشتیبانی
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            ایجاد
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            طراحی
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            تحلیلات
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            ارسال
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            گزارش
          </Button>
        </div>
      </div>
    </header>
  );
};

export default FormHeader;
