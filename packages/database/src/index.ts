import { Pool } from 'pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let _prisma: PrismaClient | undefined

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required. Make sure dotenv is loaded before importing @dental/database')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

// Lazy initialization - prisma client is created on first access
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      _prisma = globalThis.prisma || createPrismaClient()
      if (process.env.NODE_ENV !== 'production') {
        globalThis.prisma = _prisma
      }
    }
    return (_prisma as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Re-export Prisma types
export * from '../generated/prisma/client.js'
