# apps/api/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ============================================
# STAGE 1: Install dependencies
# ============================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ ./patches/
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ============================================
# STAGE 2: Build
# ============================================
FROM base AS builder
# NOTE: Using stage index (1) instead of name due to Coolify ARG injection issues
COPY --from=1 /app/node_modules ./node_modules
COPY --from=1 /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=1 /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=1 /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Generate Prisma client
# DATABASE_URL is required by Prisma but not actually used during generation
WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm db:generate

# Build database package
RUN pnpm build

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
# NOTE: Using stage index (2) instead of name due to Coolify ARG injection issues
COPY --from=2 /app/apps/api/dist ./apps/api/dist
COPY --from=2 /app/apps/api/package.json ./apps/api/
COPY --from=2 /app/packages/database/dist ./packages/database/dist
COPY --from=2 /app/packages/database/generated ./packages/database/generated
COPY --from=2 /app/packages/database/package.json ./packages/database/
COPY --from=2 /app/packages/database/prisma ./packages/database/prisma
COPY --from=2 /app/packages/database/prisma.config.ts ./packages/database/
COPY --from=2 /app/packages/shared/dist ./packages/shared/dist
COPY --from=2 /app/packages/shared/package.json ./packages/shared/
COPY --from=2 /app/package.json ./
COPY --from=2 /app/pnpm-workspace.yaml ./
COPY --from=2 /app/pnpm-lock.yaml ./
COPY --from=2 /app/patches ./patches

# Install production dependencies only
# NOTE: In pnpm monorepos, --prod can fail to resolve internal dependencies.
# If you see missing module errors, use: pnpm install --frozen-lockfile (without --prod)
RUN pnpm install --prod --frozen-lockfile

# Copy startup script and make it executable
COPY --from=2 /app/apps/api/scripts/wait-for-db.sh /app/scripts/wait-for-db.sh
RUN chmod +x /app/scripts/wait-for-db.sh

# Create non-root user and uploads directory
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api && \
    mkdir -p /app/apps/api/uploads && chown api:nodejs /app/apps/api/uploads
USER api

WORKDIR /app/apps/api
EXPOSE 3000

# Start: wait for DB, run migrations, then start the API
CMD ["/app/scripts/wait-for-db.sh"]
