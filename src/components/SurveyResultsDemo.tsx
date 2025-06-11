import React from "react";
import SurveyResults from "./SurveyResults";

// Mock API client for demonstration
const mockApiClient = {
  get: async (url: string, params?: any): Promise<any> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Mock API GET:", url, params);

    if (url.includes("stats-questions")) {
      return {
        data: [
          {
            id: 1,
            question_title: "رضایت از محصول چگونه است؟",
            type: "multiple_choice",
          },
          {
            id: 2,
            question_title: "محدوده سنی شما چیست؟",
            type: "single_choice",
          },
          {
            id: 3,
            question_title: "برند مورد علاقه شما کدام است؟",
            type: "single_choice",
          },
          {
            id: 4,
            question_title: "میزان استفاده روزانه چند ساعت است؟",
            type: "scale",
          },
        ],
      };
    }

    if (url.includes("all-answers-statics")) {
      const questionId = params?.question_id;

      // Mock data for different questions
      const mockData = {
        1: {
          question_title: "رضایت از محصول چگونه است؟",
          options: [
            {
              value_title: "بسیار راضی",
              count: 45,
              men_count: 25,
              women_count: 18,
              non_available: 2,
            },
            {
              value_title: "راضی",
              count: 35,
              men_count: 20,
              women_count: 13,
              non_available: 2,
            },
            {
              value_title: "متوسط",
              count: 15,
              men_count: 8,
              women_count: 6,
              non_available: 1,
            },
            {
              value_title: "ناراضی",
              count: 5,
              men_count: 2,
              women_count: 2,
              non_available: 1,
            },
          ],
        },
        2: {
          question_title: "محدوده سنی شما چیست؟",
          options: [
            {
              value_title: "18-25 سال",
              count: 30,
              men_count: 15,
              women_count: 13,
              non_available: 2,
            },
            {
              value_title: "26-35 سال",
              count: 40,
              men_count: 22,
              women_count: 16,
              non_available: 2,
            },
            {
              value_title: "36-45 سال",
              count: 20,
              men_count: 12,
              women_count: 7,
              non_available: 1,
            },
            {
              value_title: "46+ سال",
              count: 10,
              men_count: 6,
              women_count: 3,
              non_available: 1,
            },
          ],
        },
        3: {
          question_title: "برند مورد علاقه شما کدام است؟",
          options: [
            {
              value_title: "سامسونگ",
              count: 25,
              men_count: 15,
              women_count: 9,
              non_available: 1,
            },
            {
              value_title: "اپل",
              count: 35,
              men_count: 18,
              women_count: 15,
              non_available: 2,
            },
            {
              value_title: "هوآوی",
              count: 20,
              men_count: 10,
              women_count: 8,
              non_available: 2,
            },
            {
              value_title: "شیائومی",
              count: 20,
              men_count: 12,
              women_count: 7,
              non_available: 1,
            },
          ],
        },
        4: {
          question_title: "میزان استفاده روزانه چند ساعت است؟",
          options: [
            {
              value_title: "کمتر از 2 ساعت",
              count: 15,
              men_count: 8,
              women_count: 6,
              non_available: 1,
            },
            {
              value_title: "2-4 ساعت",
              count: 35,
              men_count: 18,
              women_count: 15,
              non_available: 2,
            },
            {
              value_title: "4-6 ساعت",
              count: 30,
              men_count: 16,
              women_count: 12,
              non_available: 2,
            },
            {
              value_title: "بیش از 6 ساعت",
              count: 20,
              men_count: 13,
              women_count: 6,
              non_available: 1,
            },
          ],
        },
      };

      return {
        data: [mockData[questionId as keyof typeof mockData] || mockData[1]],
      };
    }

    if (url.includes("ai/analyse")) {
      return {
        data: {
          last_analyse_result: {
            result:
              "بر اساس تحلیل داده‌های جمع‌آوری شده، نتایج نشان می‌دهد که اکثر پاسخ‌دهندگان (45%) رضایت بالایی از محصول دارند. گروه سنی 26-35 سال بیشترین مشارکت را در نظرسنجی داشته‌اند. همچنین برند اپل با 35% بیشترین محبوبیت را در بین کاربران دارد. میزان استفاده روزانه 2-4 ساعت در بین اکثر کاربران رایج است که نشان‌دهنده استفاده متعادل از محصول می‌باشد. این آمار نشان می‌دهد که محصول در بازار موقعیت مناسبی دارد و کاربران از آن راضی هستند.",
          },
        },
      };
    }

    return { data: null };
  },

  post: async (url: string, data?: any): Promise<any> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Mock API POST:", url, data);

    if (url.includes("create-analyse-history")) {
      return {
        data: {
          result:
            "تحلیل جدید هوش مصنوعی در حال پردازش است و به زودی نتایج آماده خواهد شد.",
        },
      };
    }

    return { data: null };
  },
};

const SurveyResultsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            نمایش نتایج نظرسنجی
          </h1>
          <p className="text-gray-600">
            این یک نمونه از کامپوننت نمایش نتایج نظرسنجی با داده‌های تست است
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <SurveyResults pollId="demo-poll-123" apiClient={mockApiClient} />
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            راهنمای استفاده
          </h2>
          <div className="space-y-2 text-blue-800">
            <p>
              • برای استفاده از این کامپوننت، یک apiClient و pollId ارائه دهید
            </p>
            <p>
              • کامپوننت شامل سه تب اصلی است: خلاصه نتایج، جزئیات پاسخ کاربران و
              تحلیل هوش مصنوعی
            </p>
            <p>• امکان تفکیک نتایج بر اساس جنسیت در هر سوال وجود دارد</p>
            <p>
              • نمودارها با استفاده از Highcharts ساخته شده و قابلیت export
              دارند
            </p>
            <p>• طراحی responsive و سازگار با موبایل است</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold text-green-900 mb-4">
            ویژگی‌های کلیدی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
            <div>
              <h3 className="font-medium mb-2">نمودارهای تعاملی</h3>
              <p className="text-sm">
                نمودار دایره‌ای و ستونی با قابلیت export
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">تفکیک جنسیت</h3>
              <p className="text-sm">امکان نمایش داده‌ها بر اساس جنسیت</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">تحلیل هوش مصنوعی</h3>
              <p className="text-sm">تحلیل خودکار نتایج با استفاده از AI</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">طراحی مدرن</h3>
              <p className="text-sm">استفاده از ShadCN UI و Tailwind CSS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResultsDemo;
