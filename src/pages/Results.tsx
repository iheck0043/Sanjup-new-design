
import React from 'react';
import FormHeader from '../components/FormHeader';
import { BarChart3, Download, Eye } from 'lucide-react';

const Results = () => {
  const [formTitle, setFormTitle] = React.useState('بدون عنوان');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col font-['Vazirmatn']" dir="rtl">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">گزارش نتایج</h2>
          <p className="text-gray-600 mb-8">
            در این بخش می‌توانید نتایج پرسش‌نامه را مشاهده کرده و گزارش‌های مختلف را دریافت کنید.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">مشاهده نتایج</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Download className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">دانلود گزارش</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
