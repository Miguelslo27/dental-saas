import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { errorHandler } from './middleware/error-handler.js'
import { logger } from './utils/logger.js'
import { env } from './config/env.js'

const app = express()

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

// Error handling
app.use(errorHandler)

app.listen(env.PORT, () => {
  logger.info(`🚀 API server running on http://localhost:${env.PORT}`)
})

export { app }
