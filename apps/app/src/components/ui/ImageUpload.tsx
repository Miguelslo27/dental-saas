import { useState, useRef, useCallback } from 'react'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Permission } from '@dental/shared'
import type { AttachmentModule, AttachmentInfo } from '@dental/shared'
import { usePermissions } from '@/hooks/usePermissions'
import { uploadAttachments } from '@/lib/attachment-api'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface ImageUploadProps {
  module: AttachmentModule
  entityId: string
  onUploadComplete?: (attachments: AttachmentInfo[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function ImageUpload({
  module,
  entityId,
  onUploadComplete,
  maxFiles = 10,
  disabled = false,
}: ImageUploadProps) {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const canUpload = can(Permission.ATTACHMENTS_UPLOAD)

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      if (files.length > maxFiles) {
        return t('attachments.tooManyFiles', { max: maxFiles })
      }
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return t('attachments.invalidType')
        }
        if (file.size > MAX_FILE_SIZE) {
          return t('attachments.fileTooLarge', { name: file.name })
        }
      }
      return null
    },
    [maxFiles, t]
  )

  const handleUpload = useCallback(
    async (files: File[]) => {
      const validationError = validateFiles(files)
      if (validationError) {
        setError(validationError)
        return
      }

      setUploading(true)
      setError(null)
      try {
        const attachments = await uploadAttachments(module, entityId, files)
        onUploadComplete?.(attachments)
      } catch (e: unknown) {
        const err = e as { response?: { data?: { error?: { code?: string; message?: string } } } }
        const code = err.response?.data?.error?.code
        if (code === 'STORAGE_LIMIT_EXCEEDED') {
          setError(t('attachments.storageFull'))
        } else if (code === 'INVALID_FILE_TYPE') {
          setError(t('attachments.invalidType'))
        } else if (code === 'FILE_TOO_LARGE') {
          setError(t('attachments.fileTooLarge', { name: '' }))
        } else {
          setError(err.response?.data?.error?.message || t('errors.generic'))
        }
      } finally {
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [module, entityId, validateFiles, onUploadComplete, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled || !canUpload || uploading) return
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) handleUpload(files)
    },
    [disabled, canUpload, uploading, handleUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) handleUpload(files)
    },
    [handleUpload]
  )

  if (!canUpload) return null

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && !uploading) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">{t('attachments.uploading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload className="h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-600">{t('attachments.dragDrop')}</p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF (max 10MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
