import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500
  const isProduction = process.env.NODE_ENV === 'production'
  const baseMessage = err.message || 'Internal Server Error'
  
  // Don't expose internal error details in production
  const safeMessage = isProduction && statusCode >= 500 
    ? 'Internal Server Error' 
    : baseMessage
  const errorCode = isProduction && statusCode >= 500 
    ? 'INTERNAL_ERROR' 
    : (err.code || 'INTERNAL_ERROR')

  logger.error({ err, statusCode }, 'Error occurred')

  res.status(statusCode).json({
    success: false,
    error: {
      message: safeMessage,
      code: errorCode,
    },
  })
}
