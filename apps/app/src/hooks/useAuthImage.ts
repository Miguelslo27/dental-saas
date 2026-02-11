import { useState, useEffect } from 'react'
import { fetchAttachmentBlob } from '@/lib/attachment-api'

/**
 * Hook that fetches an authenticated image by attachment ID
 * and returns a blob URL suitable for <img src>.
 * Cleans up the blob URL on unmount.
 */
export function useAuthImage(attachmentId: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attachmentId) {
      setUrl(null)
      return
    }

    let revoked = false
    let objectUrl: string | null = null

    setLoading(true)
    setError(null)

    fetchAttachmentBlob(attachmentId)
      .then((blob) => {
        if (revoked) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((e) => {
        if (revoked) return
        setError(e instanceof Error ? e.message : 'Failed to load image')
      })
      .finally(() => {
        if (!revoked) setLoading(false)
      })

    return () => {
      revoked = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [attachmentId])

  return { url, loading, error }
}
