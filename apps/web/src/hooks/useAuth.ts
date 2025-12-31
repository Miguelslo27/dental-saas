import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore, type User } from '@/stores/auth.store'
import { authApi, type LoginPayload, type RegisterPayload } from '@/lib/api'

export function useAuth() {
  const navigate = useNavigate()
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    setLoading,
    setError,
    logout: storeLogout,
    clearError,
  } = useAuthStore()

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true)
      clearError()

      try {
        const response = await authApi.login(payload)
        const authUser: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role,
          tenantId: response.user.tenantId,
        }
        setAuth(authUser, response.accessToken, response.refreshToken)
        navigate('/')
        return response
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al iniciar sesión'
        setError(message)
        throw err
      }
    },
    [setLoading, clearError, setAuth, setError, navigate]
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true)
      clearError()

      try {
        const response = await authApi.register(payload)
        const authUser: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role,
          tenantId: response.user.tenantId,
        }
        setAuth(authUser, response.accessToken, response.refreshToken)
        navigate('/')
        return response
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al registrarse'
        setError(message)
        throw err
      }
    },
    [setLoading, clearError, setAuth, setError, navigate]
  )

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Ignore logout errors, still clear local state
    } finally {
      storeLogout()
      navigate('/login')
    }
  }, [refreshToken, storeLogout, navigate])

  const hasRole = useCallback(
    (roles: User['role'] | User['role'][]) => {
      if (!user) return false
      const rolesArray = Array.isArray(roles) ? roles : [roles]
      return rolesArray.includes(user.role)
    },
    [user]
  )

  const hasMinRole = useCallback(
    (minRole: User['role']) => {
      if (!user) return false
      const hierarchy: Record<User['role'], number> = {
        OWNER: 4,
        ADMIN: 3,
        DOCTOR: 2,
        STAFF: 1,
      }
      return hierarchy[user.role] >= hierarchy[minRole]
    },
    [user]
  )

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    hasMinRole,
    clearError,
  }
}
