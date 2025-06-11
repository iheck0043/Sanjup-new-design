# Multi-stage build for React/Vite application

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install for production
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install Node.js for runtime if needed (optional)
RUN apk add --no-cache nodejs npm

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user if it doesn't exist
RUN addgroup -g 101 -S nginx || true
RUN adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 