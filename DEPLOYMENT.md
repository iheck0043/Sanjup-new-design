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

## مشکل‌یابی Static Files (عکس‌ها و فایل‌های public)

### مشکل: عکس‌ها در production نمایش داده نمی‌شوند

#### راه‌حل‌ها:

1. **بررسی فایل‌های static پس از build:**
```bash
npm run check-static
```

2. **استفاده از nginx debug mode:**
```bash
# استفاده از debug configuration
docker build -t your-app-debug .
docker run -p 80:80 -v $(pwd)/nginx-debug.conf:/etc/nginx/conf.d/default.conf your-app-debug

# بررسی logs
docker logs container-name
```

3. **بررسی مسیر فایل‌ها:**
```bash
# وارد container شوید
docker exec -it container-name sh

# بررسی فایل‌ها در nginx root
ls -la /usr/share/nginx/html/
ls -la /usr/share/nginx/html/*.png
```

4. **Test کردن فایل‌های static مستقیماً:**
```bash
# در container
curl -I http://localhost/Logo-Sanjup.png
curl -I http://localhost/Logo-Sanjup-blue.png
```

### علت‌های محتمل:

- فایل‌ها در build process کپی نشده‌اند
- nginx configuration مشکل دارد
- مسیریابی nginx برای static files درست نیست
- فایل‌ها با نام متفاوت کپی شده‌اند

## نکات امنیتی

- فایل `.env` را به `.gitignore` اضافه کنید
- از متغیرهای محیطی حساس در production استفاده کنید
- برای API keys، از environment variables سرور استفاده کنید 