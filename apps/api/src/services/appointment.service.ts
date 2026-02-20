import { prisma, Prisma, AppointmentStatus } from '@dental/database'
import { logger } from '../utils/logger.js'
import { createPayment } from './payment.service.js'

// Fields to include in appointment responses
const APPOINTMENT_SELECT = {
  id: true,
  tenantId: true,
  patientId: true,
  doctorId: true,
  startTime: true,
  endTime: true,
  duration: true,
  status: true,
  type: true,
  notes: true,
  privateNotes: true,
  cost: true,
  isPaid: true,
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

const DOCTOR_INCLUDE = {
  id: true,
  firstName: true,
  lastName: true,
  specialty: true,
  email: true,
} as const

export type SafeAppointment = {
  id: string
  tenantId: string
  patientId: string
  doctorId: string
  startTime: Date
  endTime: Date
  duration: number
  status: AppointmentStatus
  type: string | null
  notes: string | null
  privateNotes: string | null
  cost: Prisma.Decimal | null
  isPaid: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialty: string | null
    email: string | null
  }
}

export type AppointmentErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_INACTIVE'
  | 'ALREADY_ACTIVE'
  | 'INVALID_PATIENT'
  | 'INVALID_DOCTOR'
  | 'TIME_CONFLICT'
  | 'INVALID_TIME_RANGE'
  | 'PAST_APPOINTMENT'

export interface CreateAppointmentInput {
  patientId: string
  doctorId: string
  startTime: Date
  endTime: Date
  duration?: number
  status?: AppointmentStatus
  type?: string
  notes?: string
  privateNotes?: string
  cost?: number
  isPaid?: boolean
}

export interface UpdateAppointmentInput {
  patientId?: string
  doctorId?: string
  startTime?: Date
  endTime?: Date
  duration?: number
  status?: AppointmentStatus
  type?: string | null
  notes?: string | null
  privateNotes?: string | null
  cost?: number | null
  isPaid?: boolean
}

export interface ListAppointmentsOptions {
  limit?: number
  offset?: number
  includeInactive?: boolean
  doctorId?: string
  patientId?: string
  status?: AppointmentStatus
  from?: Date
  to?: Date
}

export interface CalendarOptions {
  from: Date
  to: Date
  doctorId?: string
  patientId?: string
  includeInactive?: boolean
}

/**
 * Count appointments for a tenant
 */
export async function countAppointments(
  tenantId: string,
  options?: { from?: Date; to?: Date; status?: AppointmentStatus }
): Promise<number> {
  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    isActive: true,
    ...(options?.status && { status: options.status }),
    ...(options?.from && { startTime: { gte: options.from } }),
    ...(options?.to && { startTime: { lte: options.to } }),
  }

  return prisma.appointment.count({ where })
}

/**
 * Verify patient belongs to tenant
 */
export async function verifyPatientBelongsToTenant(
  patientId: string,
  tenantId: string
): Promise<boolean> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { tenantId: true, isActive: true },
  })
  return patient?.tenantId === tenantId && patient?.isActive === true
}

/**
 * Verify doctor belongs to tenant
 */
export async function verifyDoctorBelongsToTenant(
  doctorId: string,
  tenantId: string
): Promise<boolean> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { tenantId: true, isActive: true },
  })
  return doctor?.tenantId === tenantId && doctor?.isActive === true
}

/**
 * Check for time conflicts with existing appointments
 */
export async function checkTimeConflict(
  tenantId: string,
  doctorId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<{ hasConflict: boolean; conflictingAppointment?: SafeAppointment }> {
  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    doctorId,
    isActive: true,
    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    // Check for overlapping time ranges
    AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
  }

  const conflicting = await prisma.appointment.findFirst({
    where,
    select: APPOINTMENT_SELECT,
  })

  if (conflicting) {
    return { hasConflict: true, conflictingAppointment: conflicting as SafeAppointment }
  }

  return { hasConflict: false }
}

/**
 * List all appointments for a tenant
 */
export async function listAppointments(
  tenantId: string,
  options?: ListAppointmentsOptions
): Promise<SafeAppointment[]> {
  const { limit = 50, offset = 0, includeInactive = false, doctorId, patientId, status, from, to } = options || {}

  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    ...(includeInactive ? {} : { isActive: true }),
    ...(doctorId && { doctorId }),
    ...(patientId && { patientId }),
    ...(status && { status }),
    ...(from || to
      ? {
          startTime: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }
      : {}),
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
    take: limit,
    skip: offset,
    orderBy: { startTime: 'asc' },
  })

  return appointments as SafeAppointment[]
}

