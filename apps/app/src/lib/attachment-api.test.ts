import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadAttachments, listAttachments, deleteAttachment, getStorageUsage } from './attachment-api'
import { apiClient } from './api'
import { AttachmentModule } from '@dental/shared'

// Mock apiClient
vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('attachment-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadAttachments', () => {
    it('should upload files with correct FormData', async () => {
      const mockAttachments = [
        { id: '1', filename: 'test.png', mimeType: 'image/png', sizeBytes: 1024 },
      ]
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: mockAttachments } })

      const files = [new File(['data'], 'test.png', { type: 'image/png' })]
      const result = await uploadAttachments(AttachmentModule.PATIENTS, 'patient-1', files)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/attachments/patients/patient-1',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      expect(result).toEqual(mockAttachments)
    })

    it('should handle multiple files', async () => {
      const mockAttachments = [
        { id: '1', filename: 'a.png' },
        { id: '2', filename: 'b.jpg' },
      ]
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: mockAttachments } })

      const files = [
        new File(['a'], 'a.png', { type: 'image/png' }),
        new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
      ]
      const result = await uploadAttachments(AttachmentModule.APPOINTMENTS, 'appt-1', files)

      expect(result).toHaveLength(2)
    })
  })

  describe('listAttachments', () => {
    it('should fetch attachments for an entity', async () => {
      const mockData = [
        { id: '1', filename: 'test.png', mimeType: 'image/png', sizeBytes: 1024 },
      ]
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: mockData } })

      const result = await listAttachments(AttachmentModule.LABWORKS, 'labwork-1')

      expect(apiClient.get).toHaveBeenCalledWith('/attachments/labworks/labwork-1')
      expect(result).toEqual(mockData)
    })

    it('should return empty array when no attachments', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } })

      const result = await listAttachments(AttachmentModule.EXPENSES, 'expense-1')
      expect(result).toEqual([])
    })
  })

  describe('deleteAttachment', () => {
    it('should call delete endpoint', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: { success: true } })

      await deleteAttachment('att-123')

      expect(apiClient.delete).toHaveBeenCalledWith('/attachments/att-123')
    })
  })

  describe('getStorageUsage', () => {
    it('should fetch storage usage', async () => {
      const mockUsage = {
        usedBytes: 5242880,
        limitBytes: 104857600,
        remainingBytes: 99614720,
        usedMb: 5,
        limitMb: 100,
        percentage: 5,
      }
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: mockUsage } })

      const result = await getStorageUsage()

      expect(apiClient.get).toHaveBeenCalledWith('/attachments/storage')
      expect(result).toEqual(mockUsage)
    })
  })

})
