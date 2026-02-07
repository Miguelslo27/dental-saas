import { Request, Response, NextFunction } from 'express';
import {
  UserRole,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@dental/shared';

// Re-export for convenience
export { Permission, hasPermission, hasAnyPermission, hasAllPermissions };

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
