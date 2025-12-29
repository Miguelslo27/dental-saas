import express from 'express'
import cors from 'cors'
import { pino } from 'pino'
import { healthRouter } from './routes/health.js'
import { errorHandler } from './middleware/error-handler.js'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

const app = express()

// Middleware
app.use(cors())
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

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`🚀 API server running on http://localhost:${PORT}`)
})

export { app, logger }
