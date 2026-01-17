import { apiClient } from './api'

// ============================================================================
// PDF Download Functions
// ============================================================================

/**
 * Download appointment receipt as PDF
 */
export async function downloadAppointmentPdf(appointmentId: string): Promise<void> {
  const response = await apiClient.get(`/appointments/${appointmentId}/pdf`, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers['content-disposition']
  let filename = `appointment-receipt-${appointmentId}.pdf`
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/)
    if (match) {
      filename = match[1]
    }
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Download patient history as PDF
 */
export async function downloadPatientHistoryPdf(patientId: string): Promise<void> {
  const response = await apiClient.get(`/patients/${patientId}/history-pdf`, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers['content-disposition']
  let filename = `patient-history-${patientId}.pdf`
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/)
    if (match) {
      filename = match[1]
    }
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
