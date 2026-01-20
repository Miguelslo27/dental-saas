import { Router, type IRouter } from 'express'
import { prisma } from '@dental/database'

const statsRouter: IRouter = Router()

/**
 * GET /api/admin/stats
 * Get platform-wide statistics
 */
statsRouter.get('/', async (_req, res, next) => {
  try {
    // Get first day of current month for thisMonth queries
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsers,
      usersByRole,
      totalPatients,
      totalAppointments,
      appointmentsThisMonth,
    ] = await Promise.all([
      // Tenant stats
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),

      // User stats (excluding super admins)
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.user.count({ where: { isActive: true, role: { not: 'SUPER_ADMIN' } } }),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        where: { role: { not: 'SUPER_ADMIN' } },
        _count: { id: true },
      }),

      // Entity counts
      prisma.patient.count(),
      prisma.appointment.count(),

      // Appointments this month
      prisma.appointment.count({
        where: {
          createdAt: { gte: firstDayOfMonth },
        },
      }),
    ])

    // Transform users by role into an object
    const byRole = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count.id
        return acc
      },
      {} as Record<string, number>
    )

    res.json({
      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: totalTenants - activeTenants,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole,
      },
      patients: {
        total: totalPatients,
      },
      appointments: {
        total: totalAppointments,
        thisMonth: appointmentsThisMonth,
      },
      revenue: {
        thisMonth: 0, // Placeholder - billing integration deferred
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/stats/top-tenants
 * Get top tenants by activity (patients + appointments)
 */
statsRouter.get('/top-tenants', async (_req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            patients: true,
            appointments: true,
          },
        },
      },
      orderBy: [
        { patients: { _count: 'desc' } },
        { appointments: { _count: 'desc' } },
      ],
      take: 10,
    })

    res.json({ tenants })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/stats/recent-activity
 * Get recent platform activity (tenants and users created)
 */
statsRouter.get('/recent-activity', async (_req, res, next) => {
  try {
    const [recentTenants, recentUsers] = await Promise.all([
      // Recent tenants created
      prisma.tenant.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Recent users created
      prisma.user.findMany({
        where: { role: { not: 'SUPER_ADMIN' } },
        select: {
          id: true,
          email: true,
          createdAt: true,
          tenant: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // Combine and sort by createdAt
    const activity = [
      ...recentTenants.map((t) => ({
        type: 'tenant_created' as const,
        id: t.id,
        name: t.name,
        createdAt: t.createdAt.toISOString(),
      })),
      ...recentUsers.map((u) => ({
        type: 'user_created' as const,
        id: u.id,
        email: u.email,
        tenantName: u.tenant?.name,
        createdAt: u.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15)

    res.json({ activity })
  } catch (error) {
    next(error)
  }
})

export { statsRouter }
