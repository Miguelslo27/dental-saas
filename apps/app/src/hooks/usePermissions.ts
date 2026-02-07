import { useMemo } from 'react';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@dental/shared';
import { useAuthStore } from '../stores/auth.store';

/**
 * Hook to check user permissions based on their role
 *
 * @returns Object with permission checking methods
 *
 * @example
 * const { can, canAny, canAll } = usePermissions();
 *
 * // Check single permission
 * if (can(Permission.PATIENTS_CREATE)) {
 *   // Show create patient button
 * }
 *
 * // Check if user has any of the permissions
 * if (canAny([Permission.PATIENTS_CREATE, Permission.PATIENTS_UPDATE])) {
 *   // Show patient management section
 * }
 *
 * // Check if user has all permissions
 * if (canAll([Permission.PATIENTS_VIEW, Permission.APPOINTMENTS_VIEW])) {
 *   // Show combined view
 * }
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    if (!user) {
      return {
        can: () => false,
        canAny: () => false,
        canAll: () => false,
      };
    }

    return {
      /**
       * Check if user has a specific permission
       */
      can: (permission: Permission): boolean => {
        return hasPermission(user.role, permission);
      },

      /**
       * Check if user has any of the specified permissions
       */
      canAny: (permissions: Permission[]): boolean => {
        return hasAnyPermission(user.role, permissions);
      },

      /**
       * Check if user has all of the specified permissions
       */
      canAll: (permissions: Permission[]): boolean => {
        return hasAllPermissions(user.role, permissions);
      },
    };
  }, [user]);
}
