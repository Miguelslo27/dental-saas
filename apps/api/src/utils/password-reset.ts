import crypto from 'crypto'
import { env } from '../config/env.js'

/**
 * Token expiry in minutes for password reset
 */
export const TOKEN_EXPIRY_MINUTES = 15

/**
 * Generate a secure random token for password reset
 * Returns a 64-character hex string
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Get expiry date for password reset token
 */
export function getTokenExpiryDate(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)
}

/**
 * Build the password reset URL for admin users
 */
export function buildAdminResetUrl(token: string): string {
  const frontendUrl = env.CORS_ORIGIN || 'http://localhost:5173'
  const baseUrl = frontendUrl.replace(/\/$/, '')
  return `${baseUrl}/admin/reset-password?token=${token}`
}

/**
 * Build the password reset URL for tenant users
 */
export function buildTenantResetUrl(token: string, clinicSlug: string): string {
  const frontendUrl = env.CORS_ORIGIN || 'http://localhost:5173'
  const baseUrl = frontendUrl.replace(/\/$/, '')
  return `${baseUrl}/${clinicSlug}/reset-password?token=${token}`
}
