import { Router, type IRouter } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@dental/database'
import { hashPassword, hashToken } from '../../services/auth.service.js'
import { sendPasswordResetEmail } from '../../services/email.service.js'
import { logger } from '../../utils/logger.js'

const authRouter: IRouter = Router()

// Token expiry in minutes
const TOKEN_EXPIRY_MINUTES = 15

// Password validation schema (same as registration)
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  })

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

/**
 * Generate a secure random token
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
 * Build the password reset URL
 */
function buildResetUrl(token: string): string {
  // Use CORS_ORIGIN as the frontend URL, or default for development
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'
  // Clean up the URL (remove trailing slash if present)
  const baseUrl = frontendUrl.replace(/\/$/, '')
  return `${baseUrl}/admin/reset-password?token=${token}`
}

// POST /api/admin/auth/forgot-password
authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const parse = forgotPasswordSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid email address', code: 'INVALID_PAYLOAD' },
      })
    }

    const { email } = parse.data
    const normalizedEmail = email.toLowerCase().trim()

    // Always respond with success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    }

    // Find SUPER_ADMIN user with this email (tenantId is null for super admins)
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        tenantId: null, // Super admins have no tenant
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist
      logger.info({ email: normalizedEmail }, 'Password reset requested for non-existent super admin')
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
    const resetUrl = buildResetUrl(plainToken)
    sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    }).catch((err) => {
      logger.error({ err, userId: user.id }, 'Failed to send password reset email')
    })

    logger.info({ userId: user.id }, 'Password reset token generated for super admin')
    return res.status(200).json(successResponse)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/auth/reset-password
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

    if (resetToken.user.role !== 'SUPER_ADMIN') {
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

    logger.info({ userId: resetToken.userId }, 'Password reset successful for super admin')

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    })
  } catch (err) {
    next(err)
  }
})

export { authRouter }
