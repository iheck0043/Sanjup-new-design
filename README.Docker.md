# Docker Configuration for Form Farsi Builder

این پروژه شامل کانفیگوریشن کامل Docker برای محیط‌های توسعه و تولید می‌باشد.

## 📁 فایل‌های Docker

- `Dockerfile` - کانفیگوریشن اصلی برای محیط تولید
- `Dockerfile.dev` - کانفیگوریشن برای محیط توسعه
- `docker-compose.yml` - کانفیگوریشن تولید با docker-compose
- `docker-compose.dev.yml` - کانفیگوریشن توسعه با docker-compose
- `nginx.conf` - کانفیگوریشن nginx برای serve کردن React app
- `.dockerignore` - فایل‌های قابل نادیده گیری در build
- `Makefile` - دستورات آسان برای مدیریت Docker

## 🚀 راه‌اندازی سریع

### محیط تولید (Production)

```bash
# ساخت و اجرای کامل
make setup-prod

# یا به صورت جداگانه
make build
make up
```

### محیط توسعه (Development)

```bash
# ساخت و اجرای محیط توسعه با hot reload
make setup-dev

# یا به صورت جداگانه
make build-dev
make up-dev
```

## 📋 دستورات Makefile

### دستورات اصلی

```bash
make help           # نمایش راهنما
make build          # ساخت image تولید
make build-dev      # ساخت image توسعه
make up             # اجرای services تولید
make up-dev         # اجرای services توسعه
make down           # توقف همه services
```

### دستورات مدیریت

```bash
make logs           # نمایش logs
make logs-dev       # نمایش logs توسعه
make shell          # باز کردن shell در container
make stop           # توقف containers
make clean          # پاک کردن containers و images
make health         # بررسی وضعیت containers
```

## 🏗️ معماری Docker

### Multi-stage Build (Dockerfile)

1. **Stage 1 (Builder)**: 
   - نصب dependencies
   - Build کردن React app با Vite
   
2. **Stage 2 (Production)**:
   - Nginx alpine image
   - کپی فایل‌های build شده
   - کانفیگوریشن nginx برای SPA routing

### Development Setup (Dockerfile.dev)

- Node.js alpine image
- Mount کردن source code برای hot reload
- Vite dev server با host binding

## 🌐 پورت‌ها و دسترسی

- **تولید**: http://localhost:80
- **توسعه**: http://localhost:5173

## 📦 ویژگی‌های nginx

- **Gzip compression** برای فایل‌های استاتیک
- **Caching headers** برای بهبود performance
- **Security headers** برای امنیت
- **SPA routing support** برای React Router
- **Health check endpoint**

## 🔧 کانفیگوریشن محیط

### متغیرهای محیط

```bash
# تولید
NODE_ENV=production

# توسعه  
NODE_ENV=development
VITE_BASE_URL=http://localhost:3000
```

### Volumes

```yaml
# محیط توسعه
volumes:
  - .:/app                    # Hot reload
  - /app/node_modules         # Preserve node_modules
  
# محیط تولید
volumes:
  - ./logs/nginx:/var/log/nginx  # Nginx logs
```

## 🏥 Health Check

Container شامل health check اتوماتیک است:

```bash
# بررسی manual
docker exec form-farsi-builder curl -f http://localhost:80/

# نمایش وضعیت
make health
```

## 🔍 عیب‌یابی

### مشاهده logs

```bash
# Production logs
make logs

# Development logs  
make logs-dev

# Nginx logs
docker exec form-farsi-builder tail -f /var/log/nginx/error.log
```

### دسترسی به shell

```bash
# Production container
make shell

# Development container
make shell-dev
```

### پاک کردن کامل

```bash
# پاک کردن همه چیز
make clean

# حذف images دستی
docker system prune -a
```

## 🚀 استقرار در production

### با Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd form-farsi-builder

# ساخت و اجرا
make setup-prod

# بررسی وضعیت
make health
```

### با Docker مستقیم

```bash
# ساخت image
docker build -t form-farsi-builder:latest .

# اجرا
docker run -d --name form-farsi-builder -p 80:80 form-farsi-builder:latest
```

## 📈 بهینه‌سازی

- **Multi-stage build** برای کاهش حجم final image
- **Alpine Linux** برای کمترین حجم
- **nginx** برای serve کردن بهینه فایل‌های استاتیک
- **.dockerignore** برای کاهش build context
- **Layer caching** با کپی جداگانه package.json

## 🔒 امنیت

- اجرای nginx با user غیر root
- Security headers در nginx
- کمترین dependencies در production image
- Health check برای monitoring

## 📞 پشتیبانی

در صورت مشکل با Docker setup:

1. بررسی logs: `make logs`
2. بررسی health: `make health`  
3. پاک کردن و شروع مجدد: `make clean && make setup-prod` 

# راهنمای استفاده از Docker

این پروژه شامل پیکربندی کامل Docker برای اجرای اپلیکیشن React/TypeScript است.

## فایل‌های Docker

- `Dockerfile`: فایل اصلی Docker با سه مرحله (builder, development, production)
- `docker-compose.yml`: پیکربندی کامپوز برای اجرای آسان
- `nginx.conf`: پیکربندی nginx برای سرو کردن اپلیکیشن
- `.dockerignore`: فایل‌هایی که باید از build context حذف شوند

## مراحل Build

### 1. Builder Stage
- استفاده از Node.js 18 Alpine
- نصب dependencies و build اپلیکیشن

### 2. Development Stage  
- محیط توسعه با hot reload
- پورت 8080

### 3. Production Stage
- استفاده از nginx برای سرو کردن فایل‌های static
- پورت 80
- بهینه‌سازی برای production

## دستورات

### Build کردن image

```bash
# Build production image
docker build -t form-builder:production .

# Build development image
docker build --target development -t form-builder:dev .
```

### اجرای Container

```bash
# Production
docker run -p 80:80 form-builder:production

# Development
docker run -p 8080:8080 form-builder:dev
```

### استفاده از Docker Compose

```bash
# اجرای production
docker-compose up -d

# اجرای development
docker-compose -f docker-compose.dev.yml up -d

# نمایش logs
docker-compose logs -f

# توقف containers
docker-compose down
```

## ویژگی‌های nginx

- **Client-side routing**: پشتیبانی از React Router
- **Gzip compression**: فشرده‌سازی فایل‌ها
- **Static caching**: کش طولانی‌مدت برای assets
- **Security headers**: هدرهای امنیتی
- **Health check**: بررسی سلامت container

## متغیرهای محیطی

می‌توانید متغیرهای محیطی را در docker-compose.yml تنظیم کنید:

```yaml
environment:
  - NODE_ENV=production
  - REACT_APP_API_URL=https://api.example.com
```

## پورت‌ها

- **Development**: 8080
- **Production**: 80
- **Health check**: `/` endpoint

## بهینه‌سازی

- استفاده از multi-stage build برای کاهش حجم image
- Alpine images برای کاهش حجم
- .dockerignore برای سرعت بیشتر build
- nginx برای سرعت بالا در production

## عیب‌یابی

```bash
# وارد شدن به container
docker exec -it form-farsi-builder sh

# نمایش logs
docker logs form-farsi-builder

# بررسی nginx configuration
docker exec form-farsi-builder nginx -t
```

## یادداشت‌ها

- پروژه از Vite به عنوان bundler استفاده می‌کند
- پشتیبانی از RTL و زبان فارسی
- آماده برای deploy در production
- قابلیت scale کردن با docker-compose 