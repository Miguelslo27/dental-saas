import { prisma } from '@dental/database'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  remaining: number
}

export interface TenantUsage {
  doctors: number
  patients: number
  admins: number
}

export interface StorageLimitCheckResult {
  allowed: boolean
  currentBytes: number
  limitBytes: number
  remainingBytes: number
}

export interface PlanLimitStatus {
  plan: {
    id: string
    name: string
    displayName: string
  }
  subscription: {
    status: string
    currentPeriodEnd: Date
  }
  doctors: LimitCheckResult
  patients: LimitCheckResult
  admins: LimitCheckResult
  storage: StorageLimitCheckResult
}

export const PlanLimitsService = {
  /**
   * Get tenant's active subscription with plan details
   */
  async getTenantSubscription(tenantId: string) {
    return prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    })
  },

  /**
   * Get current usage counts for a tenant
   */
  async getTenantUsage(tenantId: string): Promise<TenantUsage> {
    const [doctors, patients, admins] = await Promise.all([
      prisma.doctor.count({
        where: { tenantId, isActive: true },
      }),
      prisma.patient.count({
        where: { tenantId, isActive: true },
      }),
      prisma.user.count({
        where: {
          tenantId,
          isActive: true,
          role: { in: ['ADMIN', 'OWNER'] },
        },
      }),
    ])

    return { doctors, patients, admins }
  },

  /**
   * Check if tenant can add a new doctor
   */
  async canAddDoctor(tenantId: string): Promise<LimitCheckResult> {
    const subscription = await this.getTenantSubscription(tenantId)

    if (!subscription) {
      return { allowed: false, current: 0, limit: 0, remaining: 0 }
    }

    const current = await prisma.doctor.count({
      where: { tenantId, isActive: true },
    })

    const limit = subscription.plan.maxDoctors
    const remaining = Math.max(0, limit - current)

    return {
      allowed: current < limit,
      current,
      limit,
      remaining,
    }
  },

  /**
   * Check if tenant can add a new patient
   */
  async canAddPatient(tenantId: string): Promise<LimitCheckResult> {
    const subscription = await this.getTenantSubscription(tenantId)

    if (!subscription) {
      return { allowed: false, current: 0, limit: 0, remaining: 0 }
    }

    const current = await prisma.patient.count({
      where: { tenantId, isActive: true },
    })

    const limit = subscription.plan.maxPatients
    const remaining = Math.max(0, limit - current)

    return {
      allowed: current < limit,
      current,
      limit,
      remaining,
    }
  },

  /**
   * Check if tenant can add a new admin
   */
  async canAddAdmin(tenantId: string): Promise<LimitCheckResult> {
    const subscription = await this.getTenantSubscription(tenantId)

    if (!subscription) {
      return { allowed: false, current: 0, limit: 0, remaining: 0 }
    }

    const current = await prisma.user.count({
      where: {
        tenantId,
        isActive: true,
        role: { in: ['ADMIN', 'OWNER'] },
      },
    })

    const limit = subscription.plan.maxAdmins
    const remaining = Math.max(0, limit - current)

    return {
      allowed: current < limit,
      current,
      limit,
      remaining,
    }
  },

  /**
   * Check if tenant can upload files of the given size
   */
  async canUploadStorage(tenantId: string, fileSizeBytes: number): Promise<StorageLimitCheckResult> {
    const subscription = await this.getTenantSubscription(tenantId)

    if (!subscription) {
      return { allowed: false, currentBytes: 0, limitBytes: 0, remainingBytes: 0 }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { storageUsedBytes: true },
    })

    const currentBytes = Number(tenant?.storageUsedBytes ?? 0)
    const limitBytes = subscription.plan.maxStorageMb * 1024 * 1024
    const remainingBytes = Math.max(0, limitBytes - currentBytes)

    return {
      allowed: currentBytes + fileSizeBytes <= limitBytes,
      currentBytes,
      limitBytes,
      remainingBytes,
    }
  },

  /**
   * Get complete plan limit status for a tenant
   */
  async getPlanLimitStatus(tenantId: string): Promise<PlanLimitStatus | null> {
    const subscription = await this.getTenantSubscription(tenantId)

    if (!subscription) {
      return null
    }

    const [usage, storageCheck] = await Promise.all([
      this.getTenantUsage(tenantId),
      this.canUploadStorage(tenantId, 0),
    ])
    const { plan } = subscription

    return {
      plan: {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
      },
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      doctors: {
        allowed: usage.doctors < plan.maxDoctors,
        current: usage.doctors,
        limit: plan.maxDoctors,
        remaining: Math.max(0, plan.maxDoctors - usage.doctors),
      },
      patients: {
        allowed: usage.patients < plan.maxPatients,
        current: usage.patients,
        limit: plan.maxPatients,
        remaining: Math.max(0, plan.maxPatients - usage.patients),
      },
      admins: {
        allowed: usage.admins < plan.maxAdmins,
        current: usage.admins,
        limit: plan.maxAdmins,
        remaining: Math.max(0, plan.maxAdmins - usage.admins),
      },
      storage: storageCheck,
    }
  },
}
