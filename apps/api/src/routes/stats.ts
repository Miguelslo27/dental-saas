import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { requireMinRole } from '../middleware/auth.js'
import {
  getOverviewStats,
  getAppointmentStatsForPeriod,
  getRevenueStats,
  getPatientsGrowthStats,
  getDoctorPerformanceStats,
} from '../services/stats.service.js'

const statsRouter: IRouter = Router()

// ============================================================================
// Validation Schemas
// ============================================================================

const dateRangeSchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'Invalid startDate format' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'Invalid endDate format' })
    .optional(),
})

const monthsBackSchema = z.object({
  months: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(24))
    .optional(),
})

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/stats/overview
 * Get dashboard overview statistics
 * Access: All authenticated users with tenant
 */
statsRouter.get('/overview', async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const stats = await getOverviewStats(tenantId)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/stats/appointments
 * Get appointment statistics for a period
 * Query params: startDate, endDate (ISO format)
 * Defaults to current month if not provided
 */
statsRouter.get('/appointments', async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const parseResult = dateRangeSchema.safeParse(req.query)
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters', details: parseResult.error.errors },
      })
    }

    // Default to current month
    const now = new Date()
    const startDate = parseResult.data.startDate
      ? new Date(parseResult.data.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = parseResult.data.endDate
      ? new Date(parseResult.data.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const stats = await getAppointmentStatsForPeriod(tenantId, startDate, endDate)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/stats/revenue
 * Get revenue statistics
 * Query params: months (number of months back, default 6, max 24)
 */
statsRouter.get('/revenue', async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const parseResult = monthsBackSchema.safeParse(req.query)
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters', details: parseResult.error.errors },
      })
    }

    const monthsBack = parseResult.data.months ?? 6

    const stats = await getRevenueStats(tenantId, monthsBack)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/stats/patients-growth
 * Get patients growth statistics
 * Query params: months (number of months back, default 6, max 24)
 */
statsRouter.get('/patients-growth', async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const parseResult = monthsBackSchema.safeParse(req.query)
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters', details: parseResult.error.errors },
      })
    }

    const monthsBack = parseResult.data.months ?? 6

    const stats = await getPatientsGrowthStats(tenantId, monthsBack)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/stats/doctors-performance
 * Get doctor performance statistics for current month
 * Access: OWNER and ADMIN only
 */
statsRouter.get('/doctors-performance', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const stats = await getDoctorPerformanceStats(tenantId)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
})

export { statsRouter }
