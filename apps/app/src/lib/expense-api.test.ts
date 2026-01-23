import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  restoreExpense,
  getExpenseStats,
  getExpenseStatusBadge,
  formatExpenseAmount,
  type Expense,
  type ExpenseStats,
} from './expense-api'
import { apiClient } from './api'

vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockExpense: Expense = {
  id: 'expense-123',
  tenantId: 'tenant-456',
  date: '2024-01-15',
  amount: 250.5,
  issuer: 'Dental Supplies Inc',
  items: ['Gloves', 'Masks', 'Syringes'],
  tags: ['supplies', 'monthly'],
  note: 'Monthly supply order',
  isPaid: true,
  doctorIds: ['doctor-1', 'doctor-2'],
  isActive: true,
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

const mockExpenseStats: ExpenseStats = {
  total: 50,
  paid: 40,
  unpaid: 10,
  totalAmount: 5000,
  paidAmount: 4000,
  unpaidAmount: 1000,
}

const mockPagination = {
  total: 50,
  limit: 10,
  offset: 0,
}

describe('expense-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getExpenses', () => {
    it('should fetch expenses without params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: [mockExpense], pagination: mockPagination },
      })

      const result = await getExpenses()

      expect(apiClient.get).toHaveBeenCalledWith('/expenses')
      expect(result.data).toEqual([mockExpense])
      expect(result.pagination).toEqual(mockPagination)
    })

    it('should fetch expenses with all params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: [mockExpense], pagination: mockPagination },
      })

      const result = await getExpenses({
        limit: 10,
        offset: 5,
        search: 'dental',
        tag: 'supplies',
        isPaid: true,
        from: '2024-01-01',
        to: '2024-01-31',
        includeInactive: true,
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        '/expenses?limit=10&offset=5&search=dental&tag=supplies&isPaid=true&from=2024-01-01&to=2024-01-31&includeInactive=true'
      )
      expect(result.data).toEqual([mockExpense])
    })

    it('should fetch expenses with isPaid=false', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: [mockExpense], pagination: mockPagination },
      })

      await getExpenses({ isPaid: false })

      expect(apiClient.get).toHaveBeenCalledWith('/expenses?isPaid=false')
    })

    it('should handle empty params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: [], pagination: { total: 0, limit: 10, offset: 0 } },
      })

      const result = await getExpenses({})

      expect(apiClient.get).toHaveBeenCalledWith('/expenses')
      expect(result.data).toEqual([])
    })

    it('should throw error on fetch failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      await expect(getExpenses()).rejects.toThrow('Network error')
    })
  })

  describe('getExpenseById', () => {
    it('should fetch a single expense', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockExpense },
      })

      const result = await getExpenseById('expense-123')

      expect(apiClient.get).toHaveBeenCalledWith('/expenses/expense-123')
      expect(result.data).toEqual(mockExpense)
    })

    it('should throw error on not found', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Expense not found'))

      await expect(getExpenseById('invalid-id')).rejects.toThrow('Expense not found')
    })
  })

  describe('createExpense', () => {
    it('should create a new expense with all fields', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockExpense },
      })

      const createData = {
        date: '2024-01-15',
        amount: 250.5,
        issuer: 'Dental Supplies Inc',
        items: ['Gloves', 'Masks'],
        tags: ['supplies'],
        note: 'Monthly order',
        isPaid: true,
        doctorIds: ['doctor-1'],
      }

      const result = await createExpense(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/expenses', createData)
      expect(result.data).toEqual(mockExpense)
    })

    it('should create expense with minimal data', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockExpense },
      })

      const createData = {
        date: '2024-01-15',
        amount: 100,
        issuer: 'Supplier',
      }

      const result = await createExpense(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/expenses', createData)
      expect(result.data).toEqual(mockExpense)
    })

    it('should throw error on creation failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation error'))

      await expect(
        createExpense({ date: '2024-01-15', amount: 100, issuer: 'Test' })
      ).rejects.toThrow('Validation error')
    })
  })

  describe('updateExpense', () => {
    it('should update an expense', async () => {
      const updatedExpense = { ...mockExpense, amount: 300 }
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { success: true, data: updatedExpense },
      })

      const result = await updateExpense('expense-123', { amount: 300 })

      expect(apiClient.put).toHaveBeenCalledWith('/expenses/expense-123', { amount: 300 })
      expect(result.data.amount).toBe(300)
    })

    it('should update payment status', async () => {
      const paidExpense = { ...mockExpense, isPaid: true }
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { success: true, data: paidExpense },
      })

      const result = await updateExpense('expense-123', { isPaid: true })

      expect(apiClient.put).toHaveBeenCalledWith('/expenses/expense-123', { isPaid: true })
      expect(result.data.isPaid).toBe(true)
    })

    it('should throw error on update failure', async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Update failed'))

      await expect(updateExpense('expense-123', { amount: 300 })).rejects.toThrow('Update failed')
    })
  })

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: {} })

      await deleteExpense('expense-123')

      expect(apiClient.delete).toHaveBeenCalledWith('/expenses/expense-123')
    })

    it('should throw error on delete failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Cannot delete'))

      await expect(deleteExpense('expense-123')).rejects.toThrow('Cannot delete')
    })
  })

  describe('restoreExpense', () => {
    it('should restore a deleted expense', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { success: true, data: mockExpense },
      })

      const result = await restoreExpense('expense-123')

      expect(apiClient.put).toHaveBeenCalledWith('/expenses/expense-123/restore', {})
      expect(result.data).toEqual(mockExpense)
    })

    it('should throw error on restore failure', async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Expense not found'))

      await expect(restoreExpense('invalid-id')).rejects.toThrow('Expense not found')
    })
  })

  describe('getExpenseStats', () => {
    it('should fetch stats without params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockExpenseStats },
      })

      const result = await getExpenseStats()

      expect(apiClient.get).toHaveBeenCalledWith('/expenses/stats')
      expect(result.data).toEqual(mockExpenseStats)
    })

    it('should fetch stats with date range', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockExpenseStats },
      })

      const result = await getExpenseStats({ from: '2024-01-01', to: '2024-01-31' })

      expect(apiClient.get).toHaveBeenCalledWith('/expenses/stats?from=2024-01-01&to=2024-01-31')
      expect(result.data).toEqual(mockExpenseStats)
    })

    it('should throw error on stats fetch failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Failed to fetch stats'))

      await expect(getExpenseStats()).rejects.toThrow('Failed to fetch stats')
    })
  })

  describe('Utility Functions', () => {
    describe('getExpenseStatusBadge', () => {
      it('should return success badge for paid expense', () => {
        const paidExpense = { ...mockExpense, isPaid: true }
        const badge = getExpenseStatusBadge(paidExpense)

        expect(badge.label).toBe('Pagado')
        expect(badge.variant).toBe('success')
      })

      it('should return warning badge for unpaid expense', () => {
        const unpaidExpense = { ...mockExpense, isPaid: false }
        const badge = getExpenseStatusBadge(unpaidExpense)

        expect(badge.label).toBe('Pendiente')
        expect(badge.variant).toBe('warning')
      })
    })

    describe('formatExpenseAmount', () => {
      it('should format amount as USD currency', () => {
        const result = formatExpenseAmount(1234.56)

        expect(result).toMatch(/1[.,]?234[.,]56/)
      })

      it('should format zero amount', () => {
        const result = formatExpenseAmount(0)

        expect(result).toMatch(/0/)
      })

      it('should format large amounts', () => {
        const result = formatExpenseAmount(999999.99)

        expect(result).toMatch(/999[.,]?999[.,]99/)
      })
    })
  })
})
