import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Main schema location
  schema: 'prisma/schema.prisma',

  // Migration configuration
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },

  // Database connection for CLI operations (migrate, db push, etc.)
  datasource: {
    url: env('DATABASE_URL'),
  },
})
