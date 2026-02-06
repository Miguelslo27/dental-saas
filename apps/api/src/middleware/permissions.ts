import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@dental/shared';

/**
 * Granular permissions for the application
 * Each permission represents a specific action a user can perform
 */
export enum Permission {
  // Patients
  PATIENTS_VIEW = 'patients:view',
  PATIENTS_CREATE = 'patients:create',
  PATIENTS_UPDATE = 'patients:update',
  PATIENTS_DELETE = 'patients:delete',

  // Appointments
  APPOINTMENTS_VIEW = 'appointments:view',
  APPOINTMENTS_CREATE = 'appointments:create',
  APPOINTMENTS_UPDATE = 'appointments:update',
  APPOINTMENTS_DELETE = 'appointments:delete',

  // Doctors
  DOCTORS_VIEW = 'doctors:view',
  DOCTORS_CREATE = 'doctors:create',
  DOCTORS_UPDATE = 'doctors:update',
  DOCTORS_DELETE = 'doctors:delete',

  // Users
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  USERS_PROMOTE_OWNER = 'users:promote_owner',

  // Labworks
  LABWORKS_VIEW = 'labworks:view',
  LABWORKS_CREATE = 'labworks:create',
  LABWORKS_UPDATE = 'labworks:update',
  LABWORKS_DELETE = 'labworks:delete',

  // Expenses
  EXPENSES_VIEW = 'expenses:view',
  EXPENSES_CREATE = 'expenses:create',
  EXPENSES_UPDATE = 'expenses:update',
  EXPENSES_DELETE = 'expenses:delete',

  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',

  // Tenant
  TENANT_PROFILE_UPDATE = 'tenant:profile_update',
  TENANT_DELETE = 'tenant:delete',

  // Dental Charts
  DENTAL_CHARTS_VIEW = 'dental_charts:view',
  DENTAL_CHARTS_UPDATE = 'dental_charts:update',

  // Statistics
  STATISTICS_VIEW = 'statistics:view',

  // Export
  DATA_EXPORT = 'data:export',

  // Billing
  BILLING_VIEW = 'billing:view',
  BILLING_MANAGE = 'billing:manage',
}

/**
 * Mapping of roles to their permissions
 *
 * STAFF: Read-only access to most resources
 * DOCTOR: STAFF + can edit dental charts and view statistics
 * ADMIN: Full operational control except tenant profile, billing, and owner promotion
 * OWNER: Complete access to everything
 */
// Define base permissions for each role
const STAFF_PERMISSIONS = [
  // View only
  Permission.PATIENTS_VIEW,
  Permission.APPOINTMENTS_VIEW,
  Permission.DOCTORS_VIEW,
  Permission.LABWORKS_VIEW,
  Permission.EXPENSES_VIEW,
  Permission.DENTAL_CHARTS_VIEW,
  Permission.SETTINGS_VIEW,
  Permission.USERS_VIEW,
];

const ADMIN_PERMISSIONS = [
  // Full CRUD on operational resources
  Permission.PATIENTS_VIEW,
  Permission.PATIENTS_CREATE,
  Permission.PATIENTS_UPDATE,
  Permission.PATIENTS_DELETE,

  Permission.APPOINTMENTS_VIEW,
  Permission.APPOINTMENTS_CREATE,
  Permission.APPOINTMENTS_UPDATE,
  Permission.APPOINTMENTS_DELETE,

  Permission.DOCTORS_VIEW,
  Permission.DOCTORS_CREATE,
  Permission.DOCTORS_UPDATE,
  Permission.DOCTORS_DELETE,

  Permission.LABWORKS_VIEW,
  Permission.LABWORKS_CREATE,
  Permission.LABWORKS_UPDATE,
  Permission.LABWORKS_DELETE,

  Permission.EXPENSES_VIEW,
  Permission.EXPENSES_CREATE,
  Permission.EXPENSES_UPDATE,
  Permission.EXPENSES_DELETE,

  Permission.USERS_VIEW,
  Permission.USERS_CREATE,
  Permission.USERS_UPDATE,
  Permission.USERS_DELETE,

  Permission.DENTAL_CHARTS_VIEW,
  Permission.DENTAL_CHARTS_UPDATE,

  Permission.STATISTICS_VIEW,

  Permission.SETTINGS_VIEW,
  Permission.SETTINGS_UPDATE,

  Permission.DATA_EXPORT,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [], // Super admin has no tenant-specific permissions (uses separate routes)

  STAFF: STAFF_PERMISSIONS,

  DOCTOR: [
    // All STAFF permissions
    ...STAFF_PERMISSIONS,
    // Plus editing dental charts and viewing statistics
    Permission.DENTAL_CHARTS_UPDATE,
    Permission.STATISTICS_VIEW,
  ],

  ADMIN: ADMIN_PERMISSIONS,

  OWNER: [
    // All ADMIN permissions
    ...ADMIN_PERMISSIONS,
    // Plus exclusive owner permissions
    Permission.USERS_PROMOTE_OWNER,
    Permission.TENANT_PROFILE_UPDATE,
    Permission.TENANT_DELETE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Middleware to require a specific permission
 * Returns 403 if user doesn't have the permission
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(user.role as UserRole, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
      });
    }

    next();
  };
}

/**
 * Middleware to require any of the specified permissions
 * Returns 403 if user doesn't have at least one permission
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasAnyPermission(user.role as UserRole, permissions)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: `Any of: ${permissions.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Middleware to require all of the specified permissions
 * Returns 403 if user doesn't have all permissions
 */
export function requireAllPermissions(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasAllPermissions(user.role as UserRole, permissions)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: `All of: ${permissions.join(', ')}`,
      });
    }

    next();
  };
}
