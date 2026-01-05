import { Resend } from 'resend'
import { WelcomeEmail } from '../emails/WelcomeEmail.js'
import { PasswordResetEmail } from '../emails/PasswordResetEmail.js'
import { logger } from '../utils/logger.js'

// Initialize Resend client - will be undefined if no API key
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Default from address for development (Resend sandbox)
const EMAIL_FROM = process.env.EMAIL_FROM || 'Dental SaaS <onboarding@resend.dev>'

interface SendWelcomeEmailParams {
  to: string
  firstName: string
  clinicName: string
  loginUrl: string
}

/**
 * Sanitize string for use in email subject to prevent header injection
 * Removes newlines and control characters
 */
function sanitizeForSubject(str: string): string {
  return str.replace(/[\r\n\t]/g, ' ').trim().slice(0, 100)
}

/**
 * Send a welcome email to a new user who registered a clinic
 * This is fire-and-forget: errors are logged but don't block the caller
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<boolean> {
  const { to, firstName, clinicName, loginUrl } = params

  if (!resend) {
    logger.warn('Email service not configured: RESEND_API_KEY is missing. Skipping welcome email.')
    return false
  }

  // Sanitize clinic name to prevent email header injection
  const safeClinicName = sanitizeForSubject(clinicName)

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: `Welcome to Dental SaaS - ${safeClinicName} is ready!`,
      react: WelcomeEmail({ firstName, clinicName, loginUrl }),
    })

    if (error) {
      logger.error({ error, to, clinicName }, 'Failed to send welcome email')
      return false
    }

    logger.info({ emailId: data?.id, to, clinicName }, 'Welcome email sent successfully')
    return true
  } catch (err) {
    logger.error({ err, to, clinicName }, 'Exception while sending welcome email')
    return false
  }
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return resend !== null
}

interface SendPasswordResetEmailParams {
  to: string
  firstName: string
  resetUrl: string
  expiresInMinutes?: number
}

/**
 * Send a password reset email
 * Returns true if sent successfully, false otherwise
 */
export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<boolean> {
  const { to, firstName, resetUrl, expiresInMinutes = 15 } = params

  if (!resend) {
    logger.warn('Email service not configured: RESEND_API_KEY is missing. Skipping password reset email.')
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: 'Reset your Dental SaaS password',
      react: PasswordResetEmail({ firstName, resetUrl, expiresInMinutes }),
    })

    if (error) {
      logger.error({ error, to }, 'Failed to send password reset email')
      return false
    }

    logger.info({ emailId: data?.id, to }, 'Password reset email sent successfully')
    return true
  } catch (err) {
    logger.error({ err, to }, 'Exception while sending password reset email')
    return false
  }
}
