import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'

const tenantsRouter: IRouter = Router()

/**
 * GET /api/admin/tenants
 * List all tenants with stats
 */
tenantsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const search = (req.query.search as string) || ''
    const status = req.query.status as string // 'active' | 'inactive' | undefined

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              patients: true,
              doctors: true,
              appointments: true,
            },
          },
          subscription: {
            include: {
              plan: { select: { name: true, displayName: true } },
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ])

    res.json({
      tenants,
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
 * GET /api/admin/tenants/:id
 * Get tenant details with users
 */
tenantsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            patients: true,
            doctors: true,
            appointments: true,
          },
        },
      },
    })

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tenant not found', code: 'NOT_FOUND' },
      })
    }

    res.json(tenant)
  } catch (error) {
    next(error)
  }
})

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
})

/**
 * PATCH /api/admin/tenants/:id
 * Update tenant details
 */
tenantsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const parse = updateTenantSchema.safeParse(req.body)

    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors },
      })
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tenant not found', code: 'NOT_FOUND' },
      })
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: parse.data,
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/admin/tenants/:id/suspend
 * Suspend a tenant (set isActive = false)
 */
tenantsRouter.post('/:id/suspend', async (req, res, next) => {
  try {
    const { id } = req.params

    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tenant not found', code: 'NOT_FOUND' },
      })
    }

    if (!tenant.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'Tenant is already suspended', code: 'ALREADY_SUSPENDED' },
      })
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    })

    res.json({
      success: true,
      message: 'Tenant suspended successfully',
      tenant: updated,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/admin/tenants/:id/activate
 * Activate a suspended tenant
 */
tenantsRouter.post('/:id/activate', async (req, res, next) => {
  try {
    const { id } = req.params

    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tenant not found', code: 'NOT_FOUND' },
      })
    }

    if (tenant.isActive) {
      return res.status(400).json({
        success: false,
        error: { message: 'Tenant is already active', code: 'ALREADY_ACTIVE' },
      })
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    })

    res.json({
      success: true,
      message: 'Tenant activated successfully',
      tenant: updated,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/admin/tenants/:id
 * Delete a tenant (cascades to all related data)
 */
tenantsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, patients: true, appointments: true },
        },
      },
    })

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tenant not found', code: 'NOT_FOUND' },
      })
    }

    // Delete tenant (cascades to related data)
    await prisma.tenant.delete({ where: { id } })

    res.json({
      success: true,
      message: 'Tenant deleted successfully',
      deleted: {
        tenantId: id,
        tenantName: tenant.name,
        usersDeleted: tenant._count.users,
        patientsDeleted: tenant._count.patients,
        appointmentsDeleted: tenant._count.appointments,
      },
    })
  } catch (error) {
    next(error)
  }
})

export { tenantsRouter }
