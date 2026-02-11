import { apiClient } from './api'
import type { AttachmentModule, AttachmentInfo, StorageUsage } from '@dental/shared'

/**
 * Upload files to an entity
 */
export async function uploadAttachments(
  module: AttachmentModule,
  entityId: string,
  files: File[]
): Promise<AttachmentInfo[]> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const response = await apiClient.post(
    `/attachments/${module.toLowerCase()}/${entityId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data.data
}

/**
 * List attachments for an entity
 */
export async function listAttachments(
  module: AttachmentModule,
  entityId: string
): Promise<AttachmentInfo[]> {
  const response = await apiClient.get(
    `/attachments/${module.toLowerCase()}/${entityId}`
  )
  return response.data.data
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient.delete(`/attachments/${attachmentId}`)
}

/**
 * Get storage usage for the current tenant
 */
export async function getStorageUsage(): Promise<StorageUsage> {
  const response = await apiClient.get('/attachments/storage')
  return response.data.data
}

/**
 * Fetch an attachment file as a blob (authenticated)
 */
export async function fetchAttachmentBlob(attachmentId: string): Promise<Blob> {
  const response = await apiClient.get(`/attachments/file/${attachmentId}`, {
    responseType: 'blob',
  })
  return response.data
}
