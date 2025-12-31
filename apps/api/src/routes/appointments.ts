import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'

const appointmentsRouter: IRouter = Router()

// Simple tenant extractor middleware (expects `x-tenant-id` header)
function getTenantId(req: any) {
  const tenantId = String(req.headers['x-tenant-id'] || '')
  if (!tenantId) return null
  return tenantId
}

// Zod schemas
const appointmentCreateSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().int().positive().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  type: z.string().optional(),
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  cost: z.number().positive().optional(),
  isPaid: z.boolean().optional(),
})

const allowedUpdateFields = [
  'patientId',
  'doctorId',
  'startTime',
  'endTime',
  'duration',
  'status',
  'type',
  'notes',
  'privateNotes',
  'cost',
  'isPaid',
]

// List appointments with optional filters
appointmentsRouter.get('/', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { limit, offset, doctorId, patientId, status, from, to } = req.query
    const where: any = { tenantId }

    // Optional filters
    if (doctorId) where.doctorId = String(doctorId)
    if (patientId) where.patientId = String(patientId)
    if (status) where.status = String(status)
    
    // Date range filter
    if (from || to) {
      where.startTime = {}
      if (from) where.startTime.gte = new Date(String(from))
      if (to) where.startTime.lte = new Date(String(to))
    }

    const take = limit ? Math.min(parseInt(String(limit), 10) || 0, 100) : undefined
    const skip = offset ? Math.max(parseInt(String(offset), 10) || 0, 0) : undefined

    const appointments = await prisma.appointment.findMany({
      where,
      take,
      skip,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
      },
      orderBy: { startTime: 'asc' },
    })
    res.json(appointments)
  } catch (e) {
    next(e)
  }
})

// Get appointment by ID
appointmentsRouter.get('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true, email: true } },
      },
    })
    if (!appointment || appointment.tenantId !== tenantId) {
      return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })
    }
    res.json(appointment)
  } catch (e) {
    next(e)
  }
})

// Create appointment
appointmentsRouter.post('/', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const parse = appointmentCreateSchema.safeParse(req.body)
    if (!parse.success) return res.status(400).json({ success: false, error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD', details: parse.error.errors } })

    // Verify patient belongs to tenant
    const patient = await prisma.patient.findUnique({ where: { id: parse.data.patientId } })
    if (!patient || patient.tenantId !== tenantId) {
      return res.status(400).json({ success: false, error: { message: 'Invalid patient', code: 'INVALID_PATIENT' } })
    }

    // Verify doctor belongs to tenant
    const doctor = await prisma.doctor.findUnique({ where: { id: parse.data.doctorId } })
    if (!doctor || doctor.tenantId !== tenantId) {
      return res.status(400).json({ success: false, error: { message: 'Invalid doctor', code: 'INVALID_DOCTOR' } })
    }

    const data = {
      ...parse.data,
      tenantId,
      startTime: new Date(parse.data.startTime),
      endTime: new Date(parse.data.endTime),
    }

    const appointment = await prisma.appointment.create({
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    res.status(201).json(appointment)
  } catch (e) {
    next(e)
  }
})

// Update appointment
appointmentsRouter.put('/:id', async (req, res, next) => {
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
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        let value = (req.body as any)[key]
        // Convert date strings to Date objects
        if ((key === 'startTime' || key === 'endTime') && typeof value === 'string') {
          value = new Date(value)
        }
        data[key] = value
      }
    }

    // Verify appointment exists and belongs to tenant
    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })

    // If changing patient, verify new patient belongs to tenant
    if (data.patientId) {
      const patient = await prisma.patient.findUnique({ where: { id: data.patientId } })
      if (!patient || patient.tenantId !== tenantId) {
        return res.status(400).json({ success: false, error: { message: 'Invalid patient', code: 'INVALID_PATIENT' } })
      }
    }

    // If changing doctor, verify new doctor belongs to tenant
    if (data.doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } })
      if (!doctor || doctor.tenantId !== tenantId) {
        return res.status(400).json({ success: false, error: { message: 'Invalid doctor', code: 'INVALID_DOCTOR' } })
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    res.json(appointment)
  } catch (e) {
    next(e)
  }
})

// Soft delete appointment
appointmentsRouter.delete('/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) return res.status(401).json({ success: false, error: { message: 'Missing tenant header', code: 'UNAUTHENTICATED' } })

    const { id } = req.params
    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } })

    const appointment = await prisma.appointment.update({ where: { id }, data: { isActive: false, status: 'CANCELLED' } })
    res.json(appointment)
  } catch (e) {
    next(e)
  }
})

export { appointmentsRouter }
