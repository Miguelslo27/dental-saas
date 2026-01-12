import { prisma, Prisma } from '@dental/database'
import { logger } from '../utils/logger.js'

// Fields to include in labwork responses
const LABWORK_SELECT = {
  id: true,
  tenantId: true,
  patientId: true,
  lab: true,
  phoneNumber: true,
  date: true,
  note: true,
  price: true,
  isPaid: true,
  isDelivered: true,
  doctorIds: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

const PATIENT_INCLUDE = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
} as const

export type SafeLabwork = {
  id: string
  tenantId: string
  patientId: string | null
  lab: string
  phoneNumber: string | null
  date: Date
  note: string | null
  price: Prisma.Decimal
  isPaid: boolean
  isDelivered: boolean
  doctorIds: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  } | null
}

export type LabworkErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_INACTIVE'
  | 'ALREADY_ACTIVE'
  | 'INVALID_PATIENT'

export interface CreateLabworkInput {
  patientId?: string
  lab: string
  phoneNumber?: string
  date: Date
  note?: string
  price?: number
  isPaid?: boolean
  isDelivered?: boolean
  doctorIds?: string[]
}

export interface UpdateLabworkInput {
  patientId?: string | null
  lab?: string
  phoneNumber?: string | null
  date?: Date
  note?: string | null
  price?: number
  isPaid?: boolean
  isDelivered?: boolean
  doctorIds?: string[]
}

export interface ListLabworksOptions {
  limit?: number
  offset?: number
  includeInactive?: boolean
  patientId?: string
  isPaid?: boolean
  isDelivered?: boolean
  from?: Date
  to?: Date
}

/**
 * Transform database labwork to safe response format
 */
function transformLabwork(labwork: {
  id: string
  tenantId: string
  patientId: string | null
  lab: string
  phoneNumber: string | null
  date: Date
  note: string | null
  price: Prisma.Decimal
  isPaid: boolean
  isDelivered: boolean
  doctorIds: Prisma.JsonValue
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  } | null
}): SafeLabwork {
  return {
    ...labwork,
    doctorIds: Array.isArray(labwork.doctorIds) ? labwork.doctorIds as string[] : [],
  }
}

/**
 * Count labworks for a tenant
 */
export async function countLabworks(
  tenantId: string,
  options?: { from?: Date; to?: Date; isPaid?: boolean; isDelivered?: boolean }
): Promise<number> {
  const where: Prisma.LabworkWhereInput = {
    tenantId,
    isActive: true,
    ...(options?.isPaid !== undefined && { isPaid: options.isPaid }),
    ...(options?.isDelivered !== undefined && { isDelivered: options.isDelivered }),
    ...(options?.from && { date: { gte: options.from } }),
    ...(options?.to && { date: { lte: options.to } }),
  }

  return prisma.labwork.count({ where })
}

/**
 * Verify patient belongs to tenant
 */
async function verifyPatient(
  patientId: string,
  tenantId: string
): Promise<{ success: true } | { success: false; code: LabworkErrorCode }> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId, isActive: true },
    select: { id: true },
  })

  if (!patient) {
    return { success: false, code: 'INVALID_PATIENT' }
  }

  return { success: true }
}

/**
 * Create a new labwork
 */
export async function createLabwork(
  tenantId: string,
  input: CreateLabworkInput
): Promise<{ success: true; data: SafeLabwork } | { success: false; code: LabworkErrorCode }> {
  // Validate patient if provided
  if (input.patientId) {
    const patientCheck = await verifyPatient(input.patientId, tenantId)
    if (!patientCheck.success) {
      return patientCheck
    }
  }

  const labwork = await prisma.labwork.create({
    data: {
      tenantId,
      patientId: input.patientId || null,
      lab: input.lab,
      phoneNumber: input.phoneNumber || null,
      date: input.date,
      note: input.note || null,
      price: input.price || 0,
      isPaid: input.isPaid || false,
      isDelivered: input.isDelivered || false,
      doctorIds: input.doctorIds || [],
    },
    select: {
      ...LABWORK_SELECT,
      patient: { select: PATIENT_INCLUDE },
    },
  })

  logger.info({ labworkId: labwork.id, tenantId }, 'Labwork created')

  return { success: true, data: transformLabwork(labwork) }
}

/**
 * Get a labwork by ID
 */
export async function getLabworkById(
  tenantId: string,
  labworkId: string
): Promise<{ success: true; data: SafeLabwork } | { success: false; code: LabworkErrorCode }> {
  const labwork = await prisma.labwork.findFirst({
    where: { id: labworkId, tenantId },
    select: {
      ...LABWORK_SELECT,
      patient: { select: PATIENT_INCLUDE },
    },
  })

  if (!labwork) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true, data: transformLabwork(labwork) }
}

/**
 * List labworks for a tenant
 */
