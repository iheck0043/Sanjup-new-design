
import React, { useState } from 'react';
import { Plus, Trash2, Copy, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Survey {
  id: string;
  title: string;
  progress: number;
  status: 'فعال' | 'خاموش' | 'پیش‌نویس';
  responses: number;
  createdAt: string;
}

const Surveys = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      title: 'نظرسنجی رضایت مشتریان',
      progress: 65,
      status: 'فعال',
      responses: 142,
      createdAt: '۱۴۰۳/۰۸/۱۵'
    },
    {
      id: '2', 
      title: 'بررسی کیفیت خدمات',
      progress: 30,
      status: 'فعال',
      responses: 89,
      createdAt: '۱۴۰۳/۰۸/۱۰'
    },
    {
      id: '3',
      title: 'نظرسنجی محصولات جدید',
      progress: 0,
      status: 'پیش‌نویس',
      responses: 0,
      createdAt: '۱۴۰۳/۰۸/۰۸'
    }
  ]);

  const handleDeleteSurvey = (id: string) => {
    setSurveys(prev => prev.filter(survey => survey.id !== id));
  };

  const handleDuplicateSurvey = (survey: Survey) => {
    const duplicated: Survey = {
      ...survey,
      id: Date.now().toString(),
      title: `کپی ${survey.title}`,
      progress: 0,
      responses: 0,
      status: 'پیش‌نویس',
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    setSurveys(prev => [duplicated, ...prev]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'فعال': return 'bg-green-100 text-green-700 border-green-200';
      case 'خاموش': return 'bg-red-100 text-red-700 border-red-200';
      case 'پیش‌نویس': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-['Vazirmatn']" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">نظرسنجی‌ها</h1>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {surveys.length} نظرسنجی
              </div>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              نظرسنجی جدید
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز نظرسنجی‌ای ندارید</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              اولین نظرسنجی خود را ایجاد کنید و شروع به جمع‌آوری بازخورد کنید
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              ایجاد نظرسنجی جدید
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-all duration-200 border-gray-200/50 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => navigate('/')}
                        >
                          {survey.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)}`}>
                          {survey.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">پیشرفت پاسخ‌دهندگان</p>
                          <div className="flex items-center gap-3">
                            <Progress value={survey.progress} className="flex-1 h-2" />
                            <span className="text-sm font-medium text-gray-700 w-12">{survey.progress}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">تعداد پاسخ</p>
                          <p className="text-lg font-semibold text-gray-900">{survey.responses}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">تاریخ ایجاد</p>
                          <p className="text-sm text-gray-700">{survey.createdAt}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateSurvey(survey)}
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;
