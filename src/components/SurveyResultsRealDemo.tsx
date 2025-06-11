import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Server, Database, Brain } from "lucide-react";
import SurveyResultsReal from "./SurveyResultsReal";

const SurveyResultsRealDemo: React.FC = () => {
  // شناسه نظرسنجی که می‌خواهید نتایج آن را ببینید
  const pollId = "your-poll-id-here"; // این مقدار را با شناسه واقعی نظرسنجی خود جایگزین کنید

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            نتایج نظرسنجی - استفاده از API واقعی
          </h1>
          <p className="text-gray-600">
            این کامپوننت از API های واقعی برای دریافت اطلاعات استفاده می‌کند
          </p>
        </div>

        {/* API Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Info className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-800">اطلاعات API</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Server className="w-4 h-4 text-green-600" />
                <div className="text-sm">
                  <Badge variant="outline" className="mb-1">
                    سوالات
                  </Badge>
                  <p className="text-xs text-gray-600">
                    v1/questionnaire/{pollId}/stats-questions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Database className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <Badge variant="outline" className="mb-1">
                    نتایج
                  </Badge>
                  <p className="text-xs text-gray-600">
                    v1/dashboard/{pollId}/all-answers-statics
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Brain className="w-4 h-4 text-purple-600" />
                <div className="text-sm">
                  <Badge variant="outline" className="mb-1">
                    تحلیل AI
                  </Badge>
                  <p className="text-xs text-gray-600">
                    v1/ai/analyse/{pollId}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>نکته مهم:</strong> برای استفاده از این کامپوننت، باید موارد
            زیر را انجام دهید:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                متغیر محیطی <code>REACT_APP_API_BASE_URL</code> را تنظیم کنید
              </li>
              <li>
                شناسه نظرسنجی صحیح را در <code>pollId</code> قرار دهید
              </li>
              <li>
                توکن احراز هویت در localStorage یا sessionStorage ذخیره شده باشد
              </li>
              <li>سرور API در دسترس و فعال باشد</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Survey Results Component */}
        <SurveyResultsReal pollId={pollId} />

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>ویژگی‌های کامپوننت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li>✅ استفاده از API های واقعی</li>
                <li>✅ مدیریت حالت‌های loading</li>
                <li>✅ تفکیک جنسیت</li>
                <li>✅ تغییر نوع نمودار (دایره‌ای/ستونی)</li>
                <li>✅ پشتیبانی از RTL</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>✅ تحلیل هوش مصنوعی</li>
                <li>✅ مدیریت خطاها</li>
                <li>✅ رابط کاربری مدرن</li>
                <li>✅ پاسخگویی موبایل</li>
                <li>✅ TypeScript</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle>نحوه استفاده</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto"
              dir="ltr"
            >
              {`import SurveyResultsReal from "./components/SurveyResultsReal";

// در فایل .env
REACT_APP_API_BASE_URL=https://your-api-domain.com

// استفاده در کامپوننت
<SurveyResultsReal pollId="your-poll-id" />`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyResultsRealDemo;
