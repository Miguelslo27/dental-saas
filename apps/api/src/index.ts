import { app } from './app.js'
import { logger } from './utils/logger.js'
import { env } from './config/env.js'

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API server running on http://localhost:${env.PORT}`)
})

server.on('error', (error) => {
  logger.error({ err: error }, 'Failed to start API server')
  process.exit(1)
})

export { app }
