import { prisma, Prisma } from '@dental/database'
import { logger } from '../utils/logger.js'

// Fields to include in payment responses
const PAYMENT_SELECT = {
  id: true,
  tenantId: true,
  patientId: true,
  amount: true,
  date: true,
  note: true,
  createdBy: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

export type SafePayment = {
  id: string
  tenantId: string
  patientId: string
  amount: Prisma.Decimal
  date: Date
  note: string | null
  createdBy: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type PaymentErrorCode =
  | 'NOT_FOUND'
  | 'PATIENT_NOT_FOUND'
  | 'ALREADY_INACTIVE'
  | 'EXCEEDS_BALANCE'

export interface CreatePaymentInput {
  amount: number
  date: Date
  note?: string
  createdBy?: string
}

export interface ListPaymentsOptions {
  limit?: number
  offset?: number
}

/**
 * Billable item (appointment or labwork) used for FIFO allocation
 */
interface BillableItem {
  id: string
  type: 'appointment' | 'labwork'
  cost: number
  date: Date
  isPaid: boolean
}

/**
 * Get all billable items for a patient, ordered by date ASC (for FIFO)
 */
async function getBillableItems(tenantId: string, patientId: string): Promise<BillableItem[]> {
  const [appointments, labworks] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId, patientId, isActive: true, cost: { not: null } },
      select: { id: true, cost: true, startTime: true, isPaid: true },
      orderBy: { startTime: 'asc' },
    }),
    prisma.labwork.findMany({
      where: { tenantId, patientId, isActive: true, price: { gt: 0 } },
      select: { id: true, price: true, date: true, isPaid: true },
      orderBy: { date: 'asc' },
    }),
  ])

  const items: BillableItem[] = [
    ...appointments
      .filter((a) => a.cost && a.cost.toNumber() > 0)
      .map((a) => ({
        id: a.id,
        type: 'appointment' as const,
        cost: a.cost!.toNumber(),
        date: a.startTime,
        isPaid: a.isPaid,
      })),
    ...labworks.map((l) => ({
      id: l.id,
      type: 'labwork' as const,
      cost: l.price.toNumber(),
      date: l.date,
      isPaid: l.isPaid,
    })),
  ]

  // Sort by date ASC for FIFO
  items.sort((a, b) => a.date.getTime() - b.date.getTime())

  return items
}

/**
 * Recalculate isPaid status for all billable items of a patient using FIFO allocation.
 * Total active payments are distributed to items oldest-first.
 */
export async function recalculatePaidStatus(tenantId: string, patientId: string): Promise<void> {
  const [items, paymentsAggregate] = await Promise.all([
    getBillableItems(tenantId, patientId),
    prisma.patientPayment.aggregate({
      where: { tenantId, patientId, isActive: true },
      _sum: { amount: true },
    }),
  ])

  const totalPaid = paymentsAggregate._sum.amount?.toNumber() || 0
  let remaining = totalPaid

  const appointmentUpdates: { id: string; isPaid: boolean }[] = []
  const labworkUpdates: { id: string; isPaid: boolean }[] = []

  for (const item of items) {
    const shouldBePaid = remaining >= item.cost
    if (shouldBePaid) {
      remaining -= item.cost
    }

    // Only update if status changed
    if (item.isPaid !== shouldBePaid) {
      if (item.type === 'appointment') {
        appointmentUpdates.push({ id: item.id, isPaid: shouldBePaid })
      } else {
        labworkUpdates.push({ id: item.id, isPaid: shouldBePaid })
      }
    }
  }

  // Batch updates
  const updates: Prisma.PrismaPromise<unknown>[] = []
  for (const u of appointmentUpdates) {
    updates.push(prisma.appointment.update({ where: { id: u.id }, data: { isPaid: u.isPaid } }))
  }
  for (const u of labworkUpdates) {
    updates.push(prisma.labwork.update({ where: { id: u.id }, data: { isPaid: u.isPaid } }))
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates)
    logger.info(
      { tenantId, patientId, updatedItems: updates.length },
      'Recalculated paid status for billable items'
    )
  }
}