export async function listLabworks(
  tenantId: string,
  options?: ListLabworksOptions
): Promise<{ data: SafeLabwork[]; total: number }> {
  const where: Prisma.LabworkWhereInput = {
    tenantId,
    ...(options?.includeInactive ? {} : { isActive: true }),
    ...(options?.patientId && { patientId: options.patientId }),
    ...(options?.isPaid !== undefined && { isPaid: options.isPaid }),
    ...(options?.isDelivered !== undefined && { isDelivered: options.isDelivered }),
    ...(options?.from && { date: { gte: options.from } }),
    ...(options?.to && { date: { lte: options.to } }),
  }

  const [labworks, total] = await Promise.all([
    prisma.labwork.findMany({
      where,
      select: {
        ...LABWORK_SELECT,
        patient: { select: PATIENT_INCLUDE },
      },
      orderBy: { date: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.labwork.count({ where }),
  ])

  return {
    data: labworks.map(transformLabwork),
    total,
  }
}

/**
 * Update a labwork
 */
export async function updateLabwork(
  tenantId: string,
  labworkId: string,
  input: UpdateLabworkInput
): Promise<{ success: true; data: SafeLabwork } | { success: false; code: LabworkErrorCode }> {
  // Check labwork exists
  const existing = await prisma.labwork.findFirst({
    where: { id: labworkId, tenantId },
    select: { id: true },
  })

  if (!existing) {
    return { success: false, code: 'NOT_FOUND' }
  }

  // Validate patient if being updated
  if (input.patientId) {
    const patientCheck = await verifyPatient(input.patientId, tenantId)
    if (!patientCheck.success) {
      return patientCheck
    }
  }

  const labwork = await prisma.labwork.update({
    where: { id: labworkId },
    data: {
      ...(input.patientId !== undefined && { patientId: input.patientId }),
      ...(input.lab && { lab: input.lab }),
      ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
      ...(input.date && { date: input.date }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.isPaid !== undefined && { isPaid: input.isPaid }),
      ...(input.isDelivered !== undefined && { isDelivered: input.isDelivered }),
      ...(input.doctorIds && { doctorIds: input.doctorIds }),
    },
    select: {
      ...LABWORK_SELECT,
      patient: { select: PATIENT_INCLUDE },
    },
  })

  logger.info({ labworkId, tenantId }, 'Labwork updated')

  return { success: true, data: transformLabwork(labwork) }
}

/**
 * Soft delete a labwork
 */
export async function deleteLabwork(
  tenantId: string,
  labworkId: string
): Promise<{ success: true; data: SafeLabwork } | { success: false; code: LabworkErrorCode }> {
  const labwork = await prisma.labwork.findFirst({
    where: { id: labworkId, tenantId },
    select: { id: true, isActive: true },
  })

  if (!labwork) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!labwork.isActive) {
    return { success: false, code: 'ALREADY_INACTIVE' }
  }

  const updated = await prisma.labwork.update({
    where: { id: labworkId },
    data: { isActive: false },
    select: {
      ...LABWORK_SELECT,
      patient: { select: PATIENT_INCLUDE },
    },
  })

  logger.info({ labworkId, tenantId }, 'Labwork soft deleted')

  return { success: true, data: transformLabwork(updated) }
}

/**
 * Restore a soft-deleted labwork
 */
export async function restoreLabwork(
  tenantId: string,
  labworkId: string
): Promise<{ success: true; data: SafeLabwork } | { success: false; code: LabworkErrorCode }> {
  const labwork = await prisma.labwork.findFirst({
    where: { id: labworkId, tenantId },
    select: { id: true, isActive: true },
  })

  if (!labwork) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (labwork.isActive) {
    return { success: false, code: 'ALREADY_ACTIVE' }
  }

  const updated = await prisma.labwork.update({
    where: { id: labworkId },
    data: { isActive: true },
    select: {
      ...LABWORK_SELECT,
      patient: { select: PATIENT_INCLUDE },
    },
  })

  logger.info({ labworkId, tenantId }, 'Labwork restored')

  return { success: true, data: transformLabwork(updated) }
}

/**
 * Get labwork statistics for a tenant
 */
export async function getLabworkStats(
  tenantId: string,
  options?: { from?: Date; to?: Date }
): Promise<{
  total: number
  paid: number
  unpaid: number
  delivered: number
  pending: number
  totalValue: number
  paidValue: number
  unpaidValue: number
}> {
  const where: Prisma.LabworkWhereInput = {
    tenantId,
    isActive: true,
    ...(options?.from && { date: { gte: options.from } }),
    ...(options?.to && { date: { lte: options.to } }),
  }

  const [total, paid, delivered, aggregate, paidAggregate] = await Promise.all([
    prisma.labwork.count({ where }),
    prisma.labwork.count({ where: { ...where, isPaid: true } }),
    prisma.labwork.count({ where: { ...where, isDelivered: true } }),
    prisma.labwork.aggregate({
      where,
      _sum: { price: true },
    }),
    prisma.labwork.aggregate({
      where: { ...where, isPaid: true },
      _sum: { price: true },
    }),
  ])

  const totalValue = aggregate._sum.price?.toNumber() || 0
  const paidValue = paidAggregate._sum.price?.toNumber() || 0

  return {
    total,
    paid,
    unpaid: total - paid,
    delivered,
    pending: total - delivered,
    totalValue,
    paidValue,
    unpaidValue: totalValue - paidValue,
  }
}
