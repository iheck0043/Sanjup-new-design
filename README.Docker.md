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