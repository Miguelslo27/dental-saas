import { Router, type IRouter } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@dental/database'
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getExpiryDate,
  cleanupOldRefreshTokens,
} from '../services/auth.service.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

const authRouter: IRouter = Router()

// Password schema with strong requirements
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  })

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // For new clinic registration
  clinicName: z.string().min(2).optional(),
  clinicSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  clinicSlug: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

// Password recovery schemas
const forgotPasswordSchema = z.object({
  email: z.string().email(),
  clinicSlug: z.string().min(1),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

// Token expiry for password reset (15 minutes)
const TOKEN_EXPIRY_MINUTES = 15

/**
 * Generate a secure random token for password reset
 */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Get expiry date for password reset token
 */
function getTokenExpiryDate(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)
}

/**
 * Build the password reset URL for tenant users
 */
function buildResetUrl(token: string, clinicSlug: string): string {
  const frontendUrl = env.CORS_ORIGIN || 'http://localhost:5173'
  const baseUrl = frontendUrl.replace(/\/$/, '')
  return `${baseUrl}/${clinicSlug}/reset-password?token=${token}`
}

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const parse = registerSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors },
      })
    }

    const { email, password, firstName, lastName, clinicName, clinicSlug } = parse.data

    // Check if tenant with this slug exists
    let tenant = await prisma.tenant.findUnique({ where: { slug: clinicSlug } })
    let isNewTenant = false

    if (!tenant) {
      // Create new tenant - user will be OWNER
      isNewTenant = true
      tenant = await prisma.tenant.create({
        data: {
          name: clinicName || `${firstName} Clinic`,
          slug: clinicSlug,
        },
      })
    } else if (!tenant.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'This clinic is not active', code: 'TENANT_INACTIVE' },
      })
    }

    // Check if email already exists for this tenant
    const existingUser = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email already registered', code: 'EMAIL_EXISTS' },
      })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        firstName,
        lastName,
        role: isNewTenant ? 'OWNER' : 'STAFF', // First user is OWNER, others are STAFF
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    })

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId || '',
      email: user.email,
      role: user.role,
    })

    // Store refresh token hash
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
      },
    })

    // Clean up old tokens for this user
    await cleanupOldRefreshTokens(user.id)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Send welcome email for new tenant owners (async, fire-and-forget)
    if (isNewTenant) {
      const loginUrl = `${env.CORS_ORIGIN}/${clinicSlug}/login`
      // Don't await - send email in background without blocking response
      sendWelcomeEmail({
        to: email,
        firstName,
        clinicName: tenant.name,
        loginUrl,
      }).catch(() => {
        // Error is already logged in the email service
      })
    }

    res.status(201).json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const parse = loginSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors },
      })
    }

    const { email, password, clinicSlug } = parse.data

    // Find tenant by slug
    const tenant = await prisma.tenant.findUnique({ where: { slug: clinicSlug } })
    if (!tenant) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      })
    }

    if (!tenant.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'This clinic is not active', code: 'CLINIC_NOT_ACTIVE' },
      })
    }

    // Find user by email and tenant
    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      })
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId || '',
      email: user.email,
      role: user.role,
    })

    // Store refresh token hash
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
      },
    })

    // Clean up old tokens for this user
    await cleanupOldRefreshTokens(user.id)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const parse = refreshSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD' },
      })
    }

    const { refreshToken } = parse.data

    // Verify the refresh token JWT is valid
    try {
      verifyRefreshToken(refreshToken)
    } catch {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired refresh token', code: 'INVALID_REFRESH_TOKEN' },
      })
    }

    // Find the stored token hash
    const tokenHash = hashToken(refreshToken)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
      })
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } })
      return res.status(401).json({
        success: false,
        error: { message: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' },
      })
    }

    const user = storedToken.user
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'User account is disabled', code: 'USER_DISABLED' },
      })
    }

    // Generate new tokens (token rotation)
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId || '',
      email: user.email,
      role: user.role,
    })

    // Delete old refresh token and create new one atomically
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({ where: { id: storedToken.id } })
      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(tokens.refreshToken),
          expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
        },
      })
    })

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/logout
authRouter.post('/logout', async (req, res, next) => {
  try {
    const parse = refreshSchema.safeParse(req.body)
    if (!parse.success) {
      // Logout without token is considered successful for idempotency.
      // This allows clients to call logout even if they've lost the token,
      // ensuring a consistent UX without revealing token existence.
      return res.status(204).send()
    }

    const { refreshToken } = parse.data

    // Delete the refresh token if it exists
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    })

    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

// GET /api/auth/me - Get current user info
authRouter.get('/me', async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Missing authorization header', code: 'UNAUTHENTICATED' },
      })
    }

    const token = authHeader.slice(7)

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        avatar: true,
        phone: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      })
    }

    res.json(user)
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/forgot-password - Request password reset for tenant user
authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const parse = forgotPasswordSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors },
      })
    }

    const { email, clinicSlug } = parse.data
    const normalizedEmail = email.toLowerCase().trim()

    // Always respond with success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    }

    // Find tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: clinicSlug },
    })

    if (!tenant || !tenant.isActive) {
      // Don't reveal that the clinic doesn't exist
      logger.info({ email: normalizedEmail, clinicSlug }, 'Password reset requested for non-existent or inactive clinic')
      return res.status(200).json(successResponse)
    }

    // Find user by email and tenant (must not be SUPER_ADMIN)
    const user = await prisma.user.findUnique({
      where: {
        tenantId_email: { tenantId: tenant.id, email: normalizedEmail },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        isActive: true,
        role: true,
      },
    })

    if (!user || !user.isActive || user.role === 'SUPER_ADMIN') {
      // Don't reveal that the user doesn't exist or is inactive
      logger.info({ email: normalizedEmail, clinicSlug }, 'Password reset requested for non-existent or ineligible user')
      return res.status(200).json(successResponse)
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as used to invalidate
      },
    })

    // Generate new token
    const plainToken = generateResetToken()
    const tokenHash = hashToken(plainToken)
    const expiresAt = getTokenExpiryDate()

    // Store hashed token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    // Send email (fire-and-forget, don't block response)
    const resetUrl = buildResetUrl(plainToken, clinicSlug)
    sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    }).catch((err) => {
      logger.error({ err, userId: user.id }, 'Failed to send password reset email')
    })

    logger.info({ userId: user.id, clinicSlug }, 'Password reset token generated for tenant user')
    return res.status(200).json(successResponse)
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/reset-password - Reset password with token
authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const parse = resetPasswordSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request',
          code: 'INVALID_PAYLOAD',
          details: parse.error.errors,
        },
      })
    }

    const { token, password } = parse.data

    // Hash the provided token to compare with stored hash
    const tokenHash = hashToken(token)

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            role: true,
            tenantId: true,
          },
        },
      },
    })

    // Validate token
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired reset link', code: 'INVALID_TOKEN' },
      })
    }

    if (resetToken.usedAt) {
      return res.status(400).json({
        success: false,
        error: { message: 'This reset link has already been used', code: 'TOKEN_USED' },
      })
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: { message: 'This reset link has expired', code: 'TOKEN_EXPIRED' },
      })
    }

    if (!resetToken.user.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'Account is deactivated', code: 'ACCOUNT_INACTIVE' },
      })
    }

    // This endpoint is for tenant users only (must have tenantId)
    if (!resetToken.user.tenantId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid reset link', code: 'INVALID_TOKEN' },
      })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all refresh tokens for security
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ])

    logger.info({ userId: resetToken.userId }, 'Password reset successful for tenant user')

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    })
  } catch (err) {
    next(err)
  }
})

export { authRouter }