/**
 * Get appointments for calendar view (optimized for date range queries)
 */
export async function getCalendarAppointments(
  tenantId: string,
  options: CalendarOptions
): Promise<SafeAppointment[]> {
  const { from, to, doctorId, patientId, includeInactive = false } = options

  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    ...(includeInactive ? {} : { isActive: true }),
    ...(doctorId && { doctorId }),
    ...(patientId && { patientId }),
    // Get appointments that overlap with the date range
    AND: [{ startTime: { lt: to } }, { endTime: { gt: from } }],
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
    orderBy: { startTime: 'asc' },
  })

  return appointments as SafeAppointment[]
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(
  tenantId: string,
  id: string
): Promise<SafeAppointment | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
  })

  if (!appointment || appointment.tenantId !== tenantId) {
    return null
  }

  return appointment as SafeAppointment
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  tenantId: string,
  data: CreateAppointmentInput
): Promise<{ appointment?: SafeAppointment; error?: { code: AppointmentErrorCode; message: string } }> {
  // Validate time range
  if (data.startTime >= data.endTime) {
    return {
      error: { code: 'INVALID_TIME_RANGE', message: 'End time must be after start time' },
    }
  }

  // Verify patient belongs to tenant
  const patientValid = await verifyPatientBelongsToTenant(data.patientId, tenantId)
  if (!patientValid) {
    return {
      error: { code: 'INVALID_PATIENT', message: 'Patient not found or does not belong to this clinic' },
    }
  }

  // Verify doctor belongs to tenant
  const doctorValid = await verifyDoctorBelongsToTenant(data.doctorId, tenantId)
  if (!doctorValid) {
    return {
      error: { code: 'INVALID_DOCTOR', message: 'Doctor not found or does not belong to this clinic' },
    }
  }

  // Check for time conflicts
  const conflict = await checkTimeConflict(tenantId, data.doctorId, data.startTime, data.endTime)
  if (conflict.hasConflict) {
    return {
      error: {
        code: 'TIME_CONFLICT',
        message: `Doctor already has an appointment at this time`,
      },
    }
  }

  // Calculate duration if not provided
  const duration = data.duration ?? Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000)

  const appointment = await prisma.appointment.create({
    data: {
      tenantId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      startTime: data.startTime,
      endTime: data.endTime,
      duration,
      status: data.status ?? 'SCHEDULED',
      type: data.type,
      notes: data.notes,
      privateNotes: data.privateNotes,
      cost: data.cost,
      isPaid: false, // Always false; FIFO payment system is the source of truth
    },
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
  })

  // Auto-create payment if marked as paid with positive cost
  if (data.isPaid && data.cost && data.cost > 0) {
    const paymentResult = await createPayment(tenantId, data.patientId, {
      amount: data.cost,
      date: data.startTime,
      note: 'Pago en consulta',
    })

    if (paymentResult.success) {
      // Re-fetch to get FIFO-updated isPaid
      const updated = await getAppointmentById(tenantId, appointment.id)
      if (updated) {
        logger.info(`Appointment created with auto-payment: ${appointment.id} for tenant ${tenantId}`)
        return { appointment: updated }
      }
    } else {
      logger.warn({ appointmentId: appointment.id, code: paymentResult.code }, 'Auto-payment failed for appointment marked as paid')
    }
  }

  logger.info(`Appointment created: ${appointment.id} for tenant ${tenantId}`)
  return { appointment: appointment as SafeAppointment }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  tenantId: string,
  id: string,
  data: UpdateAppointmentInput
): Promise<{ appointment?: SafeAppointment; error?: { code: AppointmentErrorCode; message: string } }> {
  // Get existing appointment
  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { tenantId: true, doctorId: true, startTime: true, endTime: true },
  })

  if (!existing || existing.tenantId !== tenantId) {
    return { error: { code: 'NOT_FOUND', message: 'Appointment not found' } }
  }

  // Validate time range if both provided
  const newStartTime = data.startTime ?? existing.startTime
  const newEndTime = data.endTime ?? existing.endTime
  if (newStartTime >= newEndTime) {
    return {
      error: { code: 'INVALID_TIME_RANGE', message: 'End time must be after start time' },
    }
  }

  // Verify patient if changing
  if (data.patientId) {
    const patientValid = await verifyPatientBelongsToTenant(data.patientId, tenantId)
    if (!patientValid) {
      return {
        error: { code: 'INVALID_PATIENT', message: 'Patient not found or does not belong to this clinic' },
      }
    }
  }

  // Verify doctor if changing
  const doctorId = data.doctorId ?? existing.doctorId
  if (data.doctorId) {
    const doctorValid = await verifyDoctorBelongsToTenant(data.doctorId, tenantId)
    if (!doctorValid) {
      return {
        error: { code: 'INVALID_DOCTOR', message: 'Doctor not found or does not belong to this clinic' },
      }
    }
  }

  // Check for time conflicts if time or doctor changed
  if (data.startTime || data.endTime || data.doctorId) {
    const conflict = await checkTimeConflict(tenantId, doctorId, newStartTime, newEndTime, id)
    if (conflict.hasConflict) {
      return {
        error: {
          code: 'TIME_CONFLICT',
          message: 'Doctor already has an appointment at this time',
        },
      }
    }
  }

  // Build update data, handling null values properly
  const updateData: Prisma.AppointmentUpdateInput = {}

  if (data.patientId !== undefined) updateData.patient = { connect: { id: data.patientId } }
  if (data.doctorId !== undefined) updateData.doctor = { connect: { id: data.doctorId } }
  if (data.startTime !== undefined) updateData.startTime = data.startTime
  if (data.endTime !== undefined) updateData.endTime = data.endTime
  if (data.duration !== undefined) updateData.duration = data.duration
  if (data.status !== undefined) updateData.status = data.status
  if (data.type !== undefined) updateData.type = data.type
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.privateNotes !== undefined) updateData.privateNotes = data.privateNotes
  if (data.cost !== undefined) updateData.cost = data.cost
  // isPaid is FIFO-controlled via PatientPayment records; not directly writable

  // Recalculate duration if time changed
  if ((data.startTime || data.endTime) && data.duration === undefined) {
    updateData.duration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / 60000)
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
  })

  logger.info(`Appointment updated: ${id}`)
  return { appointment: appointment as SafeAppointment }
}

