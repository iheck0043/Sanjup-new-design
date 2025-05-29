
import React, { useState } from 'react';
import { Plus, Trash2, Copy, Eye, Search, Filter, MoreVertical, Calendar, TrendingUp } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'فعال': 
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          border: 'border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'خاموش': 
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-700', 
          border: 'border-red-200',
          dot: 'bg-red-500'
        };
      case 'پیش‌نویس': 
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-700', 
          border: 'border-amber-200',
          dot: 'bg-amber-500'
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-700', 
          border: 'border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-['Vazirmatn']" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">نظرسنجی‌ها</h1>
              <p className="text-gray-600">مدیریت و ساخت نظرسنجی‌های خود</p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              نظرسنجی جدید
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">کل نظرسنجی‌ها</p>
                  <p className="text-3xl font-bold text-gray-900">{surveys.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">نظرسنجی‌های فعال</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {surveys.filter(s => s.status === 'فعال').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">کل پاسخ‌ها</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {surveys.reduce((total, survey) => total + survey.responses, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در نظرسنجی‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 px-4 py-3">
            <Filter className="w-4 h-4" />
            فیلتر
          </Button>
        </div>

        {/* Surveys List */}
        {filteredSurveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز نظرسنجی‌ای ندارید</h3>
            <p className="text-gray-500 mb-8 text-center max-w-md">
              اولین نظرسنجی خود را ایجاد کنید و شروع به جمع‌آوری بازخورد کنید
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              ایجاد نظرسنجی جدید
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSurveys.map((survey) => {
              const statusConfig = getStatusConfig(survey.status);
              
              return (
                <Card key={survey.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 
                            className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate('/')}
                          >
                            {survey.title}
                          </h3>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                            <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                            {survey.status}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">پیشرفت</span>
                              <span className="text-sm font-semibold text-gray-900">{survey.progress}%</span>
                            </div>
                            <Progress value={survey.progress} className="h-2 bg-gray-100" />
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">تعداد پاسخ</p>
                              <p className="text-lg font-semibold text-gray-900">{survey.responses}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">تاریخ ایجاد</p>
                              <p className="text-sm font-medium text-gray-900">{survey.createdAt}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateSurvey(survey)}
                          className="h-9 w-9 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;
