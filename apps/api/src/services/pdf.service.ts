import ReactPDF from '@react-pdf/renderer'
import React from 'react'
import { prisma, AppointmentStatus } from '@dental/database'
import { logger } from '../utils/logger.js'

// Re-export types for templates to use
export { AppointmentStatus }

/**
 * Tenant info for PDF header
 */
export interface TenantInfo {
  name: string
  email: string | null
  phone: string | null
  address: string | null
  logo: string | null
  timezone: string
  currency: string
  language: string
}

/**
 * Doctor info for PDFs
 */
export interface DoctorInfo {
  id: string
  firstName: string
  lastName: string
  specialty: string | null
  licenseNumber: string | null
}

/**
 * Patient info for PDFs
 */
export interface PatientInfo {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dob: Date | null
  gender: string | null
  address: string | null
}

/**
 * Appointment info for PDFs
 */
export interface AppointmentInfo {
  id: string
  startTime: Date
  endTime: Date
  duration: number
  status: AppointmentStatus
  type: string | null
  notes: string | null
  cost: string | null // Formatted as string for display
  isPaid: boolean
}

/**
 * Data for appointment receipt PDF
 */
export interface AppointmentReceiptData {
  tenant: TenantInfo
  patient: PatientInfo
  doctor: DoctorInfo
  appointment: AppointmentInfo
  generatedAt: Date
}

/**
 * Appointment summary for history PDF
 */
export interface AppointmentSummary {
  id: string
  date: Date
  type: string | null
  status: AppointmentStatus
  doctorName: string
  notes: string | null
  cost: string | null
  isPaid: boolean
}

/**
 * Data for patient history PDF
 */
export interface PatientHistoryData {
  tenant: TenantInfo
  patient: PatientInfo
  appointments: AppointmentSummary[]
  teethNotes: Record<string, string> | null
  generatedAt: Date
}

export type PdfErrorCode = 'NOT_FOUND' | 'INVALID_TENANT'

export const PdfService = {
  /**
   * Generate PDF buffer from a React PDF document
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generatePdf(document: React.ReactElement<any>): Promise<Buffer> {
    try {
      // renderToBuffer returns a NodeJS.ReadableStream, we need to collect it
      const pdfStream = await ReactPDF.renderToStream(document)
      const chunks: Buffer[] = []

      return new Promise((resolve, reject) => {
        pdfStream.on('data', (chunk: Buffer) => chunks.push(chunk))
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)))
        pdfStream.on('error', reject)
      })
    } catch (err) {
      logger.error({ err }, 'Failed to generate PDF')
      throw err
    }
  },

  /**
   * Get tenant info for PDF header
   */
  async getTenantInfo(tenantId: string): Promise<TenantInfo | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        logo: true,
        timezone: true,
        currency: true,
        settings: {
          select: {
            language: true,
          },
        },
      },
    })

    if (!tenant) return null

    return {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      logo: tenant.logo,
      timezone: tenant.timezone,
      currency: tenant.currency,
      language: tenant.settings?.language || 'es',
    }
  },

  /**
   * Get appointment with all related data for receipt PDF
   */
  async getAppointmentReceiptData(
    tenantId: string,
    appointmentId: string
  ): Promise<{ data: AppointmentReceiptData } | { error: PdfErrorCode; message: string }> {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        tenantId,
        isActive: true,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dob: true,
            gender: true,
            address: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            licenseNumber: true,
          },
        },
      },
    })

    if (!appointment) {
      return { error: 'NOT_FOUND', message: 'Appointment not found' }
    }

    const tenant = await this.getTenantInfo(tenantId)
    if (!tenant) {
      return { error: 'INVALID_TENANT', message: 'Tenant not found' }
    }

    return {
      data: {
        tenant,
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment: {
          id: appointment.id,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
          status: appointment.status,
          type: appointment.type,
          notes: appointment.notes,
          cost: appointment.cost?.toString() ?? null,
          isPaid: appointment.isPaid,
        },
        generatedAt: new Date(),
      },
    }
  },

  /**
   * Get patient with appointment history for history PDF
   */
  async getPatientHistoryData(
    tenantId: string,
    patientId: string
  ): Promise<{ data: PatientHistoryData } | { error: PdfErrorCode; message: string }> {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dob: true,
        gender: true,
        address: true,
        teeth: true,
      },
    })

    if (!patient) {
      return { error: 'NOT_FOUND', message: 'Patient not found' }
    }

    const tenant = await this.getTenantInfo(tenantId)
    if (!tenant) {
      return { error: 'INVALID_TENANT', message: 'Tenant not found' }
    }

    // Get appointments for this patient, ordered by date desc
    // Limit to 100 to prevent performance issues (PDF only displays 25)
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        tenantId,
        isActive: true,
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 100,
    })

    const appointmentSummaries: AppointmentSummary[] = appointments.map((apt) => ({
      id: apt.id,
      date: apt.startTime,
      type: apt.type,
      status: apt.status,
      doctorName: `${apt.doctor.firstName} ${apt.doctor.lastName}`,
      notes: apt.notes,
      cost: apt.cost?.toString() ?? null,
      isPaid: apt.isPaid,
    }))

    // Parse teeth notes if available
    let teethNotes: Record<string, string> | null = null
    if (patient.teeth && typeof patient.teeth === 'object' && !Array.isArray(patient.teeth)) {
      teethNotes = patient.teeth as Record<string, string>
    }

    return {
      data: {
        tenant,
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
        },
        appointments: appointmentSummaries,
        teethNotes,
        generatedAt: new Date(),
      },
    }
  },
}