/**
 * Soft delete an appointment
 */
export async function deleteAppointment(
  tenantId: string,
  id: string
): Promise<{ appointment?: SafeAppointment; error?: { code: AppointmentErrorCode; message: string } }> {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { tenantId: true, isActive: true },
  })

  if (!existing || existing.tenantId !== tenantId) {
    return { error: { code: 'NOT_FOUND', message: 'Appointment not found' } }
  }

  if (!existing.isActive) {
    return { error: { code: 'ALREADY_INACTIVE', message: 'Appointment is already deleted' } }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { isActive: false, status: 'CANCELLED' },
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
  })

  logger.info(`Appointment soft-deleted: ${id}`)
  return { appointment: appointment as SafeAppointment }
}

/**
 * Restore a soft-deleted appointment
 */
export async function restoreAppointment(
  tenantId: string,
  id: string
): Promise<{ appointment?: SafeAppointment; error?: { code: AppointmentErrorCode; message: string } }> {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { tenantId: true, isActive: true, doctorId: true, startTime: true, endTime: true },
  })

  if (!existing || existing.tenantId !== tenantId) {
    return { error: { code: 'NOT_FOUND', message: 'Appointment not found' } }
  }

  if (existing.isActive) {
    return { error: { code: 'ALREADY_ACTIVE', message: 'Appointment is already active' } }
  }

  // Check for time conflicts before restoring
  const conflict = await checkTimeConflict(tenantId, existing.doctorId, existing.startTime, existing.endTime, id)
  if (conflict.hasConflict) {
    return {
      error: {
        code: 'TIME_CONFLICT',
        message: 'Cannot restore: Doctor already has an appointment at this time',
      },
    }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { isActive: true, status: 'SCHEDULED' },
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
  })

  logger.info(`Appointment restored: ${id}`)
  return { appointment: appointment as SafeAppointment }
}

/**
 * Mark an appointment as completed
 */
