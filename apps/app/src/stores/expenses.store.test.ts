import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { useExpensesStore } from './expenses.store'
import type { Expense, ExpenseStats } from '../lib/expense-api'

// Mock the expense-api module
vi.mock('../lib/expense-api', () => ({
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  restoreExpense: vi.fn(),
  getExpenseStats: vi.fn(),
}))

// Import mocked functions
import {
  getExpenses,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  restoreExpense as apiRestoreExpense,
  getExpenseStats,
} from '../lib/expense-api'

const mockExpense: Expense = {
  id: 'expense-123',
  tenantId: 'tenant-456',
  date: '2024-01-15',
  amount: 500,
  issuer: 'Dental Supplies Co',
  items: ['gloves', 'masks'],
  tags: ['supplies', 'monthly'],
  note: 'Monthly order',
  isPaid: true,
  doctorIds: ['doctor-101'],
  isActive: true,
  deletedAt: null,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

const mockExpense2: Expense = {
  id: 'expense-456',
  tenantId: 'tenant-456',
  date: '2024-01-20',
  amount: 250,
  issuer: 'Lab Equipment Inc',
  items: ['drill bits'],
  tags: ['equipment'],
  note: null,
  isPaid: false,
  doctorIds: [],
  isActive: true,
  deletedAt: null,
  createdAt: '2024-01-20T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z',
}

const mockStats: ExpenseStats = {
  total: 10,
  paid: 7,
  unpaid: 3,
  totalAmount: 5000,
  paidAmount: 3500,
  unpaidAmount: 1500,
}

describe('expenses.store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useExpensesStore.setState({
      expenses: [],
      stats: null,
      total: 0,
      loading: false,
      error: null,
      filters: {},
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty expenses array', () => {
      const state = useExpensesStore.getState()
      expect(state.expenses).toEqual([])
    })

    it('should have null stats', () => {
      const state = useExpensesStore.getState()
      expect(state.stats).toBeNull()
    })

    it('should have zero total', () => {
      const state = useExpensesStore.getState()
      expect(state.total).toBe(0)
    })

    it('should not be loading', () => {
      const state = useExpensesStore.getState()
      expect(state.loading).toBe(false)
    })

    it('should have empty filters', () => {
      const state = useExpensesStore.getState()
      expect(state.filters).toEqual({})
    })
  })

  describe('fetchExpenses', () => {
    it('should fetch expenses successfully', async () => {
      ;(getExpenses as Mock).mockResolvedValue({
        data: [mockExpense, mockExpense2],
        pagination: { total: 2 },
      })

      await useExpensesStore.getState().fetchExpenses()

      const state = useExpensesStore.getState()
      expect(state.expenses).toEqual([mockExpense, mockExpense2])
      expect(state.total).toBe(2)
      expect(state.loading).toBe(false)
    })

    it('should merge filters from state with params', async () => {
      useExpensesStore.setState({ filters: { isPaid: true } })
      ;(getExpenses as Mock).mockResolvedValue({
        data: [],
        pagination: { total: 0 },
      })

      await useExpensesStore.getState().fetchExpenses({ tag: 'supplies' })

      expect(getExpenses).toHaveBeenCalledWith({ isPaid: true, tag: 'supplies' })
    })

    it('should handle fetch error', async () => {
      ;(getExpenses as Mock).mockRejectedValue(new Error('Network error'))

      await useExpensesStore.getState().fetchExpenses()

      const state = useExpensesStore.getState()
      expect(state.error).toBe('Network error')
      expect(state.loading).toBe(false)
    })
  })

  describe('fetchStats', () => {
    it('should fetch stats successfully', async () => {
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      await useExpensesStore.getState().fetchStats()

      expect(useExpensesStore.getState().stats).toEqual(mockStats)
    })

    it('should not set error on stats fetch failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(getExpenseStats as Mock).mockRejectedValue(new Error('Stats unavailable'))

      await useExpensesStore.getState().fetchStats()

      expect(useExpensesStore.getState().error).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('createExpense', () => {
    it('should add expense to beginning of list', async () => {
      useExpensesStore.setState({ expenses: [mockExpense2], total: 1 })
      ;(apiCreateExpense as Mock).mockResolvedValue({ data: mockExpense })
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      const result = await useExpensesStore.getState().createExpense({
        date: '2024-01-15',
        amount: 500,
        issuer: 'Dental Supplies Co',
      })

      expect(result).toEqual(mockExpense)
      const state = useExpensesStore.getState()
      expect(state.expenses).toHaveLength(2)
      expect(state.expenses[0]).toEqual(mockExpense) // Added at beginning
      expect(state.total).toBe(2)
    })

    it('should refresh stats after creating', async () => {
      ;(apiCreateExpense as Mock).mockResolvedValue({ data: mockExpense })
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      await useExpensesStore.getState().createExpense({
        date: '2024-01-15',
        amount: 500,
        issuer: 'Dental Supplies Co',
      })

      expect(getExpenseStats).toHaveBeenCalled()
    })

    it('should throw error on failure', async () => {
      ;(apiCreateExpense as Mock).mockRejectedValue(new Error('Create failed'))

      await expect(
        useExpensesStore.getState().createExpense({
          date: '2024-01-15',
          amount: 500,
          issuer: 'Dental Supplies Co',
        })
      ).rejects.toThrow()

      expect(useExpensesStore.getState().error).toBe('Create failed')
    })
  })

  describe('updateExpense', () => {
    it('should update expense in list', async () => {
      const updatedExpense = { ...mockExpense, amount: 600 }
      useExpensesStore.setState({ expenses: [mockExpense, mockExpense2] })
      ;(apiUpdateExpense as Mock).mockResolvedValue({ data: updatedExpense })

      const result = await useExpensesStore.getState().updateExpense('expense-123', { amount: 600 })

      expect(result).toEqual(updatedExpense)
      const state = useExpensesStore.getState()
      expect(state.expenses.find((e) => e.id === 'expense-123')?.amount).toBe(600)
    })

    it('should refresh stats when isPaid changes', async () => {
      useExpensesStore.setState({ expenses: [mockExpense] })
      ;(apiUpdateExpense as Mock).mockResolvedValue({
        data: { ...mockExpense, isPaid: false },
      })
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      await useExpensesStore.getState().updateExpense('expense-123', { isPaid: false })

      expect(getExpenseStats).toHaveBeenCalled()
    })

    it('should not refresh stats when isPaid is not changed', async () => {
      useExpensesStore.setState({ expenses: [mockExpense] })
      ;(apiUpdateExpense as Mock).mockResolvedValue({
        data: { ...mockExpense, amount: 600 },
      })

      await useExpensesStore.getState().updateExpense('expense-123', { amount: 600 })

      expect(getExpenseStats).not.toHaveBeenCalled()
    })
  })

  describe('deleteExpense', () => {
    it('should remove expense from list', async () => {
      useExpensesStore.setState({ expenses: [mockExpense, mockExpense2], total: 2 })
      ;(apiDeleteExpense as Mock).mockResolvedValue(undefined)
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      await useExpensesStore.getState().deleteExpense('expense-123')

      const state = useExpensesStore.getState()
      expect(state.expenses).toHaveLength(1)
      expect(state.expenses[0].id).toBe('expense-456')
      expect(state.total).toBe(1)
    })

    it('should refresh stats after deleting', async () => {
      useExpensesStore.setState({ expenses: [mockExpense], total: 1 })
      ;(apiDeleteExpense as Mock).mockResolvedValue(undefined)
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      await useExpensesStore.getState().deleteExpense('expense-123')

      expect(getExpenseStats).toHaveBeenCalled()
    })
  })

  describe('restoreExpense', () => {
    it('should restore expense in list', async () => {
      const inactiveExpense = { ...mockExpense, isActive: false }
      const restoredExpense = { ...mockExpense, isActive: true }
      useExpensesStore.setState({ expenses: [inactiveExpense] })
      ;(apiRestoreExpense as Mock).mockResolvedValue({ data: restoredExpense })
      ;(getExpenseStats as Mock).mockResolvedValue({ data: mockStats })

      await useExpensesStore.getState().restoreExpense('expense-123')

      const state = useExpensesStore.getState()
      expect(state.expenses[0].isActive).toBe(true)
    })
  })

  describe('setFilters', () => {
    it('should merge new filters with existing', () => {
      useExpensesStore.setState({ filters: { isPaid: true } })

      useExpensesStore.getState().setFilters({ tag: 'supplies' })

      expect(useExpensesStore.getState().filters).toEqual({
        isPaid: true,
        tag: 'supplies',
      })
    })

    it('should override existing filter values', () => {
      useExpensesStore.setState({ filters: { isPaid: true } })

      useExpensesStore.getState().setFilters({ isPaid: false })

      expect(useExpensesStore.getState().filters).toEqual({ isPaid: false })
    })
  })

  describe('clearError', () => {
    it('should clear the error', () => {
      useExpensesStore.setState({ error: 'Some error' })

      useExpensesStore.getState().clearError()

      expect(useExpensesStore.getState().error).toBeNull()
    })
  })
})
