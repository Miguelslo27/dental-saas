import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions.js'
import { Permission } from '@dental/shared'
import {
  getBudget,
  updateBudget,
  deleteBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  type BudgetErrorCode,
} from '../services/budget.service.js'

const budgetsRouter: IRouter = Router()

// ============================================================================
// Zod schemas (shared between top-level and nested routes)
// ============================================================================

export const budgetItemInputSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  toothNumber: z.string().max(5).nullable().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  plannedAppointmentType: z.string().max(100).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  order: z.number().int().min(0).optional(),
})

export const createBudgetSchema = z.object({
  notes: z.string().max(2000).nullable().optional(),
  validUntil: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional(),
  status: z.enum(['DRAFT', 'APPROVED', 'PARTIAL', 'COMPLETED', 'CANCELLED']).optional(),
  items: z.array(budgetItemInputSchema).min(1, 'At least one item is required'),
})

export const updateBudgetSchema = z.object({
  notes: z.string().max(2000).nullable().optional(),
  validUntil: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional(),
  status: z.enum(['DRAFT', 'APPROVED', 'PARTIAL', 'COMPLETED', 'CANCELLED']).optional(),
})

export const updateBudgetItemSchema = budgetItemInputSchema
  .partial()
  .extend({
    status: z
      .enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'EXECUTED', 'CANCELLED'])
      .optional(),
  })

// ============================================================================
// Error mapping
// ============================================================================

const BUDGET_ERROR_MAP: Record<BudgetErrorCode, { status: number; message: string }> = {
  NOT_FOUND: { status: 404, message: 'Budget not found' },
  PATIENT_NOT_FOUND: { status: 404, message: 'Patient not found' },
  ALREADY_INACTIVE: { status: 400, message: 'Budget is already deleted' },
  ITEM_NOT_FOUND: { status: 404, message: 'Budget item not found' },
  INVALID_STATUS_TRANSITION: { status: 400, message: 'Invalid status transition' },
}

function sendError(
  res: import('express').Response,
  code: BudgetErrorCode
): void {
  const mapped = BUDGET_ERROR_MAP[code]
  res.status(mapped.status).json({ success: false, error: mapped.message })
}

// ============================================================================
// Routes: /api/budgets/:id and nested items
// ============================================================================

/**
 * GET /api/budgets/:id
 */
budgetsRouter.get('/:id', requirePermission(Permission.BUDGETS_VIEW), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const result = await getBudget(tenantId, req.params.id)
    if (!result.success) return sendError(res, result.code)
    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * PATCH /api/budgets/:id
 */
budgetsRouter.patch('/:id', requirePermission(Permission.BUDGETS_UPDATE), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const parsed = updateBudgetSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const result = await updateBudget(tenantId, req.params.id, {
      notes: parsed.data.notes,
      validUntil:
        typeof parsed.data.validUntil === 'string'
          ? new Date(parsed.data.validUntil)
          : parsed.data.validUntil,
      status: parsed.data.status,
    })

    if (!result.success) return sendError(res, result.code)
    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * DELETE /api/budgets/:id
 * Soft delete (isActive=false).
 */
budgetsRouter.delete('/:id', requirePermission(Permission.BUDGETS_DELETE), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const result = await deleteBudget(tenantId, req.params.id)
    if (!result.success) return sendError(res, result.code)
    res.json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/budgets/:id/items
 */
budgetsRouter.post('/:id/items', requirePermission(Permission.BUDGETS_UPDATE), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId!
    const parsed = budgetItemInputSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const result = await addBudgetItem(tenantId, req.params.id, parsed.data)
    if (!result.success) return sendError(res, result.code)
    res.status(201).json({ success: true, data: result.data })
  } catch (e) {
    next(e)
  }
})

/**
 * PATCH /api/budgets/:id/items/:itemId
 */
budgetsRouter.patch(
  '/:id/items/:itemId',
  requirePermission(Permission.BUDGETS_UPDATE),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenantId!
      const parsed = updateBudgetItemSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const result = await updateBudgetItem(
        tenantId,
        req.params.id,
        req.params.itemId,
        parsed.data
      )
      if (!result.success) return sendError(res, result.code)
      res.json({ success: true, data: result.data })
    } catch (e) {
      next(e)
    }
  }
)

/**
 * DELETE /api/budgets/:id/items/:itemId
 */
budgetsRouter.delete(
  '/:id/items/:itemId',
  requirePermission(Permission.BUDGETS_UPDATE),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenantId!
      const result = await deleteBudgetItem(tenantId, req.params.id, req.params.itemId)
      if (!result.success) return sendError(res, result.code)
      res.json({ success: true, data: result.data })
    } catch (e) {
      next(e)
    }
  }
)

export { budgetsRouter }
