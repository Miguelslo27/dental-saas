import { Router, type IRouter } from 'express'
import { prisma } from '@dental/database'

const statsRouter: IRouter = Router()

/**
 * GET /api/admin/stats
 * Get platform-wide statistics
 */
statsRouter.get('/', async (_req, res, next) => {
  try {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      activeUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      recentTenants,
      recentUsers,
      appointmentsByStatus,
    ] = await Promise.all([
      // Tenant stats
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),

      // User stats (excluding super admins)
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.user.count({ where: { isActive: true, role: { not: 'SUPER_ADMIN' } } }),

      // Entity counts
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),

      // Recent tenants (last 7 days)
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          role: { not: 'SUPER_ADMIN' },
        },
      }),

      // Appointments by status
      prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ])

    // Transform appointments by status into an object
    const appointmentStats = appointmentsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id
        return acc
      },
      {} as Record<string, number>
    )

    res.json({
      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: totalTenants - activeTenants,
        newLast7Days: recentTenants,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newLast7Days: recentUsers,
      },
      patients: {
        total: totalPatients,
      },
      doctors: {
        total: totalDoctors,
      },
      appointments: {
        total: totalAppointments,
        byStatus: appointmentStats,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/stats/tenants
 * Get detailed tenant statistics
 */
statsRouter.get('/tenants', async (_req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            patients: true,
            doctors: true,
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    res.json({ tenants })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/admin/stats/activity
 * Get recent platform activity
 */
statsRouter.get('/activity', async (_req, res, next) => {
  try {
    const [recentLogins, recentRegistrations, recentAppointments] = await Promise.all([
      // Recent logins
      prisma.user.findMany({
        where: {
          lastLoginAt: { not: null },
          role: { not: 'SUPER_ADMIN' },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          lastLoginAt: true,
          tenant: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { lastLoginAt: 'desc' },
        take: 10,
      }),

      // Recent registrations
      prisma.user.findMany({
        where: { role: { not: 'SUPER_ADMIN' } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          tenant: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Recent appointments
      prisma.appointment.findMany({
        select: {
          id: true,
          status: true,
          startTime: true,
          createdAt: true,
          tenant: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    res.json({
      recentLogins,
      recentRegistrations,
      recentAppointments,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

export { statsRouter }
