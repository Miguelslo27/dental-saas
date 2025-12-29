import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Re-export Prisma types
export * from '@prisma/client'
