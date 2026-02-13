import { useAuthStore } from '@/stores/auth.store'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

/**
 * Returns a direct URL for an authenticated image attachment.
 * The JWT is passed as a query param so the browser can load it natively via <img src>.
 */
export function useImageUrl(attachmentId: string | null): string | null {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!attachmentId || !accessToken) return null

  return `${API_BASE_URL}/api/attachments/file/${attachmentId}?token=${accessToken}`
}
