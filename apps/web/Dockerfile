# apps/web/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ============================================
# STAGE 1: Install dependencies
# ============================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ============================================
# STAGE 2: Build
# ============================================
FROM base AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# NOTE: Using stage index (1) instead of name due to Coolify ARG injection issues
COPY --from=1 /app/node_modules ./node_modules
COPY --from=1 /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=1 /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build web app
WORKDIR /app/apps/web
RUN pnpm build

# ============================================
# STAGE 3: Production with Nginx
# ============================================
FROM nginx:alpine AS runner

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
# NOTE: Using stage index (2) instead of name due to Coolify ARG injection issues
COPY --from=2 /app/apps/web/dist /usr/share/nginx/html

# Configure for non-root user on port 8080
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
