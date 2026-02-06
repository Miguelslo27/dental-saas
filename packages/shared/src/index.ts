// Shared types for Alveo System

// Re-export permissions
export * from './permissions.js'
export * from './types.js'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Plan types
export type PlanSlug = 'free' | 'basic' | 'enterprise'

export interface PlanLimits {
  maxAdmins: number
  maxDoctors: number
  maxPatients: number
  maxStorageMb: number
}

export interface PlanFeatures {
  backups: 'manual' | 'daily' | 'daily_exportable'
  reports: 'basic' | 'complete' | 'custom'
  support: 'community' | 'email' | 'priority'
  apiAccess: boolean
}

// Common entity fields
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface TenantEntity extends BaseEntity {
  tenantId: string
}

export interface ArchivableEntity extends TenantEntity {
  archived: boolean
}
