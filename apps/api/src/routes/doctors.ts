import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'

const doctorsRouter: IRouter = Router()

// Simple tenant extractor middleware (expects `x-tenant-id` header)
function getTenantId(req: any) {
  const tenantId = String(req.headers['x-tenant-id'] || '')
  if (!tenantId) return null
  return tenantId
}

// Zod schemas
const doctorCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  workingDays: z.array(z.string()).optional(),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  consultingRoom: z.string().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
})

const allowedUpdateFields = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'specialty',
  'licenseNumber',
  'workingDays',
  'workingHours',
  'consultingRoom',
  'avatar',
  'bio',
  'hourlyRate',
]

// List doctors
doctorsRouter.get('/', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { limit, offset } = req.query
    const where: any = { tenantId }

    const take = limit ? Math.min(parseInt(String(limit), 10) || 0, 100) : undefined
    const skip = offset ? Math.max(parseInt(String(offset), 10) || 0, 0) : undefined

    const doctors = await prisma.doctor.findMany({ where, take, skip })
    res.json(doctors)
  } catch (e) {
    next(e)
  }
})

// Get doctor by ID
doctorsRouter.get('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params
    const doctor = await prisma.doctor.findUnique({ where: { id } })
    if (!doctor || doctor.tenantId !== tenantId) {
      return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })
    }
    res.json(doctor)
  } catch (e) {
    next(e)
  }
})

// Create doctor
doctorsRouter.post('/', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const parse = doctorCreateSchema.safeParse(req.body)
    if (!parse.success) return res.status(400).json({ success: false, error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors } })

    const data = { ...parse.data, tenantId }
    const doctor = await prisma.doctor.create({ data })
    res.status(201).json(doctor)
  } catch (e) {
    next(e)
  }
})

// Update doctor
doctorsRouter.put('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params

    // Prevent changing tenantId or id
    const forbidden = ['id', 'tenantId']
    const attempted = forbidden.filter((f) => Object.prototype.hasOwnProperty.call(req.body, f))
    if (attempted.length > 0) return res.status(400).json({ success: false, error: { message: 'Attempt to modify immutable fields', code: 'IMMUTABLE_FIELDS', fields: attempted } })

    // Whitelist allowed fields
    const data: any = {}
    for (const key of allowedUpdateFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) data[key] = (req.body as any)[key]
    }

    const existing = await prisma.doctor.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })

    const doctor = await prisma.doctor.update({ where: { id }, data })
    res.json(doctor)
  } catch (e) {
    next(e)
  }
})

// Soft delete doctor
doctorsRouter.delete('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params
    const existing = await prisma.doctor.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })

    const doctor = await prisma.doctor.update({ where: { id }, data: { isActive: false } })
    res.json(doctor)
  } catch (e) {
    next(e)
  }
})

export { doctorsRouter }
