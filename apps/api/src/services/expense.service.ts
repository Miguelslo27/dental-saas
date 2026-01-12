import { prisma, Prisma } from '@dental/database'
import { logger } from '../utils/logger.js'

// Fields to include in expense responses
const EXPENSE_SELECT = {
  id: true,
  tenantId: true,
  date: true,
  amount: true,
  issuer: true,
  phoneNumber: true,
  note: true,
  items: true,
  tags: true,
  isPaid: true,
  doctorIds: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

export type SafeExpense = {
  id: string
  tenantId: string
  date: Date
  amount: Prisma.Decimal
  issuer: string | null
  phoneNumber: string | null
  note: string | null
  items: string[]
  tags: string[]
  isPaid: boolean
  doctorIds: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ExpenseErrorCode = 'NOT_FOUND' | 'ALREADY_INACTIVE' | 'ALREADY_ACTIVE'

export interface CreateExpenseInput {
  date: Date
  amount: number
  issuer?: string
  phoneNumber?: string
  note?: string
  items?: string[]
  tags?: string[]
  isPaid?: boolean
  doctorIds?: string[]
}

export interface UpdateExpenseInput {
  date?: Date
  amount?: number
  issuer?: string | null
  phoneNumber?: string | null
  note?: string | null
  items?: string[]
  tags?: string[]
  isPaid?: boolean
  doctorIds?: string[]
}

export interface ListExpensesOptions {
  limit?: number
  offset?: number
  includeInactive?: boolean
  isPaid?: boolean
  tag?: string
  from?: Date
  to?: Date
}

/**
 * Transform database expense to safe response format
 */
function transformExpense(expense: {
  id: string
  tenantId: string
  date: Date
  amount: Prisma.Decimal
  issuer: string | null
  phoneNumber: string | null
  note: string | null
  items: Prisma.JsonValue
  tags: Prisma.JsonValue
  isPaid: boolean
  doctorIds: Prisma.JsonValue
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): SafeExpense {
  return {
    ...expense,
    items: Array.isArray(expense.items) ? (expense.items as string[]) : [],
    tags: Array.isArray(expense.tags) ? (expense.tags as string[]) : [],
    doctorIds: Array.isArray(expense.doctorIds) ? (expense.doctorIds as string[]) : [],
  }
}

/**
 * Count expenses for a tenant
 */
export async function countExpenses(
  tenantId: string,
  options?: { from?: Date; to?: Date; isPaid?: boolean }
): Promise<number> {
  const where: Prisma.ExpenseWhereInput = {
    tenantId,
    isActive: true,
    ...(options?.isPaid !== undefined && { isPaid: options.isPaid }),
    ...(options?.from && { date: { gte: options.from } }),
    ...(options?.to && { date: { lte: options.to } }),
  }

  return prisma.expense.count({ where })
}

/**
 * Create a new expense
 */
export async function createExpense(
  tenantId: string,
  input: CreateExpenseInput
): Promise<{ success: true; data: SafeExpense }> {
  const expense = await prisma.expense.create({
    data: {
      tenantId,
      date: input.date,
      amount: input.amount,
      issuer: input.issuer || null,
      phoneNumber: input.phoneNumber || null,
      note: input.note || null,
      items: input.items || [],
      tags: input.tags || [],
      isPaid: input.isPaid || false,
      doctorIds: input.doctorIds || [],
    },
    select: EXPENSE_SELECT,
  })

  logger.info({ expenseId: expense.id, tenantId }, 'Expense created')

  return { success: true, data: transformExpense(expense) }
}

/**
 * Get an expense by ID
 */
export async function getExpenseById(
  tenantId: string,
  expenseId: string
): Promise<{ success: true; data: SafeExpense } | { success: false; code: ExpenseErrorCode }> {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tenantId },
    select: EXPENSE_SELECT,
  })

  if (!expense) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true, data: transformExpense(expense) }
}

/**
 * List expenses for a tenant
 */
