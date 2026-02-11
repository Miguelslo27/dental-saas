import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AttachmentInfo } from '@dental/shared'
import { useAuthImage } from '@/hooks/useAuthImage'

interface ImageLightboxProps {
  attachments: AttachmentInfo[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageLightbox({
  attachments,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const current = attachments[currentIndex]
  const { url, loading } = useAuthImage(current?.id ?? null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < attachments.length - 1) onNavigate(currentIndex + 1)
    },
    [onClose, onNavigate, currentIndex, attachments.length]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation - Previous */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex - 1)
          }}
          className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="text-white/60 text-sm">Loading...</div>
        ) : url ? (
          <img
            src={url}
            alt={current.filename}
            className="max-w-full max-h-[85vh] object-contain rounded"
          />
        ) : (
          <div className="text-white/60 text-sm">Failed to load image</div>
        )}
      </div>

      {/* Navigation - Next */}
      {currentIndex < attachments.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex + 1)
          }}
          className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Filename and counter */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/70 text-sm">
          {current.filename} ({currentIndex + 1}/{attachments.length})
        </p>
      </div>
    </div>
  )
}
