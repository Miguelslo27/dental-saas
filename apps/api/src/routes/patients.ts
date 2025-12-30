import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const patientsRouter = Router()

// List patients (optional tenantId query)
patientsRouter.get('/', async (req, res, next) => {
  try {
    const { tenantId } = req.query
    const where: any = {}
    if (tenantId) where.tenantId = String(tenantId)
    const patients = await prisma.patient.findMany({ where })
    res.json(patients)
  } catch (e) {
    next(e)
  }
})

patientsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const patient = await prisma.patient.findUnique({ where: { id } })
    if (!patient) return res.status(404).json({ error: 'Not found' })
    res.json(patient)
  } catch (e) {
    next(e)
  }
})

patientsRouter.post('/', async (req, res, next) => {
  try {
    const payload = req.body
    const patient = await prisma.patient.create({ data: payload })
    res.status(201).json(patient)
  } catch (e) {
    next(e)
  }
})

patientsRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const payload = req.body
    const patient = await prisma.patient.update({ where: { id }, data: payload })
    res.json(patient)
  } catch (e) {
    next(e)
  }
})

patientsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    // Soft delete
    const patient = await prisma.patient.update({ where: { id }, data: { isActive: false } })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

export { patientsRouter }
