import { apiClient } from './api'

// ============================================================================
// Types
// ============================================================================

export interface OverviewStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  appointmentsThisMonth: number
  completedAppointmentsThisMonth: number
  pendingLabworks: number
  unpaidLabworks: number
  monthlyRevenue: number
  pendingPayments: number
}

export interface AppointmentStats {
  total: number
  byStatus: Record<string, number>
  byDay: Array<{ date: string; count: number }>
}

export interface RevenueStats {
  total: number
  paid: number
  pending: number
  byMonth: Array<{ month: string; revenue: number }>
}

export interface PatientsGrowthStats {
  total: number
  thisMonth: number
  lastMonth: number
  growthPercentage: number
  byMonth: Array<{ month: string; count: number }>
}

export interface DoctorPerformanceStats {
  doctorId: string
  doctorName: string
  appointmentsCount: number
  completedCount: number
  revenue: number
  completionRate: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: { message: string }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get dashboard overview statistics
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  const response = await apiClient.get<ApiResponse<OverviewStats>>('/stats/overview')
  return response.data.data
}

/**
 * Get appointment statistics for a period
 */
export async function getAppointmentStats(
  startDate?: string,
  endDate?: string
): Promise<AppointmentStats> {
  const params: Record<string, string> = {}
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const response = await apiClient.get<ApiResponse<AppointmentStats>>('/stats/appointments', { params })
  return response.data.data
}

/**
 * Get revenue statistics
 */
export async function getRevenueStats(months?: number): Promise<RevenueStats> {
  const params: Record<string, string> = {}
  if (months) params.months = String(months)

  const response = await apiClient.get<ApiResponse<RevenueStats>>('/stats/revenue', { params })
  return response.data.data
}

/**
 * Get patients growth statistics
 */
export async function getPatientsGrowthStats(months?: number): Promise<PatientsGrowthStats> {
  const params: Record<string, string> = {}
  if (months) params.months = String(months)

  const response = await apiClient.get<ApiResponse<PatientsGrowthStats>>('/stats/patients-growth', { params })
  return response.data.data
}

/**
 * Get doctor performance statistics (ADMIN+ only)
 */
export async function getDoctorPerformanceStats(): Promise<DoctorPerformanceStats[]> {
  const response = await apiClient.get<ApiResponse<DoctorPerformanceStats[]>>('/stats/doctors-performance')
  return response.data.data
}

/**
 * Extract error message from API error
 */
export function getStatsApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
    return axiosError.response?.data?.error?.message || 'Error loading statistics'
  }
  return 'Error loading statistics'
}
