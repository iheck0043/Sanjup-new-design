# راهنمای Deployment

## تنظیم متغیرهای محیطی

### 1. ایجاد فایل .env

برای development، فایل `.env` را در root پروژه ایجاد کنید:

```bash
# .env
VITE_BASE_URL=http://localhost:3000
```

برای production:

```bash
# .env
VITE_BASE_URL=https://your-api-server.com
```

### 2. استفاده از Docker

#### Build با متغیر محیطی:

```bash
# Build image با BASE_URL
docker build --build-arg VITE_BASE_URL=https://your-api-server.com -t your-app .

# Run container
docker run -p 80:80 your-app
```

#### استفاده از Docker Compose:

```bash
# تنظیم متغیر محیطی
export VITE_BASE_URL=https://your-api-server.com

# Run production
docker-compose up app

# Run development
docker-compose up app-dev
```

### 3. در محیط Cloud (مثل Vercel، Netlify):

در تنظیمات پروژه خود، متغیر محیطی زیر را اضافه کنید:

```
VITE_BASE_URL=https://your-api-server.com
```

### 4. مشکل‌یابی

اگر BASE_URL همچنان کار نمی‌کند:

1. بررسی کنید که متغیر محیطی با `VITE_` شروع شود
2. پس از تغییر .env، پروژه را دوباره build کنید
3. در console مرورگر، مقدار BASE_URL را بررسی کنید

```javascript
console.log('BASE_URL:', import.meta.env.VITE_BASE_URL);
```

## نکات امنیتی

- فایل `.env` را به `.gitignore` اضافه کنید
- از متغیرهای محیطی حساس در production استفاده کنید
- برای API keys، از environment variables سرور استفاده کنید 