export async function listExpenses(
  tenantId: string,
  options?: ListExpensesOptions
): Promise<{ data: SafeExpense[]; total: number }> {
  // Build where clause
  const baseWhere: Prisma.ExpenseWhereInput = {
    tenantId,
    ...(options?.includeInactive ? {} : { isActive: true }),
    ...(options?.isPaid !== undefined && { isPaid: options.isPaid }),
    ...(options?.from && { date: { gte: options.from } }),
    ...(options?.to && { date: { lte: options.to } }),
  }

  // Tag filter using JSON contains
  const where: Prisma.ExpenseWhereInput = options?.tag
    ? {
        ...baseWhere,
        tags: {
          array_contains: [options.tag],
        },
      }
    : baseWhere

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      select: EXPENSE_SELECT,
      orderBy: { date: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.expense.count({ where }),
  ])

  return {
    data: expenses.map(transformExpense),
    total,
  }
}

/**
 * Update an expense
 */
export async function updateExpense(
  tenantId: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<{ success: true; data: SafeExpense } | { success: false; code: ExpenseErrorCode }> {
  // Check expense exists
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, tenantId },
    select: { id: true },
  })

  if (!existing) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...(input.date && { date: input.date }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.issuer !== undefined && { issuer: input.issuer }),
      ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.items && { items: input.items }),
      ...(input.tags && { tags: input.tags }),
      ...(input.isPaid !== undefined && { isPaid: input.isPaid }),
      ...(input.doctorIds && { doctorIds: input.doctorIds }),
    },
    select: EXPENSE_SELECT,
  })

  logger.info({ expenseId, tenantId }, 'Expense updated')

  return { success: true, data: transformExpense(expense) }
}

/**
 * Soft delete an expense
 */
export async function deleteExpense(
  tenantId: string,
  expenseId: string
): Promise<{ success: true; data: SafeExpense } | { success: false; code: ExpenseErrorCode }> {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tenantId },
    select: { id: true, isActive: true },
  })

  if (!expense) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!expense.isActive) {
    return { success: false, code: 'ALREADY_INACTIVE' }
  }

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: { isActive: false },
    select: EXPENSE_SELECT,
  })

  logger.info({ expenseId, tenantId }, 'Expense soft deleted')

  return { success: true, data: transformExpense(updated) }
}

/**
 * Restore a soft-deleted expense
 */
export async function restoreExpense(
  tenantId: string,
  expenseId: string
): Promise<{ success: true; data: SafeExpense } | { success: false; code: ExpenseErrorCode }> {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tenantId },
    select: { id: true, isActive: true },
  })

  if (!expense) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (expense.isActive) {
    return { success: false, code: 'ALREADY_ACTIVE' }
  }

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: { isActive: true },
    select: EXPENSE_SELECT,
  })

  logger.info({ expenseId, tenantId }, 'Expense restored')

  return { success: true, data: transformExpense(updated) }
}

/**
 * Get expense statistics for a tenant
 */
export async function getExpenseStats(
  tenantId: string,
  options?: { from?: Date; to?: Date }
): Promise<{
  total: number
  paid: number
  unpaid: number
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  tags: { tag: string; count: number }[]
}> {
  const where: Prisma.ExpenseWhereInput = {
    tenantId,
    isActive: true,
    ...(options?.from && { date: { gte: options.from } }),
    ...(options?.to && { date: { lte: options.to } }),
  }

  const [total, paid, aggregate, paidAggregate, allExpenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.count({ where: { ...where, isPaid: true } }),
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { ...where, isPaid: true },
      _sum: { amount: true },
    }),
    // Get all expenses to count tags
    prisma.expense.findMany({
      where,
      select: { tags: true },
    }),
  ])

  // Count tag occurrences
  const tagCounts = new Map<string, number>()
  for (const expense of allExpenses) {
    const tags = Array.isArray(expense.tags) ? (expense.tags as string[]) : []
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }

  const totalAmount = aggregate._sum.amount?.toNumber() || 0
  const paidAmount = paidAggregate._sum.amount?.toNumber() || 0

  return {
    total,
    paid,
    unpaid: total - paid,
    totalAmount,
    paidAmount,
    unpaidAmount: totalAmount - paidAmount,
    tags: Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
  }
}
