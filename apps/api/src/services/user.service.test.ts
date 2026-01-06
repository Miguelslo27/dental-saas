import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as userService from './user.service.js'

// Mock prisma
vi.mock('@dental/database', () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
    },
    user: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    refreshToken: {
      deleteMany: vi.fn(),
    },
  },
  UserRole: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    STAFF: 'STAFF',
  },
}))

// Mock auth service
vi.mock('./auth.service.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}))

// Mock logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { prisma } from '@dental/database'

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTenantPlanLimits', () => {
    it('should return default free plan limits when no subscription exists', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null)

      const limits = await userService.getTenantPlanLimits('tenant-1')

      expect(limits).toEqual({
        maxAdmins: 1,
        maxDoctors: 3,
        maxPatients: 15,
      })
    })

    it('should return plan limits from subscription', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        planId: 'plan-1',
        plan: {
          id: 'plan-1',
          name: 'basic',
          maxAdmins: 2,
          maxDoctors: 5,
          maxPatients: 25,
        },
      } as any)

      const limits = await userService.getTenantPlanLimits('tenant-1')

      expect(limits).toEqual({
        maxAdmins: 2,
        maxDoctors: 5,
        maxPatients: 25,
      })
    })
  })

  describe('countUsersByRole', () => {
    it('should return counts for all roles', async () => {
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: 'OWNER', _count: { id: 1 } },
        { role: 'ADMIN', _count: { id: 2 } },
        { role: 'DOCTOR', _count: { id: 3 } },
      ] as any)

      const counts = await userService.countUsersByRole('tenant-1')

      expect(counts).toEqual({
        OWNER: 1,
        ADMIN: 2,
        DOCTOR: 3,
        STAFF: 0,
      })
    })
  })

  describe('checkRoleLimitForNewUser', () => {
    it('should allow adding staff (no limit)', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: 'STAFF', _count: { id: 100 } },
      ] as any)

      const result = await userService.checkRoleLimitForNewUser('tenant-1', 'STAFF')

      expect(result.allowed).toBe(true)
    })

    it('should deny adding admin when limit reached', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null) // free plan: 1 admin
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: 'OWNER', _count: { id: 1 } },
      ] as any)

      const result = await userService.checkRoleLimitForNewUser('tenant-1', 'ADMIN')

      expect(result.allowed).toBe(false)
      expect(result.message).toContain('Admin limit reached')
    })

    it('should deny adding doctor when limit reached', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null) // free plan: 3 doctors
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: 'DOCTOR', _count: { id: 3 } },
      ] as any)

      const result = await userService.checkRoleLimitForNewUser('tenant-1', 'DOCTOR')

      expect(result.allowed).toBe(false)
      expect(result.message).toContain('Doctor limit reached')
    })

    it('should allow adding doctor when under limit', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.groupBy).mockResolvedValue([
        { role: 'DOCTOR', _count: { id: 2 } },
      ] as any)

      const result = await userService.checkRoleLimitForNewUser('tenant-1', 'DOCTOR')

      expect(result.allowed).toBe(true)
    })
  })

  describe('listUsers', () => {
    it('should list active users for tenant', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@test.com', firstName: 'User', lastName: 'One' },
        { id: 'user-2', email: 'user2@test.com', firstName: 'User', lastName: 'Two' },
      ]
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any)

      const users = await userService.listUsers('tenant-1')

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1', isActive: true },
        })
      )
      expect(users).toEqual(mockUsers)
    })

    it('should include inactive users when requested', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([])

      await userService.listUsers('tenant-1', { includeInactive: true })

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        })
      )
    })
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const mockUser = {
        id: 'new-user',
        email: 'new@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'STAFF',
      }
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

      const user = await userService.createUser('tenant-1', {
        email: 'new@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'STAFF',
      })

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            email: 'new@test.com',
            passwordHash: 'hashed_password',
            role: 'STAFF',
          }),
        })
      )
      expect(user).toEqual(mockUser)
    })
  })

  describe('updateUserRole', () => {
    it('should prevent non-owners from promoting to OWNER', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'STAFF' } as any)

      const result = await userService.updateUserRole('tenant-1', 'user-1', 'OWNER', 'ADMIN')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Only owners can promote')
    })

    it('should prevent changing role to SUPER_ADMIN', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'STAFF' } as any)

      const result = await userService.updateUserRole('tenant-1', 'user-1', 'SUPER_ADMIN', 'OWNER')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot set role to SUPER_ADMIN')
    })

    it('should allow owner to promote user to OWNER', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'ADMIN' } as any)
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.groupBy).mockResolvedValue([{ role: 'OWNER', _count: { id: 0 } }] as any)
      vi.mocked(prisma.user.update).mockResolvedValue({ id: 'user-1', role: 'OWNER' } as any)

      const result = await userService.updateUserRole('tenant-1', 'user-1', 'OWNER', 'OWNER')

      expect(result.success).toBe(true)
    })
  })

  describe('deleteUser', () => {
    it('should prevent self-deletion', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'ADMIN' } as any)

      const result = await userService.deleteUser('tenant-1', 'user-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot delete your own account')
    })

    it('should prevent deleting owners', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'OWNER' } as any)

      const result = await userService.deleteUser('tenant-1', 'user-1', 'user-2')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot delete an owner')
    })

    it('should soft delete user and invalidate tokens', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'STAFF' } as any)
      vi.mocked(prisma.user.update).mockResolvedValue({} as any)
      vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 })

      const result = await userService.deleteUser('tenant-1', 'user-1', 'admin-1')

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isActive: false },
        })
      )
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
    })
  })
})
