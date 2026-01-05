import { Resend } from 'resend'
import { WelcomeEmail } from '../emails/WelcomeEmail.js'
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
 * Send a welcome email to a new user who registered a clinic
 * This is fire-and-forget: errors are logged but don't block the caller
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<boolean> {
  const { to, firstName, clinicName, loginUrl } = params

  if (!resend) {
    logger.warn('Email service not configured: RESEND_API_KEY is missing. Skipping welcome email.')
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: `Welcome to Dental SaaS - ${clinicName} is ready!`,
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
