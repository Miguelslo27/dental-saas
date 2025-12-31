import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type TokenPayload } from '../services/auth.service.js'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

/**
 * Middleware that requires a valid JWT access token.
 * Attaches the decoded user payload to req.user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Missing authorization header', code: 'UNAUTHENTICATED' },
    })
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
    })
  }
}

/**
 * Middleware that requires the user to have one of the specified roles.
 * Must be used after requireAuth.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', code: 'UNAUTHENTICATED' },
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          requiredRoles: allowedRoles,
          userRole: req.user.role,
        },
      })
    }

    next()
  }
}

/**
 * Middleware that validates tenant from JWT matches request.
 * Automatically extracts tenantId from JWT instead of header.
 * Must be used after requireAuth.
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required', code: 'UNAUTHENTICATED' },
    })
  }

  // Override any x-tenant-id header with the one from JWT
  // This ensures tenant isolation through authentication
  req.headers['x-tenant-id'] = req.user.tenantId

  next()
}

/**
 * Combined middleware: requireAuth + requireTenant
 */
export function requireAuthWithTenant(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err)
    if (res.headersSent) return // Response already sent by requireAuth
    requireTenant(req, res, next)
  })
}

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  DOCTOR: 2,
  STAFF: 1,
} as const

/**
 * Check if a user role has at least the minimum required level
 */
export function hasMinRole(userRole: string, minRole: keyof typeof ROLE_HIERARCHY): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0
  const minLevel = ROLE_HIERARCHY[minRole]
  return userLevel >= minLevel
}

/**
 * Middleware that requires minimum role level (uses hierarchy)
 */
export function requireMinRole(minRole: keyof typeof ROLE_HIERARCHY) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', code: 'UNAUTHENTICATED' },
      })
    }

    if (!hasMinRole(req.user.role, minRole)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          minimumRole: minRole,
          userRole: req.user.role,
        },
      })
    }

    next()
  }
}
