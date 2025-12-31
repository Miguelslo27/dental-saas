import express, { type Express } from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { patientsRouter } from './routes/patients.js'
import { doctorsRouter } from './routes/doctors.js'
import { appointmentsRouter } from './routes/appointments.js'
import { errorHandler } from './middleware/error-handler.js'
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

// Routes
app.use('/api/health', healthRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/doctors', doctorsRouter)
app.use('/api/appointments', appointmentsRouter)

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
