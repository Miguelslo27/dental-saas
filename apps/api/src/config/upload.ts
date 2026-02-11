import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import { mkdir } from 'fs/promises'
import { env } from './env.js'

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

export const MAX_FILES_PER_REQUEST = 10
export const MAX_FILE_SIZE_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

/**
 * Get the storage path for a tenant's module files
 */
export function getStoragePath(tenantId: string, module: string): string {
  return path.join(env.UPLOAD_DIR, tenantId, module.toLowerCase())
}

/**
 * Generate a unique stored filename with the correct extension
 */
export function generateStoredName(mimeType: string): string {
  const ext = MIME_TO_EXT[mimeType] || '.bin'
  return `${randomUUID()}${ext}`
}

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true })
}

/**
 * Check if a MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Multer instance with memory storage (validate before writing to disk)
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_REQUEST,
  },
  fileFilter: (_req, file, cb) => {
    if (isAllowedMimeType(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
    }
  },
})
