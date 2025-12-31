import type { User } from '@/stores/auth.store'

/**
 * Role hierarchy for RBAC
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<User['role'], number> = {
  OWNER: 4,
  ADMIN: 3,
  DOCTOR: 2,
  STAFF: 1,
}

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
