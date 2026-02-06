/**
 * User roles in the system
 * These must match the UserRole enum in the Prisma schema
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Platform super administrator, no tenant
  OWNER = 'OWNER',             // Tenant owner, full access
  ADMIN = 'ADMIN',             // Administrative access
  DOCTOR = 'DOCTOR',           // Can manage patients and appointments
  STAFF = 'STAFF',             // Limited access
}

// For backward compatibility, export as Role as well
export type Role = UserRole;
