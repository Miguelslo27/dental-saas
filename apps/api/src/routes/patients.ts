import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'

const patientsRouter = Router()

// Simple tenant extractor middleware (expects `x-tenant-id` header)
function getTenantId(req: any) {
  const tenantId = String(req.headers['x-tenant-id'] || '')
  if (!tenantId) return null
  return tenantId
}

// Zod schemas / allowed fields
const patientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  notes: z.any().optional(),
})

const allowedUpdateFields = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'dob',
  'gender',
  'address',
  'notes',
]

// List patients (optional tenantId query)
patientsRouter.get('/', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { limit, offset } = req.query
    const where: any = { tenantId }

    const take = limit ? Math.min(parseInt(String(limit), 10) || 0, 100) : undefined
    const skip = offset ? Math.max(parseInt(String(offset), 10) || 0, 0) : undefined

    const patients = await prisma.patient.findMany({ where, take, skip })
    res.json(patients)
  } catch (e) {
    next(e)
  }
})

patientsRouter.get('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params
    const patient = await prisma.patient.findUnique({ where: { id } })
    if (!patient || patient.tenantId !== tenantId) {
      return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })
    }
    res.json(patient)
  } catch (e) {
    next(e)
  }
})

patientsRouter.post('/', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const parse = patientCreateSchema.safeParse(req.body)
    if (!parse.success) return res.status(400).json({ success: false, error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors } })

    const data = { ...parse.data, tenantId }
    const patient = await prisma.patient.create({ data })
    res.status(201).json(patient)
  } catch (e) {
    next(e)
  }
})

patientsRouter.put('/:id', async (req, res, next) => {
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

    const existing = await prisma.patient.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })

    const patient = await prisma.patient.update({ where: { id }, data })
    res.json(patient)
  } catch (e) {
    next(e)
  }
})

patientsRouter.delete('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params
    const existing = await prisma.patient.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })

    const patient = await prisma.patient.update({ where: { id }, data: { isActive: false } })
    res.json(patient)
  } catch (e) {
    next(e)
  }
})

export { patientsRouter }
