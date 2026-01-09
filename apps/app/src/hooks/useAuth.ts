import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore, type User } from '@/stores/auth.store'
import { authApi, type LoginPayload, type RegisterPayload } from '@/lib/api'
import { ROLE_HIERARCHY } from '@/lib/constants'

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
        let message = 'Error al iniciar sesión'
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string } } }
          message = axiosErr.response?.data?.message || message
        } else if (err instanceof Error) {
          message = err.message
        }
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
        
        // Redirect to success page with clinic info
        const clinicName = payload.clinicName || 'tu clínica'
        const clinicSlug = payload.clinicSlug || ''
        navigate(`/register/success?clinic=${encodeURIComponent(clinicName)}&slug=${encodeURIComponent(clinicSlug)}`)
        return response
      } catch (err) {
        let message = 'Error al registrarse'
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string } } }
          message = axiosErr.response?.data?.message || message
        } else if (err instanceof Error) {
          message = err.message
        }
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
      return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole]
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
