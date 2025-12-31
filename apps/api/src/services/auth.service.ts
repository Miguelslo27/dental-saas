import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'
import crypto from 'crypto'
import { env } from '../config/env.js'

const SALT_ROUNDS = 12

// Types
export interface TokenPayload {
  userId: string
  tenantId: string
  email: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate access and refresh tokens
 */
export function generateTokens(payload: TokenPayload): TokenPair {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
  })

  // Refresh token has a different structure - just contains userId
  const refreshToken = jwt.sign(
    { userId: payload.userId, type: 'refresh' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue }
  )

  return { accessToken, refreshToken }
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload & { type?: string }
  
  // Make sure it's not a refresh token
  if (decoded.type === 'refresh') {
    throw new Error('Invalid token type')
  }
  
  return decoded
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; type?: string }
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type')
  }
  
  return { userId: decoded.userId }
}

/**
 * Hash a refresh token for storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Parse expiry string to Date
 */
export function getExpiryDate(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) {
    // Default to 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return new Date(Date.now() + value * multipliers[unit])
}
