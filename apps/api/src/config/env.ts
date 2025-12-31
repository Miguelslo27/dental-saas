import { z } from 'zod'

// Note: dotenv is loaded in index.ts before this module is imported

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32).default('development-secret-change-in-production-min-32-chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
}).refine(
  (data) => {
    // Don't allow wildcard CORS in production
    if (data.NODE_ENV === 'production' && data.CORS_ORIGIN === '*') {
      return false
    }
    return true
  },
  {
    message: 'CORS_ORIGIN cannot be "*" in production. Please configure a specific origin.',
    path: ['CORS_ORIGIN'],
  }
)

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

// Warn about default JWT_SECRET in non-test environments
if (
  parsed.data.NODE_ENV !== 'test' &&
  parsed.data.JWT_SECRET === 'development-secret-change-in-production-min-32-chars'
) {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Set a secure JWT_SECRET in production!')
}

export const env = parsed.data
