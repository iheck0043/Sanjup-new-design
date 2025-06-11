# کامپوننت SurveyResultsReal - نتایج نظرسنجی با API واقعی

کامپوننت `SurveyResultsReal` نسخه‌ای از کامپوننت نتایج نظرسنجی است که به جای استفاده از داده‌های ماک، مستقیماً از API های واقعی سرور اطلاعات را دریافت می‌کند.

## ویژگی‌ها

### 🔗 اتصال به API واقعی
- استفاده از endpoint های مشابه کد Vue اصلی
- مدیریت توکن احراز هویت
- پشتیبانی از متغیرهای محیطی

### 📊 نمایش داده‌ها
- نمودارهای دایره‌ای و ستونی
- تفکیک بر اساس جنسیت
- انیمیشن loading
- مدیریت خطاها

### 🤖 تحلیل هوش مصنوعی
- بارگذاری خودکار تحلیل موجود
- ایجاد تحلیل جدید در صورت نیاز
- نمایش وضعیت درخواست‌ها

## نصب و راه‌اندازی

### 1. تنظیم متغیرهای محیطی

فایل `.env` خود را ایجاد کنید:

```bash
# API Base URL
REACT_APP_API_BASE_URL=https://your-api-domain.com
```

### 2. تنظیم احراز هویت

یکی از روش‌های زیر را انتخاب کنید:

**روش اول: localStorage**
```javascript
localStorage.setItem('auth-token', 'your-jwt-token');
```

**روش دوم: sessionStorage**
```javascript
sessionStorage.setItem('auth-token', 'your-jwt-token');
```

### 3. استفاده از کامپوننت

```tsx
import SurveyResultsReal from "./components/SurveyResultsReal";

function App() {
  return (
    <div>
      <SurveyResultsReal pollId="your-poll-id" />
    </div>
  );
}
```

## API Endpoints

کامپوننت از endpoint های زیر استفاده می‌کند:

### دریافت سوالات
```
GET /v1/questionnaire/{pollId}/stats-questions
```

### دریافت نتایج هر سوال
```
GET /v1/dashboard/{pollId}/all-answers-statics?question_id={questionId}
```

### دریافت تحلیل هوش مصنوعی
```
GET /v1/ai/analyse/{pollId}?type=analyse_answers
```

### ایجاد تحلیل هوش مصنوعی جدید
```
POST /v1/ai/create-analyse-history/{pollId}
Body: { "type": "analyse_answers" }
```

## ساختار داده‌ها

### Question
```typescript
interface Question {
  id: number;
  question_title: string;
  type: string; // فیلتر می‌شود: text_question و statement حذف می‌شوند
}
```

### SurveyOption
```typescript
interface SurveyOption {
  value_title: string;
  count: number;
  men_count: number;
  women_count: number;
  non_available: number;
}
```

### AIAnalysisResult
```typescript
interface AIAnalysisResult {
  last_analyse_result?: {
    result: string;
  };
  request_count?: number;
  max_requests?: number;
}
```

## استفاده پیشرفته

### کنترل pollId دینامیک
```tsx
const [pollId, setPollId] = useState<string>("");

return (
  <div>
    <input 
      value={pollId}
      onChange={(e) => setPollId(e.target.value)}
      placeholder="شناسه نظرسنجی را وارد کنید"
    />
    {pollId && <SurveyResultsReal pollId={pollId} />}
  </div>
);
```

### مدیریت حالت loading
```tsx
// کامپوننت خود مدیریت loading را انجام می‌دهد
// اما می‌توانید با استفاده از useApi به صورت جداگانه کنترل کنید
const questionsApi = useApi(`v1/questionnaire/${pollId}/stats-questions`);

if (questionsApi.loading) {
  return <div>در حال بارگذاری...</div>;
}
```

## مدیریت خطاها

کامپوننت خطاهای مختلف را مدیریت می‌کند:

- خطای اتصال به شبکه
- خطای احراز هویت (401)
- خطای دسترسی (403)
- خطای عدم وجود داده (404)
- خطاهای سرور (5xx)

## پشتیبانی از RTL

کامپوننت کاملاً از زبان فارسی و RTL پشتیبانی می‌کند:

- متن‌ها از راست به چپ
- جهت فلکس و grid ها
- فونت‌های مناسب فارسی
- نمودارها با پشتیبانی RTL

## Demo

برای مشاهده demo:

1. به `/survey-results-real` بروید
2. شناسه نظرسنجی خود را در کد قرار دهید
3. متغیرهای محیطی را تنظیم کنید
4. توکن احراز هویت را اضافه کنید

## عیب‌یابی

### خطای "Cannot find module 'highcharts'"
اگر می‌خواهید از Highcharts استفاده کنید:
```bash
npm install highcharts highcharts-react-official
```

### خطای CORS
متأکد شوید سرور شما header های CORS مناسب را تنظیم کرده است.

### خطای احراز هویت
بررسی کنید که توکن در localStorage یا sessionStorage ذخیره شده باشد.

### خطای Base URL
مطمئن شوید که `REACT_APP_API_BASE_URL` به درستی تنظیم شده است.

## مقایسه با نسخه Demo

| ویژگی | SurveyResults (Demo) | SurveyResultsReal |
|--------|---------------------|-------------------|
| منبع داده | Mock Data | Real API |
| Highcharts | ✅ | ❌ (ساده‌شده) |
| احراز هویت | ❌ | ✅ |
| مدیریت خطا | محدود | کامل |
| Loading States | شبیه‌سازی | واقعی |
| AI Analysis | Mock | واقعی |

## مشارکت

برای بهبود این کامپوننت:

1. خطاهای احتمالی را گزارش دهید
2. ویژگی‌های جدید پیشنهاد کنید
3. بهینه‌سازی‌های عملکرد ارائه دهید
4. مستندات را بهبود دهید

## نسخه

نسخه فعلی: 1.0.0

## مجوز

MIT License 