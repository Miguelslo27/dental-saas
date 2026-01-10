import { apiClient } from './api'

// ============================================================================
// Types
// ============================================================================

export interface Patient {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dob: string | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  address: string | null
  notes: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientStats {
  total: number
  active: number
  inactive: number
  limit: number
  remaining: number
}

export interface CreatePatientData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dob?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  notes?: Record<string, unknown>
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  isActive?: boolean
}

export interface ListPatientsParams {
  limit?: number
  offset?: number
  includeInactive?: boolean
  search?: string
}

export interface PatientAppointment {
  id: string
  tenantId: string
  patientId: string
  doctorId: string
  startTime: string
  endTime: string
  duration: number
  status: string
  type: string | null
  notes: string | null
  cost: number | null
  isPaid: boolean
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialty: string | null
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of patients for the current tenant
 */
export async function getPatients(params?: ListPatientsParams): Promise<Patient[]> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.set('limit', String(params.limit))
  if (params?.offset) queryParams.set('offset', String(params.offset))
  if (params?.includeInactive) queryParams.set('includeInactive', 'true')
  if (params?.search) queryParams.set('search', params.search)

  const queryString = queryParams.toString()
  const url = `/patients${queryString ? `?${queryString}` : ''}`

  const response = await apiClient.get<ApiResponse<Patient[]>>(url)
  return response.data.data
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(id: string): Promise<Patient> {
  const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`)
  return response.data.data
}

/**
 * Get appointments for a patient
 */
export async function getPatientAppointments(
  id: string,
  params?: { limit?: number; offset?: number }
): Promise<PatientAppointment[]> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.set('limit', String(params.limit))
  if (params?.offset) queryParams.set('offset', String(params.offset))

  const queryString = queryParams.toString()
  const url = `/patients/${id}/appointments${queryString ? `?${queryString}` : ''}`

  const response = await apiClient.get<ApiResponse<PatientAppointment[]>>(url)
  return response.data.data
}

/**
 * Create a new patient
 */
export async function createPatient(data: CreatePatientData): Promise<Patient> {
  const response = await apiClient.post<ApiResponse<Patient>>('/patients', data)
  return response.data.data
}

/**
 * Update an existing patient
 */
export async function updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
  const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, data)
  return response.data.data
}

/**
 * Soft delete a patient
 */
export async function deletePatient(id: string): Promise<void> {
  await apiClient.delete(`/patients/${id}`)
}

/**
 * Restore a soft-deleted patient
 */
export async function restorePatient(id: string): Promise<Patient> {
  const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}/restore`)
  return response.data.data
}

/**
 * Get patient statistics and plan limits
 */
export async function getPatientStats(): Promise<PatientStats> {
  const response = await apiClient.get<ApiResponse<PatientStats>>('/patients/stats')
  return response.data.data
}

/**
 * Calculate patient age from date of birth
 */
export function calculateAge(dob: string | null): number | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Format patient full name
 */
export function getPatientFullName(patient: Pick<Patient, 'firstName' | 'lastName'>): string {
  return `${patient.firstName} ${patient.lastName}`
}

/**
 * Get patient initials for avatar
 */
export function getPatientInitials(patient: Pick<Patient, 'firstName' | 'lastName'>): string {
  return `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase()
}

// ============================================================================
// Error Helpers
// ============================================================================

interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export function isPatientApiError(error: unknown): error is { response: { data: ApiErrorResponse } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response: { data?: unknown } }).response?.data !== undefined
  )
}

export function getPatientApiErrorMessage(error: unknown): string {
  if (isPatientApiError(error)) {
    return error.response.data.error?.message || 'An unexpected error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
