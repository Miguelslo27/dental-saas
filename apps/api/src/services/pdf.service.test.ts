import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { Document, Page, Text } from '@react-pdf/renderer'
import { PdfService } from './pdf.service.js'
import type {
  AppointmentReceiptData,
  PatientHistoryData,
  TenantInfo,
  PatientInfo,
  DoctorInfo,
  AppointmentInfo,
  AppointmentSummary,
} from './pdf.service.js'

// Mock prisma to avoid database dependency
vi.mock('@dental/database', () => ({
  prisma: {
    tenant: {
      findUnique: vi.fn(),
    },
    appointment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    patient: {
      findFirst: vi.fn(),
    },
  },
  AppointmentStatus: {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
    RESCHEDULED: 'RESCHEDULED',
  },
}))

// Helper to create mock data
function createMockTenantInfo(overrides: Partial<TenantInfo> = {}): TenantInfo {
  return {
    name: 'Test Clinic',
    email: 'clinic@test.com',
    phone: '+1234567890',
    address: '123 Test Street',
    logo: null,
    timezone: 'America/New_York',
    currency: 'USD',
    ...overrides,
  }
}

function createMockPatientInfo(overrides: Partial<PatientInfo> = {}): PatientInfo {
  return {
    id: 'patient-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    phone: '+1234567890',
    dob: new Date('1990-01-15'),
    gender: 'Male',
    address: '456 Patient Lane',
    ...overrides,
  }
}

function createMockDoctorInfo(overrides: Partial<DoctorInfo> = {}): DoctorInfo {
  return {
    id: 'doctor-123',
    firstName: 'Jane',
    lastName: 'Smith',
    specialty: 'General Dentistry',
    licenseNumber: 'DDS-12345',
    ...overrides,
  }
}

function createMockAppointmentInfo(overrides: Partial<AppointmentInfo> = {}): AppointmentInfo {
  return {
    id: 'appointment-123',
    startTime: new Date('2026-01-20T10:00:00Z'),
    endTime: new Date('2026-01-20T10:30:00Z'),
    duration: 30,
    status: 'COMPLETED' as const,
    type: 'Checkup',
    notes: 'Regular dental checkup. All teeth healthy.',
    cost: '150.00',
    isPaid: true,
    ...overrides,
  }
}

function createMockAppointmentSummary(overrides: Partial<AppointmentSummary> = {}): AppointmentSummary {
  return {
    id: 'appointment-123',
    date: new Date('2026-01-20T10:00:00Z'),
    type: 'Checkup',
    status: 'COMPLETED' as const,
    doctorName: 'Dr. Jane Smith',
    notes: 'Regular checkup',
    cost: '150.00',
    isPaid: true,
    ...overrides,
  }
}

function createMockAppointmentReceiptData(
  overrides: Partial<AppointmentReceiptData> = {}
): AppointmentReceiptData {
  return {
    tenant: createMockTenantInfo(),
    patient: createMockPatientInfo(),
    doctor: createMockDoctorInfo(),
    appointment: createMockAppointmentInfo(),
    generatedAt: new Date('2026-01-20T12:00:00Z'),
    ...overrides,
  }
}

function createMockPatientHistoryData(
  overrides: Partial<PatientHistoryData> = {}
): PatientHistoryData {
  return {
    tenant: createMockTenantInfo(),
    patient: createMockPatientInfo(),
    appointments: [
      createMockAppointmentSummary(),
      createMockAppointmentSummary({
        id: 'appointment-456',
        date: new Date('2026-01-10T14:00:00Z'),
        type: 'Cleaning',
        cost: '100.00',
      }),
    ],
    teethNotes: {
      '11': 'Healthy',
      '21': 'Small cavity - monitor',
      '36': 'Filling done 2025',
    },
    generatedAt: new Date('2026-01-20T12:00:00Z'),
    ...overrides,
  }
}

// Simple test document for PDF generation
function SimpleTestDocument() {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4' },
      React.createElement(Text, null, 'Test PDF Document')
    )
  )
}

