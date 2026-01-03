# apps/api/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ============================================
# STAGE 1: Install dependencies
# ============================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ============================================
# STAGE 2: Build
# ============================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm db:generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# ============================================
# STAGE 3: Production
# ============================================
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/database/generated ./packages/database/generated
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
# NOTA: En monorepos pnpm, --prod puede fallar al resolver dependencias internas.
# Si hay errores de módulos faltantes, usar: pnpm install --frozen-lockfile (sin --prod)
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api
USER api

WORKDIR /app/apps/api
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "cd /app/packages/database && npx prisma migrate deploy && cd /app/apps/api && node dist/index.js"]
