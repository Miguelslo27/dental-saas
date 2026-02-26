import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma, type UserRole } from '@dental/database'
import { hashPassword } from '../../services/auth.service.js'

const usersRouter: IRouter = Router()

/**
 * GET /api/admin/users
 * List all users across all tenants
 */
usersRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const search = (req.query.search as string) || ''
    const status = req.query.status as string // 'active' | 'inactive'
    const role = req.query.role as string
    const tenantId = req.query.tenantId as string

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...(role && { role: role as UserRole }),
      ...(tenantId && { tenantId }),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          tenantId: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/users/:id
 * Get user details
 */
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            refreshTokens: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})

// Note: SUPER_ADMIN role changes are not allowed via this endpoint
// Super admins can only be created through the dedicated setup endpoint
const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(['OWNER', 'ADMIN', 'DOCTOR', 'STAFF']).optional(),
})

/**
 * PATCH /api/admin/users/:id
 * Update user details
 */
usersRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const parse = updateUserSchema.safeParse(req.body)

    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors },
      })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      })
    }

    // Prevent modifying SUPER_ADMIN users (they can only be managed via setup)
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Super admin users cannot be modified via this endpoint', code: 'SUPER_ADMIN_PROTECTED' },
      })
    }

    // Check if email is being changed and if it's already taken
    if (parse.data.email && parse.data.email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: parse.data.email,
          tenantId: user.tenantId,
          id: { not: id },
        },
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { message: 'Email already in use', code: 'EMAIL_EXISTS' },
        })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parse.data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updated,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/admin/users/:id/suspend
 * Suspend a user
 */
usersRouter.post('/:id/suspend', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      })
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'User is already suspended', code: 'ALREADY_SUSPENDED' },
      })
    }

    // Prevent suspending super admins via this endpoint
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Cannot suspend super admin users', code: 'FORBIDDEN' },
      })
    }

    // Revoke all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: id } })

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    res.json({
      success: true,
      message: 'User suspended and all sessions revoked',
      user: updated,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/admin/users/:id/activate
 * Activate a suspended user
 */
usersRouter.post('/:id/activate', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      })
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'User is already active', code: 'ALREADY_ACTIVE' },
      })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    res.json({
      success: true,
      message: 'User activated successfully',
      user: updated,
    })
  } catch (error) {
    next(error)
  }
})

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
      message: 'Password must include uppercase, lowercase, number, and special character',
    }),
})

/**
 * POST /api/admin/users/:id/reset-password
 * Reset a user's password
 */
usersRouter.post('/:id/reset-password', async (req, res, next) => {
  try {
    const { id } = req.params
    const parse = resetPasswordSchema.safeParse(req.body)

    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors },
      })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      })
    }

    // Prevent resetting super admin password via this endpoint
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Cannot reset super admin password via admin panel', code: 'FORBIDDEN' },
      })
    }

    const passwordHash = await hashPassword(parse.data.newPassword)

    // Update password and revoke all sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { passwordHash },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
    ])

    res.json({
      success: true,
      message: 'Password reset and all sessions revoked',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      })
    }

    // Prevent deleting super admin users
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Cannot delete super admin users', code: 'FORBIDDEN' },
      })
    }

    await prisma.user.delete({ where: { id } })

    res.json({
      success: true,
      message: 'User deleted successfully',
      deleted: {
        userId: id,
        email: user.email,
      },
    })
  } catch (error) {
    next(error)
  }
})

export { usersRouter }