export async function markAppointmentDone(
  tenantId: string,
  id: string,
  notes?: string
): Promise<{ appointment?: SafeAppointment; error?: { code: AppointmentErrorCode; message: string } }> {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { tenantId: true, isActive: true, status: true },
  })

  if (!existing || existing.tenantId !== tenantId) {
    return { error: { code: 'NOT_FOUND', message: 'Appointment not found' } }
  }

  if (!existing.isActive) {
    return { error: { code: 'ALREADY_INACTIVE', message: 'Cannot complete a deleted appointment' } }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      ...(notes && { notes }),
    },
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
  })

  logger.info(`Appointment marked as done: ${id}`)
  return { appointment: appointment as SafeAppointment }
}

/**
 * Get appointment statistics for a tenant
 */
export async function getAppointmentStats(
  tenantId: string,
  options?: { from?: Date; to?: Date; doctorId?: string }
): Promise<{
  total: number
  scheduled: number
  completed: number
  cancelled: number
  noShow: number
  todayCount: number
  weekCount: number
  revenue: number
  pendingPayment: number
}> {
  const { from, to, doctorId } = options || {}

  const baseWhere: Prisma.AppointmentWhereInput = {
    tenantId,
    isActive: true,
    ...(doctorId && { doctorId }),
    ...(from && { startTime: { gte: from } }),
    ...(to && { startTime: { lte: to } }),
  }

  // Get counts by status
  const [total, scheduled, completed, cancelled, noShow] = await Promise.all([
    prisma.appointment.count({ where: baseWhere }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'SCHEDULED' } }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'NO_SHOW' } }),
  ])

  // Today and week counts
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000)
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [todayCount, weekCount] = await Promise.all([
    prisma.appointment.count({
      where: {
        tenantId,
        isActive: true,
        ...(doctorId && { doctorId }),
        startTime: { gte: todayStart, lt: todayEnd },
      },
    }),
    prisma.appointment.count({
      where: {
        tenantId,
        isActive: true,
        ...(doctorId && { doctorId }),
        startTime: { gte: weekStart, lt: weekEnd },
      },
    }),
  ])

  // Revenue calculations
  const revenueResult = await prisma.appointment.aggregate({
    where: { ...baseWhere, isPaid: true, cost: { not: null } },
    _sum: { cost: true },
  })

  const pendingResult = await prisma.appointment.aggregate({
    where: { ...baseWhere, isPaid: false, cost: { not: null }, status: 'COMPLETED' },
    _sum: { cost: true },
  })

  return {
    total,
    scheduled,
    completed,
    cancelled,
    noShow,
    todayCount,
    weekCount,
    revenue: revenueResult._sum.cost?.toNumber() ?? 0,
    pendingPayment: pendingResult._sum.cost?.toNumber() ?? 0,
  }
}

/**
 * Get appointments by doctor
 */
export async function getAppointmentsByDoctor(
  tenantId: string,
  doctorId: string,
  options?: { from?: Date; to?: Date; limit?: number }
): Promise<SafeAppointment[]> {
  const { from, to, limit = 50 } = options || {}

  // Verify doctor belongs to tenant
  const doctorValid = await verifyDoctorBelongsToTenant(doctorId, tenantId)
  if (!doctorValid) {
    return []
  }

  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    doctorId,
    isActive: true,
    ...(from || to
      ? {
          startTime: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }
      : {}),
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
    take: limit,
    orderBy: { startTime: 'asc' },
  })

  return appointments as SafeAppointment[]
}

/**
 * Get appointments by patient
 */
export async function getAppointmentsByPatient(
  tenantId: string,
  patientId: string,
  options?: { limit?: number; includeInactive?: boolean }
): Promise<SafeAppointment[]> {
  const { limit = 50, includeInactive = false } = options || {}

  // Verify patient belongs to tenant
  const patientValid = await verifyPatientBelongsToTenant(patientId, tenantId)
  if (!patientValid) {
    return []
  }

  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    patientId,
    ...(includeInactive ? {} : { isActive: true }),
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      ...APPOINTMENT_SELECT,
      patient: { select: PATIENT_INCLUDE },
      doctor: { select: DOCTOR_INCLUDE },
    },
    take: limit,
    orderBy: { startTime: 'desc' },
  })

  return appointments as SafeAppointment[]
}
