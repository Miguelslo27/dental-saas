import { prisma } from '@dental/database'

export const PlanService = {
  /**
   * Get all active plans ordered by price
   */
  async getAllPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })
  },

  /**
   * Get a plan by its unique name (free, basic, enterprise)
   */
  async getPlanByName(name: string) {
    return prisma.plan.findUnique({
      where: { name },
    })
  },

  /**
   * Get a plan by its ID
   */
  async getPlanById(id: string) {
    return prisma.plan.findUnique({
      where: { id },
    })
  },

  /**
   * Get the free plan (used as default for new tenants)
   */
  async getFreePlan() {
    const plan = await prisma.plan.findUnique({
      where: { name: 'free' },
    })

    if (!plan) {
      throw new Error('Free plan not found. Please run database seed.')
    }

    return plan
  },
}
