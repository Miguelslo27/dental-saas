import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageUpload } from './ImageUpload'
import { AttachmentModule } from '@dental/shared'
import * as attachmentApi from '@/lib/attachment-api'

// Mock permissions hook
const mockCan = vi.fn(() => true)
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ can: mockCan, canAny: vi.fn(), canAll: vi.fn() }),
}))

// Mock attachment API
vi.mock('@/lib/attachment-api', () => ({
  uploadAttachments: vi.fn(),
}))

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCan.mockReturnValue(true)
  })

  it('should render drop zone when user has upload permission', () => {
    render(
      <ImageUpload
        module={AttachmentModule.PATIENTS}
        entityId="patient-1"
      />
    )

    expect(screen.getByText(/JPEG, PNG, WebP, GIF/)).toBeInTheDocument()
  })

  it('should not render when user lacks upload permission', () => {
    mockCan.mockReturnValue(false)

    const { container } = render(
      <ImageUpload
        module={AttachmentModule.PATIENTS}
        entityId="patient-1"
      />
    )

    expect(container.innerHTML).toBe('')
  })

  it('should call uploadAttachments on file select', async () => {
    const mockOnComplete = vi.fn()
    const mockAttachments = [{ id: '1', filename: 'test.png' }]
    vi.mocked(attachmentApi.uploadAttachments).mockResolvedValue(mockAttachments as never)

    render(
      <ImageUpload
        module={AttachmentModule.PATIENTS}
        entityId="patient-1"
        onUploadComplete={mockOnComplete}
      />
    )

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeTruthy()

    const file = new File(['data'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(attachmentApi.uploadAttachments).toHaveBeenCalledWith(
        AttachmentModule.PATIENTS,
        'patient-1',
        [file]
      )
    })

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(mockAttachments)
    })
  })

  it('should show error for invalid file type', async () => {
    render(
      <ImageUpload
        module={AttachmentModule.PATIENTS}
        entityId="patient-1"
      />
    )

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      // The error message comes from i18n key 'attachments.invalidType'
      const errorEl = document.querySelector('.text-red-600')
      expect(errorEl).toBeTruthy()
    })

    // Should NOT call the API
    expect(attachmentApi.uploadAttachments).not.toHaveBeenCalled()
  })

  it('should show uploading state', async () => {
    // Make the upload hang
    vi.mocked(attachmentApi.uploadAttachments).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <ImageUpload
        module={AttachmentModule.PATIENTS}
        entityId="patient-1"
      />
    )

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      // Should show a spinner (Loader2 component)
      expect(document.querySelector('.animate-spin')).toBeTruthy()
    })
  })

  it('should render with disabled state', () => {
    render(
      <ImageUpload
        module={AttachmentModule.PATIENTS}
        entityId="patient-1"
        disabled
      />
    )

    // The outer dashed border zone should have opacity-50 class
    const dropZone = document.querySelector('.border-dashed')
    expect(dropZone?.className).toContain('opacity-50')
  })
})
