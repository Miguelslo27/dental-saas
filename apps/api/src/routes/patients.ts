import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { requireMinRole } from '../middleware/auth.js'
import {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  restorePatient,
  checkPatientLimit,
  getPatientStats,
  getPatientAppointments,
} from '../services/patient.service.js'

const patientsRouter: IRouter = Router()

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Prisma P2002 unique constraint error type
 */
type PrismaP2002Error = {
  code?: string
  meta?: {
    driverAdapterError?: {
      cause?: {
        originalMessage?: string
      }
    }
  }
}

/**
 * Handle Prisma P2002 unique constraint violations
 * Returns true if the error was handled, false otherwise
 */
function handlePrismaUniqueError(
  e: unknown,
  res: import('express').Response
): boolean {
  const error = e as PrismaP2002Error
  if (error.code !== 'P2002') {
    return false
  }

  const originalMessage = error.meta?.driverAdapterError?.cause?.originalMessage || ''

  if (originalMessage.includes('email')) {
    res.status(409).json({
      success: false,
      error: { message: 'A patient with this email already exists', code: 'DUPLICATE_EMAIL' },
    })
    return true
  }

  // Generic duplicate error
  res.status(409).json({
    success: false,
    error: { message: 'A patient with these values already exists', code: 'DUPLICATE_ENTRY' },
  })
  return true
}

// ============================================================================
// Validation Schemas
// ============================================================================

// Phone validation: normalize empty strings to undefined
const phoneSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val === '' ? undefined : val))

// Date of birth validation: accept ISO date string, must not be in the future
const dobSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true
      const date = new Date(val)
      return !isNaN(date.getTime())
    },
    { message: 'Invalid date format' }
  )
  .refine(
    (val) => {
      if (!val) return true
      const date = new Date(val)
      if (isNaN(date.getTime())) return false
      return date.getTime() <= Date.now()
    },
    { message: 'Date of birth cannot be in the future' }
  )

// Gender validation
const genderSchema = z
  .enum(['male', 'female', 'other', 'prefer_not_to_say'])
  .optional()
  .nullable()

// Query params validation for list endpoint
const listPatientsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  includeInactive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
})

// Create patient schema
const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional(),
  phone: phoneSchema,
  dob: dobSchema,
  gender: genderSchema,
  address: z.string().max(500, 'Address cannot exceed 500 characters').optional(),
  notes: z.record(z.unknown()).optional(),
})

// Update patient schema (all fields optional)
const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: phoneSchema,
  dob: dobSchema,
  gender: genderSchema,
  address: z.string().max(500, 'Address cannot exceed 500 characters').optional().nullable(),
  notes: z.record(z.unknown()).optional().nullable(),
})

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/patients
 * List all patients for the tenant (STAFF+ required)
 */
patientsRouter.get('/', requireMinRole('STAFF'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const parsedQuery = listPatientsQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters', code: 'INVALID_QUERY', details: parsedQuery.error.errors },
      })
    }

    const { limit, offset, includeInactive, search } = parsedQuery.data

    const patients = await listPatients(tenantId, {
      limit,
      offset,
      includeInactive: includeInactive === 'true',
      search,
    })

    res.json({
      success: true,
      data: patients,
    })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/patients/stats
 * Get patient counts and plan limits (ADMIN+ required)
 */
patientsRouter.get('/stats', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    const stats = await getPatientStats(tenantId)

    res.json({
      success: true,
      data: stats,
    })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/patients/:id
 * Get a single patient by ID (STAFF+ required)
 */
patientsRouter.get('/:id', requireMinRole('STAFF'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId
    const { id } = req.params

    const patient = await getPatientById(tenantId, id)

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: { message: 'Patient not found', code: 'NOT_FOUND' },
      })
    }

    res.json({
      success: true,
      data: patient,
    })
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/patients/:id/appointments
 * Get appointments for a patient (STAFF+ required)
 */
patientsRouter.get('/:id/appointments', requireMinRole('STAFF'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId
    const { id } = req.params

    const { limit, offset } = req.query
    const parsedLimit = limit ? Math.min(parseInt(String(limit), 10) || 20, 100) : 20
    const parsedOffset = offset ? Math.max(parseInt(String(offset), 10) || 0, 0) : 0

    const appointments = await getPatientAppointments(tenantId, id, {
      limit: parsedLimit,
      offset: parsedOffset,
    })

    if (appointments === null) {
      return res.status(404).json({
        success: false,
        error: { message: 'Patient not found', code: 'NOT_FOUND' },
      })
    }

    res.json({
      success: true,
      data: appointments,
    })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/patients
 * Create a new patient (ADMIN+ required)
 */
patientsRouter.post('/', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId

    // Check plan limits first
    const limitCheck = await checkPatientLimit(tenantId)
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: {
          message: limitCheck.message,
          code: 'PLAN_LIMIT_EXCEEDED',
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
        },
      })
    }

    // Validate request body
    const parsed = createPatientSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid request body', code: 'VALIDATION_ERROR', details: parsed.error.errors },
      })
    }

    // Transform null/undefined phone to undefined for create
    const createData = {
      ...parsed.data,
      phone: parsed.data.phone ?? undefined,
      dob: parsed.data.dob ?? undefined,
      gender: parsed.data.gender ?? undefined,
    }

    const patient = await createPatient(tenantId, createData as any)

    res.status(201).json({
      success: true,
      data: patient,
    })
  } catch (e) {
    if (handlePrismaUniqueError(e, res)) {
      return
    }
    next(e)
  }
})

/**
 * PUT /api/patients/:id
 * Update a patient (ADMIN+ required)
 */
patientsRouter.put('/:id', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId
    const { id } = req.params

    // Validate request body
    const parsed = updatePatientSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid request body', code: 'VALIDATION_ERROR', details: parsed.error.errors },
      })
    }

    const patient = await updatePatient(tenantId, id, parsed.data as any)

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: { message: 'Patient not found', code: 'NOT_FOUND' },
      })
    }

    res.json({
      success: true,
      data: patient,
    })
  } catch (e) {
    if (handlePrismaUniqueError(e, res)) {
      return
    }
    next(e)
  }
})

/**
 * DELETE /api/patients/:id
 * Soft delete a patient (ADMIN+ required)
 */
patientsRouter.delete('/:id', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId
    const { id } = req.params

    const result = await deletePatient(tenantId, id)

    if (!result.success) {
      if (result.errorCode === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { message: result.error, code: 'NOT_FOUND' },
        })
      }

      // ALREADY_INACTIVE or other cases
      return res.status(400).json({
        success: false,
        error: { message: result.error, code: result.errorCode || 'INVALID_OPERATION' },
      })
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully',
    })
  } catch (e) {
    next(e)
  }
})

/**
 * PUT /api/patients/:id/restore
 * Restore a soft-deleted patient (ADMIN+ required)
 */
patientsRouter.put('/:id/restore', requireMinRole('ADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId
    const { id } = req.params

    const result = await restorePatient(tenantId, id)

    if (!result.success) {
      if (result.errorCode === 'PLAN_LIMIT_EXCEEDED') {
        return res.status(403).json({
          success: false,
          error: { message: result.error, code: 'PLAN_LIMIT_EXCEEDED' },
        })
      }

      if (result.errorCode === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { message: result.error, code: 'NOT_FOUND' },
        })
      }

      // ALREADY_ACTIVE or other cases
      return res.status(400).json({
        success: false,
        error: { message: result.error, code: result.errorCode || 'INVALID_OPERATION' },
      })
    }

    res.json({
      success: true,
      data: result.patient,
    })
  } catch (e) {
    next(e)
  }
})

export { patientsRouter }
