import { apiClient } from './api'

// ============================================================================
// Types
// ============================================================================

export interface ExportData {
  exportedAt: string
  tenant: {
    name: string
    slug: string
    email: string | null
    phone: string | null
    address: string | null
    timezone: string
    currency: string
  }
  patients: Array<Record<string, unknown>>
  doctors: Array<Record<string, unknown>>
  appointments: Array<Record<string, unknown>>
  labworks: Array<Record<string, unknown>>
  expenses: Array<Record<string, unknown>>
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Export all tenant data and trigger file download
 */
export async function exportData(): Promise<void> {
  const response = await apiClient.get<ExportData>('/export')
  
  const data = response.data
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const filename = `export-${data.tenant.slug}-${new Date().toISOString().split('T')[0]}.json`
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Get export data without triggering download (for preview)
 */
export async function getExportData(): Promise<ExportData> {
  const response = await apiClient.get<ExportData>('/export')
  return response.data
}
