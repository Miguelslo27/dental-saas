import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { requireMinRole } from '../middleware/auth.js'
import {
  createExpense,
  getExpenseById,
  listExpenses,
  updateExpense,
  deleteExpense,
  restoreExpense,
  getExpenseStats,
} from '../services/expense.service.js'

const expensesRouter: IRouter = Router()

// Zod schemas for validation
const createExpenseSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  amount: z.number().min(0, 'Amount must be non-negative'),
  issuer: z.string().optional(),
  phoneNumber: z.string().optional(),
  note: z.string().optional(),
  items: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPaid: z.boolean().optional(),
  doctorIds: z.array(z.string()).optional(),
})

const updateExpenseSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  amount: z.number().min(0).optional(),
  issuer: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPaid: z.boolean().optional(),
  doctorIds: z.array(z.string()).optional(),
})

// Error code to HTTP status mapping
const errorStatusMap: Record<string, number> = {
  NOT_FOUND: 404,
  ALREADY_INACTIVE: 400,
  ALREADY_ACTIVE: 400,
}

// Error code to message mapping
const errorMessageMap: Record<string, string> = {
  NOT_FOUND: 'Expense not found',
  ALREADY_INACTIVE: 'Expense is already deleted',
  ALREADY_ACTIVE: 'Expense is already active',
}

/**
 * GET /api/expenses
 * List expenses for the tenant
 */
expensesRouter.get('/', requireMinRole('STAFF'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const { limit, offset, isPaid, tag, from, to, includeInactive } = req.query

    const result = await listExpenses(tenantId, {
      limit: limit ? Math.min(parseInt(String(limit), 10), 100) : undefined,
      offset: offset ? parseInt(String(offset), 10) : undefined,
      isPaid: isPaid !== undefined ? isPaid === 'true' : undefined,
      tag: tag ? String(tag) : undefined,
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
      includeInactive: includeInactive === 'true',
    })

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: limit ? parseInt(String(limit), 10) : 50,
        offset: offset ? parseInt(String(offset), 10) : 0,
      },
    })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/expenses/stats
 * Get expense statistics
 */
expensesRouter.get('/stats', requireMinRole('STAFF'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const { from, to } = req.query

    const stats = await getExpenseStats(tenantId, {
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
    })

    res.json({ success: true, data: stats })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/expenses/:id
 * Get a specific expense
 */
expensesRouter.get('/:id', requireMinRole('STAFF'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const { id } = req.params

    const result = await getExpenseById(tenantId, id)

    if (!result.success) {
      res.status(errorStatusMap[result.code] || 500).json({
        success: false,
        error: errorMessageMap[result.code] || 'Unknown error',
      })
      return
    }

    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/expenses
 * Create a new expense
 */
expensesRouter.post('/', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!

    const parsed = createExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const result = await createExpense(tenantId, {
      ...parsed.data,
      date: new Date(parsed.data.date),
    })

    res.status(201).json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * PUT /api/expenses/:id
 * Update an expense
 */
expensesRouter.put('/:id', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const { id } = req.params

    const parsed = updateExpenseSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const result = await updateExpense(tenantId, id, {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    })

    if (!result.success) {
      res.status(errorStatusMap[result.code] || 500).json({
        success: false,
        error: errorMessageMap[result.code] || 'Unknown error',
      })
      return
    }

    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * DELETE /api/expenses/:id
 * Soft delete an expense
 */
expensesRouter.delete('/:id', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const { id } = req.params

    const result = await deleteExpense(tenantId, id)

    if (!result.success) {
      res.status(errorStatusMap[result.code] || 500).json({
        success: false,
        error: errorMessageMap[result.code] || 'Unknown error',
      })
      return
    }

    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * PUT /api/expenses/:id/restore
 * Restore a soft-deleted expense
 */
expensesRouter.put('/:id/restore', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const { id } = req.params

    const result = await restoreExpense(tenantId, id)

    if (!result.success) {
      res.status(errorStatusMap[result.code] || 500).json({
        success: false,
        error: errorMessageMap[result.code] || 'Unknown error',
      })
      return
    }

    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

export { expensesRouter }
export default expensesRouter
