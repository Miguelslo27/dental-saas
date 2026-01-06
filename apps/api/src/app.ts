import express, { type Express } from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { authRouter } from './routes/auth.js'
import { tenantsRouter } from './routes/tenants.js'
import { adminRouter } from './routes/admin/index.js'
import { patientsRouter } from './routes/patients.js'
import { doctorsRouter } from './routes/doctors.js'
import { appointmentsRouter } from './routes/appointments.js'
import { usersRouter } from './routes/users.js'
import { errorHandler } from './middleware/error-handler.js'
import { requireAuthWithTenant } from './middleware/auth.js'
import { logger } from './utils/logger.js'
import { env } from './config/env.js'

export const app: Express = express()

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request')
  next()
})

// Public routes
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/tenants', tenantsRouter)

// Admin routes (super admin only)
app.use('/api/admin', adminRouter)

// Protected routes (require authentication + tenant)
app.use('/api/patients', requireAuthWithTenant, patientsRouter)
app.use('/api/doctors', requireAuthWithTenant, doctorsRouter)
app.use('/api/appointments', requireAuthWithTenant, appointmentsRouter)
app.use('/api/users', requireAuthWithTenant, usersRouter)

// 404 handler for unmapped routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND',
    },
  })
})

// Error handling
app.use(errorHandler)
