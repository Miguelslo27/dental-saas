import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBudgetsStore } from './budgets.store'
import type { Budget, BudgetItem } from '../lib/budget-api'

vi.mock('../lib/budget-api', () => ({
  listBudgetsByPatient: vi.fn(),
  getBudget: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  addBudgetItem: vi.fn(),
  updateBudgetItem: vi.fn(),
  deleteBudgetItem: vi.fn(),
}))

import {
  listBudgetsByPatient,
  getBudget,
  createBudget as apiCreateBudget,
  updateBudget as apiUpdateBudget,
  deleteBudget as apiDeleteBudget,
  addBudgetItem as apiAddBudgetItem,
  updateBudgetItem as apiUpdateBudgetItem,
  deleteBudgetItem as apiDeleteBudgetItem,
} from '../lib/budget-api'

function makeItem(overrides: Partial<BudgetItem> = {}): BudgetItem {
  return {
    id: 'item-1',
    budgetId: 'budget-1',
    description: 'Extracción',
    toothNumber: null,
    quantity: 1,
    unitPrice: '100',
    totalPrice: '100',
    plannedAppointmentType: null,
    status: 'PENDING',
    notes: null,
    order: 0,
    createdAt: '2026-04-23T00:00:00Z',
    updatedAt: '2026-04-23T00:00:00Z',
    ...overrides,
  }
}

function makeBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 'budget-1',
    tenantId: 'tenant-1',
    patientId: 'patient-1',
    createdById: 'user-1',
    status: 'DRAFT',
    notes: null,
    validUntil: null,
    totalAmount: '100',
    publicToken: null,
    publicTokenExpiresAt: null,
    isActive: true,
    createdAt: '2026-04-23T00:00:00Z',
    updatedAt: '2026-04-23T00:00:00Z',
    items: [makeItem()],
    ...overrides,
  }
}

describe('budgets.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useBudgetsStore.getState().reset()
  })

  it('fetchBudgetsByPatient stores results and patient id', async () => {
    const b = makeBudget()
    vi.mocked(listBudgetsByPatient).mockResolvedValue({ data: [b], total: 1 })
    await useBudgetsStore.getState().fetchBudgetsByPatient('patient-1')
    const s = useBudgetsStore.getState()
    expect(s.budgets).toEqual([b])
    expect(s.currentPatientId).toBe('patient-1')
    expect(s.total).toBe(1)
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it('fetchBudgetsByPatient sets error on failure', async () => {
    vi.mocked(listBudgetsByPatient).mockRejectedValue(new Error('boom'))
    await useBudgetsStore.getState().fetchBudgetsByPatient('patient-1')
    expect(useBudgetsStore.getState().error).toBe('boom')
  })

  it('fetchBudget stores it as currentBudget', async () => {
    const b = makeBudget()
    vi.mocked(getBudget).mockResolvedValue(b)
    const result = await useBudgetsStore.getState().fetchBudget('budget-1')
    expect(result).toEqual(b)
    expect(useBudgetsStore.getState().currentBudget).toEqual(b)
  })

  it('createBudget prepends the budget to the list when the patient matches', async () => {
    vi.mocked(listBudgetsByPatient).mockResolvedValue({ data: [], total: 0 })
    await useBudgetsStore.getState().fetchBudgetsByPatient('patient-1')

    const b = makeBudget()
    vi.mocked(apiCreateBudget).mockResolvedValue(b)
    await useBudgetsStore
      .getState()
      .createBudget('patient-1', { items: [{ description: 'X', quantity: 1, unitPrice: 10 }] })

    expect(useBudgetsStore.getState().budgets).toEqual([b])
    expect(useBudgetsStore.getState().total).toBe(1)
  })

  it('createBudget does not touch list when patient does not match', async () => {
    vi.mocked(listBudgetsByPatient).mockResolvedValue({ data: [], total: 0 })
    await useBudgetsStore.getState().fetchBudgetsByPatient('patient-1')

    const b = makeBudget({ patientId: 'patient-2' })
    vi.mocked(apiCreateBudget).mockResolvedValue(b)
    await useBudgetsStore
      .getState()
      .createBudget('patient-2', { items: [{ description: 'X', quantity: 1, unitPrice: 10 }] })

    expect(useBudgetsStore.getState().budgets).toEqual([])
    expect(useBudgetsStore.getState().total).toBe(0)
  })

  it('updateBudget replaces the budget in list and currentBudget', async () => {
    const initial = makeBudget()
    vi.mocked(listBudgetsByPatient).mockResolvedValue({ data: [initial], total: 1 })
    await useBudgetsStore.getState().fetchBudgetsByPatient('patient-1')
    vi.mocked(getBudget).mockResolvedValue(initial)
    await useBudgetsStore.getState().fetchBudget('budget-1')

    const updated = makeBudget({ notes: 'updated' })
    vi.mocked(apiUpdateBudget).mockResolvedValue(updated)
    await useBudgetsStore.getState().updateBudget('budget-1', { notes: 'updated' })

    const s = useBudgetsStore.getState()
    expect(s.budgets[0].notes).toBe('updated')
    expect(s.currentBudget?.notes).toBe('updated')
  })

  it('deleteBudget removes from list and clears currentBudget when matching', async () => {
    const b = makeBudget()
    vi.mocked(listBudgetsByPatient).mockResolvedValue({ data: [b], total: 1 })
    await useBudgetsStore.getState().fetchBudgetsByPatient('patient-1')
    vi.mocked(getBudget).mockResolvedValue(b)
    await useBudgetsStore.getState().fetchBudget('budget-1')

    vi.mocked(apiDeleteBudget).mockResolvedValue(makeBudget({ isActive: false }))
    await useBudgetsStore.getState().deleteBudget('budget-1')

    const s = useBudgetsStore.getState()
    expect(s.budgets).toEqual([])
    expect(s.total).toBe(0)
    expect(s.currentBudget).toBeNull()
  })

  it('addItem / updateItem / deleteItem replace the current budget', async () => {
    const initial = makeBudget()
    vi.mocked(getBudget).mockResolvedValue(initial)
    await useBudgetsStore.getState().fetchBudget('budget-1')

    const afterAdd = makeBudget({
      items: [initial.items[0], makeItem({ id: 'item-2' })],
    })
    vi.mocked(apiAddBudgetItem).mockResolvedValue(afterAdd)
    await useBudgetsStore
      .getState()
      .addItem('budget-1', { description: 'Y', quantity: 1, unitPrice: 20 })
    expect(useBudgetsStore.getState().currentBudget?.items).toHaveLength(2)

    const afterUpdate = makeBudget({
      items: [makeItem({ id: 'item-1', status: 'EXECUTED' }), makeItem({ id: 'item-2' })],
    })
    vi.mocked(apiUpdateBudgetItem).mockResolvedValue(afterUpdate)
    await useBudgetsStore
      .getState()
      .updateItem('budget-1', 'item-1', { status: 'EXECUTED' })
    expect(useBudgetsStore.getState().currentBudget?.items[0].status).toBe('EXECUTED')

    const afterDelete = makeBudget({ items: [makeItem({ id: 'item-2' })] })
    vi.mocked(apiDeleteBudgetItem).mockResolvedValue(afterDelete)
    await useBudgetsStore.getState().deleteItem('budget-1', 'item-1')
    expect(useBudgetsStore.getState().currentBudget?.items).toHaveLength(1)
    expect(useBudgetsStore.getState().currentBudget?.items[0].id).toBe('item-2')
  })
})
