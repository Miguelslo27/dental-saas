import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '@dental/database'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { PlanService } from '../services/plan.service.js'
import { PlanLimitsService } from '../services/plan-limits.service.js'

const router: Router = Router()

/**
 * GET /api/plans
 * Get all available plans (public endpoint)
 */
router.get('/plans', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await PlanService.getAllPlans()

    res.json({
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        price: Number(plan.price),
        limits: {
          maxAdmins: plan.maxAdmins,
          maxDoctors: plan.maxDoctors,
          maxPatients: plan.maxPatients,
        },
        features: plan.features,
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/billing/subscription
 * Get current tenant subscription details
 */
router.get(
  '/billing/subscription',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const status = await PlanLimitsService.getPlanLimitStatus(tenantId)

      if (!status) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No subscription found for this tenant',
        })
      }

      res.json(status)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/billing/usage
 * Get current usage for the tenant
 */
router.get(
  '/billing/usage',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const usage = await PlanLimitsService.getTenantUsage(tenantId)
      const subscription = await PlanLimitsService.getTenantSubscription(tenantId)

      if (!subscription) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No subscription found',
        })
      }

      res.json({
        usage,
        limits: {
          maxAdmins: subscription.plan.maxAdmins,
          maxDoctors: subscription.plan.maxDoctors,
          maxPatients: subscription.plan.maxPatients,
        },
        percentages: {
          admins: Math.round((usage.admins / subscription.plan.maxAdmins) * 100),
          doctors: Math.round((usage.doctors / subscription.plan.maxDoctors) * 100),
          patients: Math.round((usage.patients / subscription.plan.maxPatients) * 100),
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/billing/payments
 * Get payment history for the tenant
 */
router.get(
  '/billing/payments',
  requireAuth,
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      })

      if (!subscription) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No subscription found',
        })
      }

      res.json({
        payments: subscription.payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          paymentMethod: p.paymentMethod,
          description: p.description,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
        })),
      })
    } catch (error) {
      next(error)
    }
  }
)

const upgradePlanSchema = z.object({
  planName: z.enum(['basic', 'enterprise']),
})

/**
 * POST /api/billing/upgrade
 * Initiate plan upgrade (placeholder for dLocal integration)
 */
router.post(
  '/billing/upgrade',
  requireAuth,
  requireRole('OWNER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const validation = upgradePlanSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation Error',
          message: validation.error.errors[0].message,
        })
      }

      const { planName } = validation.data

      const newPlan = await PlanService.getPlanByName(planName)
      if (!newPlan) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Plan "${planName}" not found`,
        })
      }

      const currentSubscription = await PlanLimitsService.getTenantSubscription(tenantId)
      if (!currentSubscription) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No current subscription found',
        })
      }

      // For now, return a placeholder response
      // In production, this would create a dLocal payment link
      res.json({
        message: 'Upgrade initiated',
        currentPlan: currentSubscription.plan.name,
        newPlan: planName,
        price: Number(newPlan.price),
        // In production, this would be a dLocal checkout URL
        paymentUrl: null,
        note: 'dLocal integration pending - upgrade will be enabled once payment provider is configured',
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/billing/cancel
 * Cancel subscription at period end
 */
router.post(
  '/billing/cancel',
  requireAuth,
  requireRole('OWNER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const subscription = await prisma.subscription.update({
        where: { tenantId },
        data: { cancelAtPeriodEnd: true },
        include: { plan: true },
      })

      res.json({
        message: 'Subscription will be canceled at the end of the current period',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: subscription.plan.displayName,
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/billing/reactivate
 * Reactivate a subscription that was set to cancel
 */
router.post(
  '/billing/reactivate',
  requireAuth,
  requireRole('OWNER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const subscription = await prisma.subscription.update({
        where: { tenantId },
        data: { cancelAtPeriodEnd: false },
        include: { plan: true },
      })

      res.json({
        message: 'Subscription reactivated',
        cancelAtPeriodEnd: false,
        plan: subscription.plan.displayName,
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
