import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SuperAdmin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'SUPER_ADMIN'
  createdAt: string
}

export interface AdminAuthState {
  superAdmin: SuperAdmin | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AdminAuthActions {
  setAuth: (superAdmin: SuperAdmin, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  clearError: () => void
}

const initialState: AdminAuthState = {
  superAdmin: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const useAdminStore = create<AdminAuthState & AdminAuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (superAdmin, accessToken, refreshToken) =>
        set({
          superAdmin,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      logout: () =>
        set({
          ...initialState,
        }),

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: 'dental-admin-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        superAdmin: state.superAdmin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