describe('PdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generatePdf', () => {
    it('should generate a PDF buffer from a React PDF document', async () => {
      const document = SimpleTestDocument()
      const buffer = await PdfService.generatePdf(document)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
      // PDF files start with %PDF-
      expect(buffer.toString('utf8', 0, 5)).toBe('%PDF-')
    })

    it('should generate valid PDF with correct header', async () => {
      const document = SimpleTestDocument()
      const buffer = await PdfService.generatePdf(document)

      // Check PDF header
      const header = buffer.toString('utf8', 0, 8)
      expect(header).toMatch(/^%PDF-\d\.\d/)
    })

    it('should handle complex documents', async () => {
      // Create a more complex document
      const complexDocument = React.createElement(
        Document,
        null,
        React.createElement(
          Page,
          { size: 'A4' },
          React.createElement(Text, null, 'Title'),
          React.createElement(Text, null, 'Paragraph 1'),
          React.createElement(Text, null, 'Paragraph 2')
        )
      )

      const buffer = await PdfService.generatePdf(complexDocument)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('Data types', () => {
    it('should create valid TenantInfo', () => {
      const tenant = createMockTenantInfo()

      expect(tenant.name).toBe('Test Clinic')
      expect(tenant.timezone).toBe('America/New_York')
      expect(tenant.currency).toBe('USD')
    })

    it('should create valid PatientInfo with all fields', () => {
      const patient = createMockPatientInfo()

      expect(patient.firstName).toBe('John')
      expect(patient.lastName).toBe('Doe')
      expect(patient.dob).toBeInstanceOf(Date)
    })

    it('should create valid PatientInfo with null optional fields', () => {
      const patient = createMockPatientInfo({
        email: null,
        phone: null,
        dob: null,
        gender: null,
        address: null,
      })

      expect(patient.email).toBeNull()
      expect(patient.phone).toBeNull()
      expect(patient.dob).toBeNull()
    })

    it('should create valid DoctorInfo', () => {
      const doctor = createMockDoctorInfo()

      expect(doctor.firstName).toBe('Jane')
      expect(doctor.specialty).toBe('General Dentistry')
      expect(doctor.licenseNumber).toBe('DDS-12345')
    })

    it('should create valid AppointmentInfo', () => {
      const appointment = createMockAppointmentInfo()

      expect(appointment.status).toBe('COMPLETED')
      expect(appointment.duration).toBe(30)
      expect(appointment.isPaid).toBe(true)
    })

    it('should create valid AppointmentReceiptData', () => {
      const data = createMockAppointmentReceiptData()

      expect(data.tenant.name).toBe('Test Clinic')
      expect(data.patient.firstName).toBe('John')
      expect(data.doctor.firstName).toBe('Jane')
      expect(data.appointment.status).toBe('COMPLETED')
      expect(data.generatedAt).toBeInstanceOf(Date)
    })

    it('should create valid PatientHistoryData', () => {
      const data = createMockPatientHistoryData()

      expect(data.appointments).toHaveLength(2)
      expect(data.teethNotes).toHaveProperty('11')
      expect(data.teethNotes?.['21']).toBe('Small cavity - monitor')
    })

    it('should handle PatientHistoryData with no teeth notes', () => {
      const data = createMockPatientHistoryData({
        teethNotes: null,
      })

      expect(data.teethNotes).toBeNull()
    })

    it('should handle PatientHistoryData with empty appointments', () => {
      const data = createMockPatientHistoryData({
        appointments: [],
      })

      expect(data.appointments).toHaveLength(0)
    })
  })

  describe('AppointmentReceiptData validation', () => {
    it('should handle unpaid appointment', () => {
      const data = createMockAppointmentReceiptData({
        appointment: createMockAppointmentInfo({
          isPaid: false,
          cost: '200.00',
        }),
      })

      expect(data.appointment.isPaid).toBe(false)
      expect(data.appointment.cost).toBe('200.00')
    })

    it('should handle appointment with no cost', () => {
      const data = createMockAppointmentReceiptData({
        appointment: createMockAppointmentInfo({
          cost: null,
        }),
      })

      expect(data.appointment.cost).toBeNull()
    })

    it('should handle appointment with no notes', () => {
      const data = createMockAppointmentReceiptData({
        appointment: createMockAppointmentInfo({
          notes: null,
          type: null,
        }),
      })

      expect(data.appointment.notes).toBeNull()
      expect(data.appointment.type).toBeNull()
    })

    it('should handle different appointment statuses', () => {
      const statuses = [
        'SCHEDULED',
        'CONFIRMED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
        'RESCHEDULED',
      ] as const

      statuses.forEach((status) => {
        const data = createMockAppointmentReceiptData({
          appointment: createMockAppointmentInfo({ status }),
        })
        expect(data.appointment.status).toBe(status)
      })
    })
  })

  describe('PatientHistoryData validation', () => {
    it('should handle patient with many appointments', () => {
      const appointments = Array.from({ length: 50 }, (_, i) =>
        createMockAppointmentSummary({
          id: `appointment-${i}`,
          date: new Date(2026, 0, (i % 28) + 1, 10, 0, 0),
        })
      )

      const data = createMockPatientHistoryData({ appointments })

      expect(data.appointments).toHaveLength(50)
    })

    it('should handle teeth notes with various tooth numbers', () => {
      const teethNotes: Record<string, string> = {}
      // Upper teeth: 11-18, 21-28
      // Lower teeth: 31-38, 41-48
      const toothNumbers = ['11', '12', '21', '31', '41', '18', '28', '38', '48']
      toothNumbers.forEach((num) => {
        teethNotes[num] = `Note for tooth ${num}`
      })

      const data = createMockPatientHistoryData({ teethNotes })

      expect(Object.keys(data.teethNotes || {})).toHaveLength(9)
      expect(data.teethNotes?.['11']).toBe('Note for tooth 11')
    })

    it('should handle different currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'MXN', 'ARS']

      currencies.forEach((currency) => {
        const data = createMockPatientHistoryData({
          tenant: createMockTenantInfo({ currency }),
        })
        expect(data.tenant.currency).toBe(currency)
      })
    })

    it('should handle different timezones', () => {
      const timezones = [
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Asia/Tokyo',
        'UTC',
      ]

      timezones.forEach((timezone) => {
        const data = createMockPatientHistoryData({
          tenant: createMockTenantInfo({ timezone }),
        })
        expect(data.tenant.timezone).toBe(timezone)
      })
    })
  })
})
