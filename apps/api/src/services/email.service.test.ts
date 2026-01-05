import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Store original env values
const originalEnv = { ...process.env }

describe('email.service', () => {
  beforeEach(() => {
    vi.resetModules()
    // Reset env to known state
    process.env.RESEND_API_KEY = ''
    process.env.EMAIL_FROM = 'Test <test@test.com>'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  describe('isEmailServiceConfigured', () => {
    it('should return false when RESEND_API_KEY is not set', async () => {
      process.env.RESEND_API_KEY = ''
      const { isEmailServiceConfigured } = await import('./email.service.js')
      expect(isEmailServiceConfigured()).toBe(false)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should return false when email service is not configured', async () => {
      process.env.RESEND_API_KEY = ''
      const { sendWelcomeEmail } = await import('./email.service.js')

      const result = await sendWelcomeEmail({
        to: 'test@example.com',
        firstName: 'John',
        clinicName: 'Test Clinic',
        loginUrl: 'https://example.com/login',
      })

      expect(result).toBe(false)
    })

    it('should handle missing API key gracefully', async () => {
      process.env.RESEND_API_KEY = ''
      const { sendWelcomeEmail } = await import('./email.service.js')

      // Should not throw
      await expect(
        sendWelcomeEmail({
          to: 'test@example.com',
          firstName: 'John',
          clinicName: 'Test Clinic',
          loginUrl: 'https://example.com/login',
        })
      ).resolves.toBe(false)
    })
  })

  describe('sanitizeForSubject (via sendWelcomeEmail)', () => {
    it('should handle clinic names with newlines without throwing', async () => {
      process.env.RESEND_API_KEY = ''
      const { sendWelcomeEmail } = await import('./email.service.js')

      // Should not throw even with malicious input
      const result = await sendWelcomeEmail({
        to: 'test@example.com',
        firstName: 'John',
        clinicName: 'Test\r\nBcc: attacker@evil.com',
        loginUrl: 'https://example.com/login',
      })

      // Returns false because API key is not set, but should not throw
      expect(result).toBe(false)
    })
  })
})