/**
 * Get patient balance: total debt, total paid, outstanding
 */
export async function getPatientBalance(
  tenantId: string,
  patientId: string
): Promise<
  | { success: true; data: { totalDebt: number; totalPaid: number; outstanding: number } }
  | { success: false; code: PaymentErrorCode }
> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId },
    select: { id: true },
  })

  if (!patient) {
    return { success: false, code: 'PATIENT_NOT_FOUND' }
  }

  const [appointmentsAgg, labworksAgg, paymentsAgg] = await Promise.all([
    prisma.appointment.aggregate({
      where: { tenantId, patientId, isActive: true, cost: { not: null, gt: 0 } },
      _sum: { cost: true },
    }),
    prisma.labwork.aggregate({
      where: { tenantId, patientId, isActive: true, price: { gt: 0 } },
      _sum: { price: true },
    }),
    prisma.patientPayment.aggregate({
      where: { tenantId, patientId, isActive: true },
      _sum: { amount: true },
    }),
  ])

  const totalDebt =
    (appointmentsAgg._sum.cost?.toNumber() || 0) + (labworksAgg._sum.price?.toNumber() || 0)
  const totalPaid = paymentsAgg._sum.amount?.toNumber() || 0
  const outstanding = Math.max(0, totalDebt - totalPaid)

  return { success: true, data: { totalDebt, totalPaid, outstanding } }
}

/**
 * Create a new payment and recalculate FIFO allocation
 */
export async function createPayment(
  tenantId: string,
  patientId: string,
  input: CreatePaymentInput
): Promise<{ success: true; data: SafePayment } | { success: false; code: PaymentErrorCode }> {
  // Verify patient exists
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId },
    select: { id: true },
  })

  if (!patient) {
    return { success: false, code: 'PATIENT_NOT_FOUND' }
  }

  // Check balance
  const balanceResult = await getPatientBalance(tenantId, patientId)
  if (!balanceResult.success) {
    return { success: false, code: balanceResult.code }
  }

  if (input.amount > balanceResult.data.outstanding) {
    return { success: false, code: 'EXCEEDS_BALANCE' }
  }

  // Create payment
  const payment = await prisma.patientPayment.create({
    data: {
      tenantId,
      patientId,
      amount: input.amount,
      date: input.date,
      note: input.note || null,
      createdBy: input.createdBy || null,
    },
    select: PAYMENT_SELECT,
  })

  // Recalculate FIFO
  await recalculatePaidStatus(tenantId, patientId)

  logger.info({ paymentId: payment.id, tenantId, patientId, amount: input.amount }, 'Payment created')

  return { success: true, data: payment }
}

/**
 * List payments for a patient
 */
export async function listPayments(
  tenantId: string,
  patientId: string,
  options?: ListPaymentsOptions
): Promise<{ data: SafePayment[]; total: number }> {
  const where: Prisma.PatientPaymentWhereInput = {
    tenantId,
    patientId,
    isActive: true,
  }

  const [payments, total] = await Promise.all([
    prisma.patientPayment.findMany({
      where,
      select: PAYMENT_SELECT,
      orderBy: { date: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.patientPayment.count({ where }),
  ])

  return { data: payments, total }
}

/**
 * Soft delete a payment and recalculate FIFO allocation
 */
export async function deletePayment(
  tenantId: string,
  paymentId: string
): Promise<{ success: true; data: SafePayment } | { success: false; code: PaymentErrorCode }> {
  const payment = await prisma.patientPayment.findFirst({
    where: { id: paymentId, tenantId },
    select: { id: true, patientId: true, isActive: true },
  })

  if (!payment) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!payment.isActive) {
    return { success: false, code: 'ALREADY_INACTIVE' }
  }

  const updated = await prisma.patientPayment.update({
    where: { id: paymentId },
    data: { isActive: false },
    select: PAYMENT_SELECT,
  })

  // Recalculate FIFO after removing payment
  await recalculatePaidStatus(tenantId, payment.patientId)

  logger.info({ paymentId, tenantId, patientId: payment.patientId }, 'Payment soft deleted')

  return { success: true, data: updated }
}
