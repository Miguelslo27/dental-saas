import { UserRole } from '@dental/shared'

/**
 * Role hierarchy for RBAC
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<Exclude<UserRole, UserRole.SUPER_ADMIN>, number> = {
  [UserRole.OWNER]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.CLINIC_ADMIN]: 3,
  [UserRole.DOCTOR]: 2,
  [UserRole.STAFF]: 1,
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
