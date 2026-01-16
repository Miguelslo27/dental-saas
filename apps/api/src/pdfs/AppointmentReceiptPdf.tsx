import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AppointmentReceiptData, AppointmentStatus } from '../services/pdf.service.js'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#0066cc',
    paddingBottom: 20,
  },
  clinicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
  },
  clinicInfo: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#666666',
    width: 120,
  },
  value: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
  },
  notesBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  notesText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  costSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statusBadge: {
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusUnpaid: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
  signatureLine: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    width: 200,
    paddingTop: 8,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
  },
})

// Helper function to format date
function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  })
}

function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
}

function formatStatus(status: AppointmentStatus): string {
  const statusMap: Record<AppointmentStatus, string> = {
    SCHEDULED: 'Scheduled',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
    RESCHEDULED: 'Rescheduled',
  }
  return statusMap[status] || status
}

interface AppointmentReceiptPdfProps {
  data: AppointmentReceiptData
}

export function AppointmentReceiptPdf({ data }: AppointmentReceiptPdfProps) {
  const { tenant, patient, doctor, appointment, generatedAt } = data
  const timezone = tenant.timezone || 'UTC'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Clinic Info */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{tenant.name}</Text>
          {tenant.address && <Text style={styles.clinicInfo}>{tenant.address}</Text>}
          {tenant.phone && <Text style={styles.clinicInfo}>Tel: {tenant.phone}</Text>}
          {tenant.email && <Text style={styles.clinicInfo}>{tenant.email}</Text>}
        </View>

        {/* Title */}
        <Text style={styles.title}>Appointment Receipt</Text>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {patient.firstName} {patient.lastName}
            </Text>
          </View>
          {patient.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{patient.phone}</Text>
            </View>
          )}
          {patient.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{patient.email}</Text>
            </View>
          )}
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(appointment.startTime, timezone)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {formatTime(appointment.startTime, timezone)} - {formatTime(appointment.endTime, timezone)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{appointment.duration} minutes</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{formatStatus(appointment.status)}</Text>
          </View>
          {appointment.type && (
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{appointment.type}</Text>
            </View>
          )}
        </View>

        {/* Doctor Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attending Doctor</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              Dr. {doctor.firstName} {doctor.lastName}
            </Text>
          </View>
          {doctor.specialty && (
            <View style={styles.row}>
              <Text style={styles.label}>Specialty:</Text>
              <Text style={styles.value}>{doctor.specialty}</Text>
            </View>
          )}
          {doctor.licenseNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>License #:</Text>
              <Text style={styles.value}>{doctor.licenseNumber}</Text>
            </View>
          )}
        </View>

        {/* Treatment Notes */}
        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Treatment Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Cost Section */}
        <View style={styles.costSection}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Total Cost:</Text>
            <Text style={styles.costValue}>
              {tenant.currency} {appointment.cost || '0.00'}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Payment Status:</Text>
            <Text
              style={[
                styles.statusBadge,
                appointment.isPaid ? styles.statusPaid : styles.statusUnpaid,
              ]}
            >
              {appointment.isPaid ? 'PAID' : 'PENDING'}
            </Text>
          </View>
        </View>

        {/* Signature Line */}
        <View style={styles.signatureLine}>
          <Text style={styles.signatureLabel}>
            Dr. {doctor.firstName} {doctor.lastName}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {formatDate(generatedAt, timezone)} at {formatTime(generatedAt, timezone)}
          </Text>
          <Text style={styles.footerText}>
            This document is for informational purposes only.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
