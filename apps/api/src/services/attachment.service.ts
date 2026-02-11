import path from 'path'
import { writeFile, unlink } from 'fs/promises'
import { prisma } from '@dental/database'
import type { AttachmentModule } from '@dental/database'
import type { StorageUsage } from '@dental/shared'
import {
  getStoragePath,
  generateStoredName,
  ensureDir,
  isAllowedMimeType,
  MAX_FILE_SIZE_BYTES,
} from '../config/upload.js'

interface UploadFile {
  originalname: string
  mimetype: string
  buffer: Buffer
  size: number
}

interface UploadParams {
  tenantId: string
  module: AttachmentModule
  entityId: string
  uploadedBy: string
  files: UploadFile[]
}

/**
 * Sanitize a filename to remove unsafe characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255)
}

export const AttachmentService = {
  /**
   * Check if tenant has enough storage for additional bytes
   */
  async checkStorageLimit(
    tenantId: string,
    additionalBytes: number
  ): Promise<{ allowed: boolean; usage: StorageUsage }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { storageUsedBytes: true },
    })

    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    })

    if (!tenant || !subscription) {
      return {
        allowed: false,
        usage: {
          usedBytes: 0,
          limitBytes: 0,
          remainingBytes: 0,
          usedMb: 0,
          limitMb: 0,
          percentage: 0,
        },
      }
    }

    const limitBytes = subscription.plan.maxStorageMb * 1024 * 1024
    const usedBytes = Number(tenant.storageUsedBytes)
    const remainingBytes = Math.max(0, limitBytes - usedBytes)

    const usage: StorageUsage = {
      usedBytes,
      limitBytes,
      remainingBytes,
      usedMb: Math.round((usedBytes / (1024 * 1024)) * 100) / 100,
      limitMb: subscription.plan.maxStorageMb,
      percentage: limitBytes > 0 ? Math.round((usedBytes / limitBytes) * 10000) / 100 : 0,
    }

    return {
      allowed: usedBytes + additionalBytes <= limitBytes,
      usage,
    }
  },

  /**
   * Get storage usage for a tenant
   */
  async getStorageUsage(tenantId: string): Promise<StorageUsage> {
    const { usage } = await this.checkStorageLimit(tenantId, 0)
    return usage
  },

  /**
   * Upload files: validate, write to disk, create DB records, update tenant storage
   */
  async uploadAttachments({ tenantId, module, entityId, uploadedBy, files }: UploadParams) {
    // Validate file types and sizes
    for (const file of files) {
      if (!isAllowedMimeType(file.mimetype)) {
        throw new AttachmentError(
          `File type ${file.mimetype} is not allowed`,
          'INVALID_FILE_TYPE',
          400
        )
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new AttachmentError(
          `File ${file.originalname} exceeds the maximum size`,
          'FILE_TOO_LARGE',
          413
        )
      }
    }

    // Check storage limit
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const { allowed } = await this.checkStorageLimit(tenantId, totalSize)
    if (!allowed) {
      throw new AttachmentError(
        'Storage limit exceeded. Upgrade your plan for more storage.',
        'STORAGE_LIMIT_EXCEEDED',
        403
      )
    }

    // Write files to disk and create DB records in a transaction
    const storagePath = getStoragePath(tenantId, module)
    await ensureDir(storagePath)

    const fileData = files.map((file) => {
      const storedName = generateStoredName(file.mimetype)
      return {
        file,
        storedName,
        filePath: path.join(storagePath, storedName),
        sanitizedName: sanitizeFilename(file.originalname),
      }
    })

    // Write all files to disk first
    const writtenFiles: string[] = []
    try {
      for (const { file, filePath } of fileData) {
        await writeFile(filePath, file.buffer)
        writtenFiles.push(filePath)
      }

      // Create DB records in transaction
      const attachments = await prisma.$transaction(async (tx) => {
        const created = await Promise.all(
          fileData.map(({ file, storedName, sanitizedName }) =>
            tx.attachment.create({
              data: {
                tenantId,
                module,
                entityId,
                filename: sanitizedName,
                storedName,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                uploadedBy,
              },
            })
          )
        )

        // Update tenant storage usage
        await tx.tenant.update({
          where: { id: tenantId },
          data: {
            storageUsedBytes: { increment: totalSize },
          },
        })

        return created
      })

      return attachments
    } catch (error) {
      // Clean up written files on failure
      for (const filePath of writtenFiles) {
        try {
          await unlink(filePath)
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error
    }
  },

  /**
   * List attachments for a specific entity
   */
  async listAttachments(tenantId: string, module: AttachmentModule, entityId: string) {
    return prisma.attachment.findMany({
      where: { tenantId, module, entityId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        module: true,
        entityId: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        description: true,
        createdAt: true,
      },
    })
  },

  /**
   * Get a single attachment with its file path for streaming
   */
  async getAttachment(tenantId: string, attachmentId: string) {
    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, tenantId },
    })

    if (!attachment) {
      return null
    }

    const filePath = path.join(
      getStoragePath(tenantId, attachment.module),
      attachment.storedName
    )

    return { attachment, filePath }
  },

  /**
   * Delete an attachment: remove file from disk, delete DB record, decrement storage
   */
  async deleteAttachment(tenantId: string, attachmentId: string) {
    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, tenantId },
    })

    if (!attachment) {
      return null
    }

    // Delete from DB and update storage in transaction
    await prisma.$transaction(async (tx) => {
      await tx.attachment.delete({
        where: { id: attachmentId },
      })

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          storageUsedBytes: { decrement: attachment.sizeBytes },
        },
      })
    })

    // Delete file from disk (after DB transaction succeeds)
    const filePath = path.join(
      getStoragePath(tenantId, attachment.module),
      attachment.storedName
    )
    try {
      await unlink(filePath)
    } catch {
      // File may already be gone; log but don't fail
    }

    return attachment
  },
}

export class AttachmentError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = 'AttachmentError'
    this.code = code
    this.statusCode = statusCode
  }
}
