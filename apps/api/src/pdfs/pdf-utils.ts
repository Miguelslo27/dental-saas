import type { AppointmentStatus } from '../services/pdf.service.js'

/**
 * Format date for PDF display
 */
export function formatDate(date: Date, timezone: string, style: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style,
    day: 'numeric',
    timeZone: timezone,
  })
}

/**
 * Format time for PDF display
 */
export function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
}

/**
 * Format date and time for PDF display
 */
export function formatDateTime(date: Date, timezone: string): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
}

/**
 * Format appointment status for display
 */
export function formatStatus(status: AppointmentStatus): string {
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

/**
 * Sanitize a string for use in filenames
 * Removes/replaces characters that are invalid in filenames
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^\w\-]/g, '') // Remove any remaining non-word chars except dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .substring(0, 100) // Limit length
}
