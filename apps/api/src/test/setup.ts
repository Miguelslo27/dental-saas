// Test setup file - sets environment variables before tests run
import { prisma } from '@dental/database'
import { afterAll } from 'vitest'

process.env.SETUP_KEY = 'test-setup-key-minimum-16-chars'
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-here'
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dental:localdev123@127.0.0.1:5432/dental_saas?schema=public'

// Ensure Prisma connection is closed after all tests complete
afterAll(async () => {
  await prisma.$disconnect()
})
