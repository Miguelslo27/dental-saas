import { apiClient } from './api'

// ============================================================================
// Types
// ============================================================================

export interface Expense {
  id: string
  tenantId: string
  date: string
  amount: number
  issuer: string
  items: string[]
  tags: string[]
  note: string | null
  isPaid: boolean
  doctorIds: string[]
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ExpenseStats {
  total: number
  paid: number
  unpaid: number
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
}

export interface CreateExpenseData {
  date: string
  amount: number
  issuer: string
  items?: string[]
  tags?: string[]
  note?: string
  isPaid?: boolean
  doctorIds?: string[]
}

export interface UpdateExpenseData {
  date?: string
  amount?: number
  issuer?: string
  items?: string[]
  tags?: string[]
  note?: string | null
  isPaid?: boolean
  doctorIds?: string[]
}

export interface ExpenseListParams {
  limit?: number
  offset?: number
  search?: string
  tag?: string
  isPaid?: boolean
  from?: string
  to?: string
  includeInactive?: boolean
}

interface ExpenseListResponse {
  success: boolean
  data: Expense[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

interface ExpenseResponse {
  success: boolean
  data: Expense
}

interface ExpenseStatsResponse {
  success: boolean
  data: ExpenseStats
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of expenses for the current tenant
 */
export async function getExpenses(params?: ExpenseListParams): Promise<ExpenseListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.set('limit', String(params.limit))
  if (params?.offset) queryParams.set('offset', String(params.offset))
  if (params?.search) queryParams.set('search', params.search)
  if (params?.tag) queryParams.set('tag', params.tag)
  if (params?.isPaid !== undefined) queryParams.set('isPaid', String(params.isPaid))
  if (params?.from) queryParams.set('from', params.from)
  if (params?.to) queryParams.set('to', params.to)
  if (params?.includeInactive) queryParams.set('includeInactive', 'true')

  const queryString = queryParams.toString()
  const url = `/expenses${queryString ? `?${queryString}` : ''}`

  const response = await apiClient.get<ExpenseListResponse>(url)
  return response.data
}

/**
 * Get expense by ID
 */
export async function getExpenseById(id: string): Promise<ExpenseResponse> {
  const response = await apiClient.get<ExpenseResponse>(`/expenses/${id}`)
  return response.data
}

/**
 * Create a new expense
 */
export async function createExpense(data: CreateExpenseData): Promise<ExpenseResponse> {
  const response = await apiClient.post<ExpenseResponse>('/expenses', data)
  return response.data
}

/**
 * Update an expense
 */
export async function updateExpense(id: string, data: UpdateExpenseData): Promise<ExpenseResponse> {
  const response = await apiClient.put<ExpenseResponse>(`/expenses/${id}`, data)
  return response.data
}

/**
 * Delete an expense (soft delete)
 */
export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`)
}

/**
 * Restore a deleted expense
 */
export async function restoreExpense(id: string): Promise<ExpenseResponse> {
  const response = await apiClient.put<ExpenseResponse>(`/expenses/${id}/restore`, {})
  return response.data
}

/**
 * Get expense statistics
 */
export async function getExpenseStats(params?: { from?: string; to?: string }): Promise<ExpenseStatsResponse> {
  const queryParams = new URLSearchParams()

  if (params?.from) queryParams.set('from', params.from)
  if (params?.to) queryParams.set('to', params.to)

  const queryString = queryParams.toString()
  const url = `/expenses/stats${queryString ? `?${queryString}` : ''}`

  const response = await apiClient.get<ExpenseStatsResponse>(url)
  return response.data
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get badge variant based on payment status
 */
export function getExpenseStatusBadge(expense: Expense): { label: string; variant: 'default' | 'success' | 'warning' } {
  if (expense.isPaid) {
    return { label: 'Pagado', variant: 'success' }
  }
  return { label: 'Pendiente', variant: 'warning' }
}

/**
 * Format expense amount as currency
 */
export { formatCurrency as formatExpenseAmount } from './format'
