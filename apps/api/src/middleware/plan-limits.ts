import { Request, Response, NextFunction } from 'express'
import { PlanLimitsService } from '../services/plan-limits.service.js'

type ResourceType = 'doctor' | 'patient' | 'admin'

/**
 * Middleware factory to check plan limits before creating a resource
 */
export function checkPlanLimit(resourceType: ResourceType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      let result

      switch (resourceType) {
        case 'doctor':
          result = await PlanLimitsService.canAddDoctor(tenantId)
          break
        case 'patient':
          result = await PlanLimitsService.canAddPatient(tenantId)
          break
        case 'admin':
          result = await PlanLimitsService.canAddAdmin(tenantId)
          break
      }

      if (!result.allowed) {
        return res.status(403).json({
          error: 'Plan Limit Exceeded',
          message: `You have reached the maximum number of ${resourceType}s for your plan (${result.limit}). Please upgrade to add more.`,
          details: {
            resourceType,
            current: result.current,
            limit: result.limit,
            remaining: result.remaining,
          },
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware to check if subscription is active
 */
export async function requireActiveSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tenantId = req.user!.tenantId

    if (!tenantId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Tenant ID is required',
      })
    }

    const subscription = await PlanLimitsService.getTenantSubscription(tenantId)

    if (!subscription) {
      return res.status(403).json({
        error: 'No Subscription',
        message: 'This tenant does not have an active subscription.',
      })
    }

    if (subscription.status === 'CANCELED') {
      return res.status(403).json({
        error: 'Subscription Canceled',
        message: 'Your subscription has been canceled. Please renew to continue.',
      })
    }

    if (subscription.status === 'PAST_DUE') {
      // Allow access but could add a warning header
      res.setHeader('X-Subscription-Warning', 'past_due')
    }

    // Check if subscription period has expired
    // Note: If status was 'CANCELED', we already returned above, so no need to check again
    if (new Date() > subscription.currentPeriodEnd) {
      return res.status(403).json({
        error: 'Subscription Expired',
        message: 'Your subscription period has expired. Please renew to continue.',
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}
