import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/stores/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: User['role'][]
  minRole?: User['role']
}

const ROLE_HIERARCHY: Record<User['role'], number> = {
  OWNER: 4,
  ADMIN: 3,
  DOCTOR: 2,
  STAFF: 1,
}

export function ProtectedRoute({
  children,
  requiredRoles,
  minRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check required roles
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check minimum role
  if (minRole && ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
