import { create } from 'zustand'
import type {
  Expense,
  ExpenseStats,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseListParams,
} from '../lib/expense-api'
import {
  getExpenses,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  restoreExpense as apiRestoreExpense,
  getExpenseStats,
} from '../lib/expense-api'

interface ExpensesState {
  // Data
  expenses: Expense[]
  stats: ExpenseStats | null
  total: number
  
  // UI State
  loading: boolean
  error: string | null
  
  // Filters
  filters: ExpenseListParams
  
  // Actions
  fetchExpenses: (params?: ExpenseListParams) => Promise<void>
  fetchStats: (params?: { from?: string; to?: string }) => Promise<void>
  createExpense: (data: CreateExpenseData) => Promise<Expense>
  updateExpense: (id: string, data: UpdateExpenseData) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
  restoreExpense: (id: string) => Promise<void>
  setFilters: (filters: Partial<ExpenseListParams>) => void
  clearError: () => void
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  // Initial state
  expenses: [],
  stats: null,
  total: 0,
  loading: false,
  error: null,
  filters: {},

  fetchExpenses: async (params?: ExpenseListParams) => {
    set({ loading: true, error: null })
    try {
      const mergedParams = { ...get().filters, ...params }
      const response = await getExpenses(mergedParams)
      set({
        expenses: response.data,
        total: response.pagination.total,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar gastos',
        loading: false,
      })
    }
  },

  fetchStats: async (params?: { from?: string; to?: string }) => {
    try {
      const response = await getExpenseStats(params)
      set({ stats: response.data })
    } catch (error) {
      console.error('Error fetching expense stats:', error)
    }
  },

  createExpense: async (data: CreateExpenseData) => {
    set({ loading: true, error: null })
    try {
      const response = await apiCreateExpense(data)
      const newExpense = response.data
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        total: state.total + 1,
        loading: false,
      }))
      // Refresh stats
      get().fetchStats()
      return newExpense
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al crear gasto',
        loading: false,
      })
      throw error
    }
  },

  updateExpense: async (id: string, data: UpdateExpenseData) => {
    set({ loading: true, error: null })
    try {
      const response = await apiUpdateExpense(id, data)
      const updatedExpense = response.data
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updatedExpense : e)),
        loading: false,
      }))
      // Refresh stats if payment status changed
      if (data.isPaid !== undefined) {
        get().fetchStats()
      }
      return updatedExpense
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al actualizar gasto',
        loading: false,
      })
      throw error
    }
  },

  deleteExpense: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await apiDeleteExpense(id)
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        total: state.total - 1,
        loading: false,
      }))
      get().fetchStats()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al eliminar gasto',
        loading: false,
      })
      throw error
    }
  },

  restoreExpense: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiRestoreExpense(id)
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? response.data : e)),
        loading: false,
      }))
      get().fetchStats()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al restaurar gasto',
        loading: false,
      })
      throw error
    }
  },

  setFilters: (filters: Partial<ExpenseListParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearError: () => set({ error: null }),
}))
