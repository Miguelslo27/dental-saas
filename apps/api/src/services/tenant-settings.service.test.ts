import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@dental/database'
import { TenantSettingsService } from './tenant-settings.service.js'

describe('TenantSettingsService', () => {
  let tenantId: string
  let planId: string

  beforeAll(async () => {
    // Create a plan
    const plan = await prisma.plan.upsert({
      where: { name: 'enterprise' },
      update: {},
      create: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 0,
        maxAdmins: 5,
        maxDoctors: 10,
        maxPatients: 60,
        features: [],
      },
    })
    planId = plan.id

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Settings Test Clinic',
        slug: `settings-test-${Date.now()}`,
        subscription: {
          create: {
            planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date('2099-12-31'),
          },
        },
      },
    })
    tenantId = tenant.id
  })

  afterAll(async () => {
    await prisma.tenantSettings.deleteMany({ where: { tenantId } })
    await prisma.subscription.deleteMany({ where: { tenantId } })
    await prisma.tenant.deleteMany({ where: { id: tenantId } })
  })

  describe('createDefaultSettings', () => {
    it('should create settings with default values', async () => {
      const settings = await TenantSettingsService.createDefaultSettings(tenantId)

      expect(settings).toBeDefined()
      expect(settings.tenantId).toBe(tenantId)
      expect(settings.language).toBe('es')
      expect(settings.dateFormat).toBe('DD/MM/YYYY')
      expect(settings.timeFormat).toBe('24h')
      expect(settings.defaultAppointmentDuration).toBe(30)
      expect(settings.appointmentBuffer).toBe(0)
      expect(settings.emailNotifications).toBe(true)
      expect(settings.smsNotifications).toBe(false)
      expect(settings.appointmentReminders).toBe(true)
      expect(settings.reminderHoursBefore).toBe(24)
      expect(settings.workingDays).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('getSettings', () => {
    it('should return settings for a tenant', async () => {
      const settings = await TenantSettingsService.getSettings(tenantId)

      expect(settings).toBeDefined()
      expect(settings?.tenantId).toBe(tenantId)
    })

    it('should return null for non-existent tenant', async () => {
      const settings = await TenantSettingsService.getSettings('non-existent-id')

      expect(settings).toBeNull()
    })
  })

  describe('updateSettings', () => {
    it('should update language setting', async () => {
      const settings = await TenantSettingsService.updateSettings(tenantId, {
        language: 'en',
      })

      expect(settings.language).toBe('en')
    })

    it('should update multiple settings at once', async () => {
      const settings = await TenantSettingsService.updateSettings(tenantId, {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        defaultAppointmentDuration: 45,
      })

      expect(settings.dateFormat).toBe('MM/DD/YYYY')
      expect(settings.timeFormat).toBe('12h')
      expect(settings.defaultAppointmentDuration).toBe(45)
    })

    it('should update notification settings', async () => {
      const settings = await TenantSettingsService.updateSettings(tenantId, {
        emailNotifications: false,
        smsNotifications: true,
        appointmentReminders: false,
      })

      expect(settings.emailNotifications).toBe(false)
      expect(settings.smsNotifications).toBe(true)
      expect(settings.appointmentReminders).toBe(false)
    })

    it('should update business hours', async () => {
      const newHours = {
        1: { start: '08:00', end: '17:00' },
        2: { start: '08:00', end: '17:00' },
      }

      const settings = await TenantSettingsService.updateSettings(tenantId, {
        businessHours: newHours,
      })

      expect(settings.businessHours).toEqual(newHours)
    })

    it('should update working days', async () => {
      const settings = await TenantSettingsService.updateSettings(tenantId, {
        workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
      })

      expect(settings.workingDays).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('getOrCreateSettings', () => {
    it('should return existing settings', async () => {
      const settings = await TenantSettingsService.getOrCreateSettings(tenantId)

      expect(settings).toBeDefined()
      expect(settings.tenantId).toBe(tenantId)
    })

    it('should create settings if not exist', async () => {
      // Create a new tenant without settings
      const newTenant = await prisma.tenant.create({
        data: {
          name: 'No Settings Clinic',
          slug: `no-settings-${Date.now()}`,
          subscription: {
            create: {
              planId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date('2099-12-31'),
            },
          },
        },
      })

      try {
        const settings = await TenantSettingsService.getOrCreateSettings(newTenant.id)

        expect(settings).toBeDefined()
        expect(settings.tenantId).toBe(newTenant.id)
        expect(settings.language).toBe('es') // Default
      } finally {
        // Cleanup
        await prisma.tenantSettings.deleteMany({ where: { tenantId: newTenant.id } })
        await prisma.subscription.deleteMany({ where: { tenantId: newTenant.id } })
        await prisma.tenant.delete({ where: { id: newTenant.id } })
      }
    })
  })
})
