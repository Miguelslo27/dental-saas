import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdminStore, type SuperAdmin } from './admin.store'

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

const mockSuperAdmin: SuperAdmin = {
  id: 'admin-123',
  email: 'superadmin@example.com',
  firstName: 'Super',
  lastName: 'Admin',
  role: 'SUPER_ADMIN',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockAccessToken = 'mock-admin-access-token-xyz'
const mockRefreshToken = 'mock-admin-refresh-token-abc'

describe('admin.store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAdminStore.setState({
      superAdmin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    mockSessionStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null superAdmin initially', () => {
      const state = useAdminStore.getState()
      expect(state.superAdmin).toBeNull()
    })

    it('should have null tokens initially', () => {
      const state = useAdminStore.getState()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
    })

    it('should not be authenticated initially', () => {
      const state = useAdminStore.getState()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should not be loading initially', () => {
      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const state = useAdminStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('setAuth', () => {
    it('should set superAdmin, tokens and mark as authenticated', () => {
      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      const state = useAdminStore.getState()
      expect(state.superAdmin).toEqual(mockSuperAdmin)
      expect(state.accessToken).toBe(mockAccessToken)
      expect(state.refreshToken).toBe(mockRefreshToken)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should clear loading state', () => {
      useAdminStore.setState({ isLoading: true })

      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should clear any existing error', () => {
      useAdminStore.setState({ error: 'Previous error' })

      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      const state = useAdminStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('setTokens', () => {
    it('should update only the tokens', () => {
      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      const newAccessToken = 'new-access-token'
      const newRefreshToken = 'new-refresh-token'
      useAdminStore.getState().setTokens(newAccessToken, newRefreshToken)

      const state = useAdminStore.getState()
      expect(state.accessToken).toBe(newAccessToken)
      expect(state.refreshToken).toBe(newRefreshToken)
      expect(state.superAdmin).toEqual(mockSuperAdmin) // SuperAdmin should remain unchanged
      expect(state.isAuthenticated).toBe(true) // Auth state should remain unchanged
    })

    it('should not affect other state properties', () => {
      useAdminStore.setState({ isLoading: true, error: 'Some error' })

      useAdminStore.getState().setTokens('new-token', 'new-refresh')

      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(true)
      expect(state.error).toBe('Some error')
    })
  })

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useAdminStore.getState().setLoading(true)

      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(true)
    })

    it('should set loading to false', () => {
      useAdminStore.setState({ isLoading: true })

      useAdminStore.getState().setLoading(false)

      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should not affect other state properties', () => {
      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      useAdminStore.getState().setLoading(true)

      const state = useAdminStore.getState()
      expect(state.superAdmin).toEqual(mockSuperAdmin)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('setError', () => {
    it('should set the error message', () => {
      const errorMessage = 'Authentication failed'
      useAdminStore.getState().setError(errorMessage)

      const state = useAdminStore.getState()
      expect(state.error).toBe(errorMessage)
    })

    it('should clear loading state when setting error', () => {
      useAdminStore.setState({ isLoading: true })

      useAdminStore.getState().setError('Some error')

      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should allow setting error to null', () => {
      useAdminStore.setState({ error: 'Previous error' })

      useAdminStore.getState().setError(null)

      const state = useAdminStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('logout', () => {
    it('should reset all state to initial values', () => {
      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      useAdminStore.getState().logout()

      const state = useAdminStore.getState()
      expect(state.superAdmin).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should clear error state on logout', () => {
      useAdminStore.setState({ error: 'Some error' })

      useAdminStore.getState().logout()

      const state = useAdminStore.getState()
      expect(state.error).toBeNull()
    })

    it('should clear loading state on logout', () => {
      useAdminStore.setState({ isLoading: true })

      useAdminStore.getState().logout()

      const state = useAdminStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear the error', () => {
      useAdminStore.setState({ error: 'Some error' })

      useAdminStore.getState().clearError()

      const state = useAdminStore.getState()
      expect(state.error).toBeNull()
    })

    it('should not affect other state properties', () => {
      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)
      useAdminStore.setState({ error: 'Some error' })

      useAdminStore.getState().clearError()

      const state = useAdminStore.getState()
      expect(state.superAdmin).toEqual(mockSuperAdmin)
      expect(state.isAuthenticated).toBe(true)
      expect(state.accessToken).toBe(mockAccessToken)
    })
  })

  describe('SuperAdmin type', () => {
    it('should always have SUPER_ADMIN role', () => {
      useAdminStore.getState().setAuth(mockSuperAdmin, mockAccessToken, mockRefreshToken)

      const state = useAdminStore.getState()
      expect(state.superAdmin?.role).toBe('SUPER_ADMIN')
    })
  })

  describe('state persistence', () => {
    it('should be configured with sessionStorage persistence', () => {
      const store = useAdminStore
      expect(store.persist).toBeDefined()
      expect(store.persist.getOptions().name).toBe('dental-admin-auth')
    })

    it('should have partialize configured to exclude transient state', () => {
      const store = useAdminStore
      const partialize = store.persist.getOptions().partialize

      if (partialize) {
        const fullState = {
          superAdmin: mockSuperAdmin,
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          isAuthenticated: true,
          isLoading: true,
          error: 'test error',
          setAuth: vi.fn(),
          setTokens: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          logout: vi.fn(),
          clearError: vi.fn(),
        }

        const partializedState = partialize(fullState)

        // According to partialize config, only these should be persisted
        expect(partializedState).toHaveProperty('superAdmin')
        expect(partializedState).toHaveProperty('accessToken')
        expect(partializedState).toHaveProperty('refreshToken')
        expect(partializedState).toHaveProperty('isAuthenticated')
        // isLoading and error should NOT be persisted
        expect(partializedState).not.toHaveProperty('isLoading')
        expect(partializedState).not.toHaveProperty('error')
      }
    })
  })
})
