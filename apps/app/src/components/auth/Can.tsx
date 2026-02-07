import type { ReactNode } from 'react';
import { Permission } from '@dental/shared';
import { usePermissions } from '../../hooks/usePermissions';

interface CanProps {
  /** Single permission or array of permissions to check */
  permission?: Permission | Permission[];
  /** If true, requires any of the permissions. If false, requires all permissions. Default: false (all) */
  requireAny?: boolean;
  /** Content to show when user has permission */
  children: ReactNode;
  /** Optional fallback content to show when user doesn't have permission */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * // Show content only if user has single permission
 * <Can permission={Permission.PATIENTS_CREATE}>
 *   <button>New Patient</button>
 * </Can>
 *
 * @example
 * // Show content if user has ANY of the permissions
 * <Can permission={[Permission.PATIENTS_CREATE, Permission.PATIENTS_UPDATE]} requireAny>
 *   <button>Manage Patients</button>
 * </Can>
 *
 * @example
 * // Show content if user has ALL permissions
 * <Can permission={[Permission.PATIENTS_VIEW, Permission.APPOINTMENTS_VIEW]}>
 *   <div>Combined Patient & Appointments View</div>
 * </Can>
 *
 * @example
 * // With fallback content
 * <Can
 *   permission={Permission.PATIENTS_CREATE}
 *   fallback={<span>You don't have permission to create patients</span>}
 * >
 *   <button>New Patient</button>
 * </Can>
 */
export function Can({ permission, requireAny = false, children, fallback = null }: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  if (!permission) {
    return <>{children}</>;
  }

  let hasPermission = false;

  if (Array.isArray(permission)) {
    hasPermission = requireAny ? canAny(permission) : canAll(permission);
  } else {
    hasPermission = can(permission);
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
