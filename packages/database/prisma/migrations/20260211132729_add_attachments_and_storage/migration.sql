-- CreateEnum
CREATE TYPE "AttachmentModule" AS ENUM ('PATIENTS', 'APPOINTMENTS', 'LABWORKS', 'EXPENSES');

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "maxStorageMb" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "storageUsedBytes" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "module" "AttachmentModule" NOT NULL,
    "entityId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_tenantId_idx" ON "attachments"("tenantId");

-- CreateIndex
CREATE INDEX "attachments_tenantId_module_entityId_idx" ON "attachments"("tenantId", "module", "entityId");

-- CreateIndex
CREATE INDEX "attachments_entityId_idx" ON "attachments"("entityId");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
