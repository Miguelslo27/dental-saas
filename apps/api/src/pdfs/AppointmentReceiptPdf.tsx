import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AppointmentReceiptData } from '../services/pdf.service.js'
import {
  t,
  formatDate as formatDateI18n,
  formatTime as formatTimeI18n,
  translateStatus,
  type Language,
} from '@dental/shared'

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

interface AppointmentReceiptPdfProps {
  data: AppointmentReceiptData
}

export function AppointmentReceiptPdf({ data }: AppointmentReceiptPdfProps) {
  const { tenant, patient, doctor, appointment, generatedAt } = data
  const timezone = tenant.timezone || 'UTC'
  const language = (tenant.language || 'es') as Language

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Clinic Info */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{tenant.name}</Text>
          {tenant.address && <Text style={styles.clinicInfo}>{tenant.address}</Text>}
          {tenant.phone && (
            <Text style={styles.clinicInfo}>
              {t(language, 'pdf.common.phone')}: {tenant.phone}
            </Text>
          )}
          {tenant.email && <Text style={styles.clinicInfo}>{tenant.email}</Text>}
        </View>

        {/* Title */}
        <Text style={styles.title}>{t(language, 'pdf.appointment.receipt')}</Text>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'pdf.appointment.patientInformation')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t(language, 'pdf.appointment.name')}:</Text>
            <Text style={styles.value}>
              {patient.firstName} {patient.lastName}
            </Text>
          </View>
          {patient.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>{t(language, 'pdf.patient.phone')}:</Text>
              <Text style={styles.value}>{patient.phone}</Text>
            </View>
          )}
          {patient.email && (
            <View style={styles.row}>
              <Text style={styles.label}>{t(language, 'pdf.patient.email')}:</Text>
              <Text style={styles.value}>{patient.email}</Text>
            </View>
          )}
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'pdf.appointment.appointmentDetails')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t(language, 'pdf.appointment.date')}:</Text>
            <Text style={styles.value}>{formatDateI18n(appointment.startTime, language, timezone)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t(language, 'pdf.appointment.time')}:</Text>
            <Text style={styles.value}>
              {formatTimeI18n(appointment.startTime, language, timezone)} -{' '}
              {formatTimeI18n(appointment.endTime, language, timezone)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t(language, 'pdf.appointment.duration')}:</Text>
            <Text style={styles.value}>
              {appointment.duration} {t(language, 'pdf.appointment.minutes')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t(language, 'pdf.appointment.status')}:</Text>
            <Text style={styles.value}>{translateStatus(appointment.status, language)}</Text>
          </View>
          {appointment.type && (
            <View style={styles.row}>
              <Text style={styles.label}>{t(language, 'pdf.appointment.type')}:</Text>
              <Text style={styles.value}>{appointment.type}</Text>
            </View>
          )}
        </View>

        {/* Doctor Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(language, 'pdf.appointment.attendingDoctor')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t(language, 'pdf.appointment.name')}:</Text>
            <Text style={styles.value}>
              {t(language, 'pdf.common.doctor')} {doctor.firstName} {doctor.lastName}
            </Text>
          </View>
          {doctor.specialty && (
            <View style={styles.row}>
              <Text style={styles.label}>{t(language, 'pdf.appointment.specialty')}:</Text>
              <Text style={styles.value}>{doctor.specialty}</Text>
            </View>
          )}
          {doctor.licenseNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>{t(language, 'pdf.appointment.license')}:</Text>
              <Text style={styles.value}>{doctor.licenseNumber}</Text>
            </View>
          )}
        </View>

        {/* Treatment Notes */}
        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t(language, 'pdf.appointment.treatmentNotes')}</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Cost Section */}
        <View style={styles.costSection}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{t(language, 'pdf.appointment.totalCost')}:</Text>
            <Text style={styles.costValue}>
              {tenant.currency} {appointment.cost || '0.00'}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{t(language, 'pdf.appointment.paymentStatus')}:</Text>
            <Text
              style={[
                styles.statusBadge,
                appointment.isPaid ? styles.statusPaid : styles.statusUnpaid,
              ]}
            >
              {appointment.isPaid ? t(language, 'pdf.appointment.paid') : t(language, 'pdf.appointment.pending')}
            </Text>
          </View>
        </View>

        {/* Signature Line */}
        <View style={styles.signatureLine}>
          <Text style={styles.signatureLabel}>
            {t(language, 'pdf.common.doctor')} {doctor.firstName} {doctor.lastName}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t(language, 'pdf.common.generatedOn')} {formatDateI18n(generatedAt, language, timezone)}{' '}
            {t(language, 'pdf.common.at')} {formatTimeI18n(generatedAt, language, timezone)}
          </Text>
          <Text style={styles.footerText}>{t(language, 'pdf.appointment.informationalNotice')}</Text>
        </View>
      </Page>
    </Document>
  )
}
