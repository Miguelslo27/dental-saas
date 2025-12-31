import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAdminStore, type SuperAdmin } from '@/stores/admin.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const adminApiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Request interceptor - add access token to requests
adminApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAdminStore.getState()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 errors
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { logout } = useAdminStore.getState()
      logout()
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ============================================================================
// Setup API
// ============================================================================

export interface SetupStatus {
  setupAvailable: boolean
  message: string
}

export interface SetupPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  setupKey: string
}

export interface SetupResponse {
  success: boolean
  message: string
  user: SuperAdmin
  accessToken: string
  refreshToken: string
}

export const adminSetupApi = {
  checkStatus: async (): Promise<SetupStatus> => {
    const response = await adminApiClient.get<SetupStatus>('/setup')
    return response.data
  },

  createSuperAdmin: async (payload: SetupPayload): Promise<SetupResponse> => {
    const response = await adminApiClient.post<SetupResponse>('/setup', payload)
    return response.data
  },
}

// ============================================================================
// Stats API
// ============================================================================

export interface PlatformStats {
  tenants: {
    total: number
    active: number
    inactive: number
  }
  users: {
    total: number
    active: number
    byRole: Record<string, number>
  }
  patients: {
    total: number
  }
  appointments: {
    total: number
    thisMonth: number
  }
  revenue: {
    thisMonth: number
  }
}

export interface TopTenant {
  id: string
  name: string
  slug: string
  _count: {
    patients: number
    appointments: number
  }
}

export interface RecentActivity {
  type: 'tenant_created' | 'user_created'
  id: string
  name?: string
  email?: string
  tenantName?: string
  createdAt: string
}

export const adminStatsApi = {
  getStats: async (): Promise<PlatformStats> => {
    const response = await adminApiClient.get<PlatformStats>('/stats')
    return response.data
  },

  getTopTenants: async (): Promise<TopTenant[]> => {
    const response = await adminApiClient.get<{ tenants: TopTenant[] }>('/stats/top-tenants')
    return response.data.tenants
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await adminApiClient.get<{ activity: RecentActivity[] }>('/stats/recent-activity')
    return response.data.activity
  },
}

// ============================================================================
// Tenants API
// ============================================================================

export interface Tenant {
  id: string
  name: string
  slug: string
  email?: string
  phone?: string
  address?: string
  timezone: string
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    users: number
    patients: number
    doctors: number
    appointments: number
  }
  subscription?: {
    plan: {
      name: string
      displayName: string
    }
  }
}

export interface TenantDetail extends Tenant {
  users: Array<{
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
  }>
}

export interface TenantsListResponse {
  tenants: Tenant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UpdateTenantPayload {
  name?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  timezone?: string
  currency?: string
}

export const adminTenantsApi = {
  list: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<TenantsListResponse> => {
    const response = await adminApiClient.get<TenantsListResponse>('/tenants', { params })
    return response.data
  },

  get: async (id: string): Promise<TenantDetail> => {
    const response = await adminApiClient.get<TenantDetail>(`/tenants/${id}`)
    return response.data
  },

  update: async (id: string, payload: UpdateTenantPayload): Promise<{ success: boolean; tenant: Tenant }> => {
    const response = await adminApiClient.patch<{ success: boolean; tenant: Tenant }>(`/tenants/${id}`, payload)
    return response.data
  },

  suspend: async (id: string): Promise<{ success: boolean; message: string; tenant: Tenant }> => {
    const response = await adminApiClient.post<{ success: boolean; message: string; tenant: Tenant }>(`/tenants/${id}/suspend`)
    return response.data
  },

  activate: async (id: string): Promise<{ success: boolean; message: string; tenant: Tenant }> => {
    const response = await adminApiClient.post<{ success: boolean; message: string; tenant: Tenant }>(`/tenants/${id}/activate`)
    return response.data
  },

  delete: async (id: string): Promise<{ success: boolean; message: string; deleted: { tenantId: string; tenantName: string; usersDeleted: number; doctorsDeleted: number; patientsDeleted: number; appointmentsDeleted: number } }> => {
    const response = await adminApiClient.delete(`/tenants/${id}?confirm=true`)
    return response.data
  },
}

// ============================================================================
// Users API
// ============================================================================

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  tenantId?: string
  tenant?: {
    id: string
    name: string
    slug: string
  }
}

export interface AdminUserDetail extends AdminUser {
  phone?: string
  avatar?: string
  updatedAt: string
  _count: {
    refreshTokens: number
  }
}

export interface UsersListResponse {
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string | null
  role?: 'OWNER' | 'ADMIN' | 'DOCTOR' | 'STAFF'
}

export const adminUsersApi = {
  list: async (params?: { page?: number; limit?: number; search?: string; status?: string; role?: string; tenantId?: string }): Promise<UsersListResponse> => {
    const response = await adminApiClient.get<UsersListResponse>('/users', { params })
    return response.data
  },

  get: async (id: string): Promise<AdminUserDetail> => {
    const response = await adminApiClient.get<AdminUserDetail>(`/users/${id}`)
    return response.data
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<{ success: boolean; message: string; user: AdminUser }> => {
    const response = await adminApiClient.patch<{ success: boolean; message: string; user: AdminUser }>(`/users/${id}`, payload)
    return response.data
  },

  suspend: async (id: string): Promise<{ success: boolean; message: string; user: AdminUser }> => {
    const response = await adminApiClient.post<{ success: boolean; message: string; user: AdminUser }>(`/users/${id}/suspend`)
    return response.data
  },

  activate: async (id: string): Promise<{ success: boolean; message: string; user: AdminUser }> => {
    const response = await adminApiClient.post<{ success: boolean; message: string; user: AdminUser }>(`/users/${id}/activate`)
    return response.data
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminApiClient.post<{ success: boolean; message: string }>(`/users/${id}/reset-password`, { newPassword })
    return response.data
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminApiClient.delete(`/users/${id}`)
    return response.data
  },
}
