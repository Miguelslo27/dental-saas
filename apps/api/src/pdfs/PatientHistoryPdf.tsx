import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PatientHistoryData, AppointmentStatus } from '../services/pdf.service.js'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#0066cc',
    paddingBottom: 15,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 6,
  },
  clinicInfo: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    color: '#666666',
    width: 100,
  },
  value: {
    fontSize: 9,
    color: '#333333',
    flex: 1,
  },
  // Dental Chart styles
  teethGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  toothItem: {
    width: '23%',
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  toothNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 2,
  },
  toothNote: {
    fontSize: 8,
    color: '#333333',
  },
  // Appointment table styles
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colDate: {
    width: '15%',
    fontSize: 8,
  },
  colType: {
    width: '18%',
    fontSize: 8,
  },
  colDoctor: {
    width: '20%',
    fontSize: 8,
  },
  colStatus: {
    width: '12%',
    fontSize: 8,
  },
  colCost: {
    width: '12%',
    fontSize: 8,
    textAlign: 'right',
  },
  colNotes: {
    width: '23%',
    fontSize: 8,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 8,
  },
  noData: {
    fontSize: 10,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
    textAlign: 'center',
  },
  pageNumber: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 7,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusScheduled: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusDefault: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
})

// Helper functions
function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
}

function formatDateTime(date: Date, timezone: string): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

function getStatusStyle(status: AppointmentStatus) {
  switch (status) {
    case 'COMPLETED':
      return styles.statusCompleted
    case 'SCHEDULED':
    case 'CONFIRMED':
      return styles.statusScheduled
    case 'CANCELLED':
    case 'NO_SHOW':
      return styles.statusCancelled
    default:
      return styles.statusDefault
  }
}

function calculateAge(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

interface PatientHistoryPdfProps {
  data: PatientHistoryData
}

export function PatientHistoryPdf({ data }: PatientHistoryPdfProps) {
  const { tenant, patient, appointments, teethNotes, generatedAt } = data
  const timezone = tenant.timezone || 'UTC'

  // Sort teeth notes by tooth number
  const sortedTeeth = teethNotes
    ? Object.entries(teethNotes).sort(([a], [b]) => {
        const numA = parseInt(a, 10)
        const numB = parseInt(b, 10)
        return numA - numB
      })
    : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Clinic Info */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{tenant.name}</Text>
          {tenant.address && <Text style={styles.clinicInfo}>{tenant.address}</Text>}
          {tenant.phone && <Text style={styles.clinicInfo}>Tel: {tenant.phone}</Text>}
        </View>

        {/* Title */}
        <Text style={styles.title}>Patient Medical History</Text>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>
              {patient.firstName} {patient.lastName}
            </Text>
          </View>
          {patient.dob && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>{formatDate(patient.dob, timezone)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Age:</Text>
                <Text style={styles.value}>{calculateAge(patient.dob)} years</Text>
              </View>
            </>
          )}
          {patient.gender && (
            <View style={styles.row}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{patient.gender}</Text>
            </View>
          )}
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
          {patient.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{patient.address}</Text>
            </View>
          )}
        </View>

        {/* Dental Chart Summary */}
        {sortedTeeth.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dental Chart Notes</Text>
            <View style={styles.teethGrid}>
              {sortedTeeth.map(([toothNum, note]) => (
                <View key={toothNum} style={styles.toothItem}>
                  <Text style={styles.toothNumber}>#{toothNum}</Text>
                  <Text style={styles.toothNote}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Appointment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Appointment History ({appointments.length} records)
          </Text>
          {appointments.length === 0 ? (
            <Text style={styles.noData}>No appointments recorded</Text>
          ) : (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.colDate, styles.headerText]}>Date</Text>
                <Text style={[styles.colType, styles.headerText]}>Type</Text>
                <Text style={[styles.colDoctor, styles.headerText]}>Doctor</Text>
                <Text style={[styles.colStatus, styles.headerText]}>Status</Text>
                <Text style={[styles.colCost, styles.headerText]}>Cost</Text>
                <Text style={[styles.colNotes, styles.headerText]}>Notes</Text>
              </View>
              {/* Table Rows */}
              {appointments.slice(0, 25).map((apt, index) => (
                <View
                  key={apt.id}
                  style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={styles.colDate}>{formatDate(apt.date, timezone)}</Text>
                  <Text style={styles.colType}>{apt.type || '-'}</Text>
                  <Text style={styles.colDoctor}>{apt.doctorName}</Text>
                  <View style={styles.colStatus}>
                    <Text style={[styles.statusBadge, getStatusStyle(apt.status)]}>
                      {formatStatus(apt.status)}
                    </Text>
                  </View>
                  <Text style={styles.colCost}>
                    {apt.cost ? `${tenant.currency} ${apt.cost}` : '-'}
                  </Text>
                  <Text style={styles.colNotes}>
                    {apt.notes ? apt.notes.substring(0, 50) + (apt.notes.length > 50 ? '...' : '') : '-'}
                  </Text>
                </View>
              ))}
              {appointments.length > 25 && (
                <Text style={styles.noData}>
                  ... and {appointments.length - 25} more appointments
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {formatDateTime(generatedAt, timezone)} | {tenant.name}
          </Text>
          <Text style={styles.footerText}>
            This document contains confidential medical information.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
