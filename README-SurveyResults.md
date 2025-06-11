# کامپوننت SurveyResults

این کامپوننت یک راه حل کامل برای نمایش نتایج نظرسنجی‌ها با چارت‌های تعاملی و تحلیل هوش مصنوعی است.

## ویژگی‌ها

### ✨ ویژگی‌های اصلی

- **نمودارهای تعاملی**: پشتیبانی از نمودار دایره‌ای و ستونی
- **تفکیک جنسیت**: امکان نمایش داده‌ها بر اساس جنسیت
- **تحلیل هوش مصنوعی**: تحلیل خودکار نتایج
- **Export**: امکان export نمودارها در فرمت‌های مختلف
- **Responsive**: طراحی واکنش‌گرا برای موبایل و دسکتاپ
- **RTL**: پشتیبانی کامل از راست به چپ

### 🎨 طراحی مدرن

- استفاده از ShadCN UI components
- طراحی با Tailwind CSS
- فونت فارسی Vazirmatn
- رنگ‌بندی مناسب برای کاربران ایرانی

## نصب

```bash
npm install highcharts highcharts-react-official
```

## استفاده

### استفاده پایه

```tsx
import SurveyResults from './components/SurveyResults';

// API client شما
const apiClient = {
  get: async (url: string, params?: any) => {
    // پیاده‌سازی GET request
  },
  post: async (url: string, data?: any) => {
    // پیاده‌سازی POST request
  }
};

function MyPage() {
  return (
    <SurveyResults 
      pollId="your-poll-id"
      apiClient={apiClient}
    />
  );
}
```

### مثال کامل

```tsx
import React from 'react';
import SurveyResults from './components/SurveyResults';
import axios from 'axios';

const apiClient = {
  get: async (url: string, params?: any) => {
    const response = await axios.get(`https://your-api.com/${url}`, { params });
    return response.data;
  },
  post: async (url: string, data?: any) => {
    const response = await axios.post(`https://your-api.com/${url}`, data);
    return response.data;
  }
};

function SurveyPage() {
  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">نتایج نظرسنجی</h1>
      <SurveyResults 
        pollId="123"
        apiClient={apiClient}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | توضیح |
|------|------|----------|-------|
| `pollId` | `string` | ✅ | شناسه نظرسنجی |
| `apiClient` | `object` | ⚠️ | کلاینت API با متدهای get و post |

### Interface برای apiClient

```typescript
interface ApiClient {
  get: (url: string, params?: any) => Promise<any>;
  post: (url: string, data?: any) => Promise<any>;
}
```

## API Endpoints

کامپوننت انتظار دارد که endpoint های زیر در API شما وجود داشته باشد:

### 1. دریافت سوالات
```
GET /v1/questionnaire/{pollId}/stats-questions
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "question_title": "سوال نمونه",
      "type": "multiple_choice"
    }
  ]
}
```

### 2. دریافت نتایج سوال
```
GET /v1/dashboard/{pollId}/all-answers-statics?question_id={questionId}
```

**Response:**
```json
{
  "data": [
    {
      "question_title": "سوال نمونه",
      "options": [
        {
          "value_title": "گزینه 1",
          "count": 45,
          "men_count": 25,
          "women_count": 18,
          "non_available": 2
        }
      ]
    }
  ]
}
```

### 3. دریافت تحلیل AI
```
GET /v1/ai/analyse/{pollId}?type=analyse_answers
```

### 4. ایجاد تحلیل AI جدید
```
POST /v1/ai/create-analyse-history/{pollId}
```

## مثال با Mock Data

برای تست کردن کامپوننت، می‌توانید از `SurveyResultsDemo` استفاده کنید:

```tsx
import SurveyResultsDemo from './components/SurveyResultsDemo';

function TestPage() {
  return <SurveyResultsDemo />;
}
```

## Customization

### تغییر رنگ‌های نمودار

```tsx
// در کامپوننت SurveyResults.tsx
const chartColors = [
  '#FF9300',  // نارنجی
  '#0466C8',  // آبی
  '#635985',  // بنفش
  // رنگ‌های دیگر...
];
```

### تغییر فونت

```tsx
// در تنظیمات Highcharts
style: {
  fontFamily: 'YourCustomFont, Arial, sans-serif',
}
```

## Styling

کامپوننت از Tailwind CSS استفاده می‌کند. برای تغییر استایل:

```tsx
<SurveyResults 
  pollId="123"
  apiClient={apiClient}
  className="custom-survey-results"
/>
```

## Performance Tips

1. **Lazy Loading**: برای نظرسنجی‌های بزرگ از lazy loading استفاده کنید
2. **Caching**: نتایج را در cache ذخیره کنید
3. **Pagination**: برای تعداد زیاد سوالات از pagination استفاده کنید

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

برای مشارکت در توسعه این کامپوننت:

1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را commit کنید
4. Pull request ارسال کنید

## License

MIT License

## تماس و پشتیبانی

برای سوالات یا مشکلات، لطفاً issue جدید در گیت‌هاب ایجاد کنید. 