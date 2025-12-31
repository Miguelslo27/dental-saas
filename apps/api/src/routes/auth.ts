import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefreshToken,
  hashToken,
  getExpiryDate,
} from '../services/auth.service.js'
import { env } from '../config/env.js'

const authRouter: IRouter = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  tenantId: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantId: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

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

    const { email, password, firstName, lastName, tenantId } = parse.data

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant || !tenant.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid tenant', code: 'INVALID_TENANT' },
      })
    }

    // Check if email already exists for this tenant
    const existingUser = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
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
        tenantId,
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'STAFF', // Default role
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
      tenantId: user.tenantId,
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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    res.status(201).json({
      success: true,
      data: {
        user,
        ...tokens,
      },
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

    const { email, password, tenantId } = parse.data

    // Find user by email and tenant
    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
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
      tenantId: user.tenantId,
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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
        ...tokens,
      },
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

    // Verify the refresh token JWT
    let payload: { userId: string }
    try {
      payload = verifyRefreshToken(refreshToken)
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

    if (!storedToken || storedToken.userId !== payload.userId) {
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
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    })

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        expiresAt: getExpiryDate(env.JWT_REFRESH_EXPIRES_IN),
      },
    })

    res.json({
      success: true,
      data: tokens,
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
      // Even if no token provided, logout is "successful"
      return res.json({ success: true })
    }

    const { refreshToken } = parse.data

    // Delete the refresh token if it exists
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    })

    res.json({ success: true })
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
    
    // Import here to avoid circular dependency
    const { verifyAccessToken } = await import('../services/auth.service.js')
    
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

    res.json({
      success: true,
      data: user,
    })
  } catch (e) {
    next(e)
  }
})

export { authRouter }
