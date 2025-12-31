import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'
import { hashPassword, generateTokens, hashToken, getExpiryDate } from '../../services/auth.service.js'
import { env } from '../../config/env.js'

const setupRouter: IRouter = Router()

// Password schema with strong requirements
const passwordSchema = z
  .string()
  .min(12, { message: 'Super admin password must be at least 12 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  })

const setupSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Secret key to prevent unauthorized setup attempts
  setupKey: z.string().min(1),
})

/**
 * GET /api/admin/setup
 * Check if super admin setup is available (no super admin exists yet)
 */
setupRouter.get('/', async (_req, res, next) => {
  try {
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true },
    })

    res.json({
      setupAvailable: !existingSuperAdmin,
      message: existingSuperAdmin
        ? 'Super admin already exists. Setup is disabled.'
        : 'No super admin found. Setup is available.',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/admin/setup
 * Create the first (and only via this endpoint) super admin user.
 * This endpoint self-disables after the first successful creation.
 * 
 * Requires a SETUP_KEY environment variable to be set for security.
 */
setupRouter.post('/', async (req, res, next) => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true },
    })

    if (existingSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Super admin already exists. This setup endpoint is disabled.',
          code: 'SETUP_DISABLED',
        },
      })
    }

    // Validate request body
    const parse = setupSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid payload',
          code: 'INVALID_PAYLOAD',
          details: parse.error.errors,
        },
      })
    }

    const { email, password, firstName, lastName, setupKey } = parse.data

    // Verify setup key
    const expectedSetupKey = env.SETUP_KEY
    if (!expectedSetupKey) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'SETUP_KEY environment variable not configured',
          code: 'SETUP_KEY_MISSING',
        },
      })
    }

    if (setupKey !== expectedSetupKey) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Invalid setup key',
          code: 'INVALID_SETUP_KEY',
        },
      })
    }

    // Check if email already exists (even for non-super-admin users)
    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId: null },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Email already registered',
          code: 'EMAIL_EXISTS',
        },
      })
    }

    // Create super admin user
    const passwordHash = await hashPassword(password)
    const superAdmin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        tenantId: null, // Super admin has no tenant
        emailVerified: true, // Auto-verify super admin
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate tokens
    const tokens = generateTokens({
      userId: superAdmin.id,
      tenantId: '', // Empty for super admin
      email: superAdmin.email,
      role: superAdmin.role,
    })

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: superAdmin.id,
        tokenHash: hashToken(tokens.refreshToken),
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
      },
    })

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully. This setup endpoint is now disabled.',
      user: superAdmin,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    next(error)
  }
})

export { setupRouter }
