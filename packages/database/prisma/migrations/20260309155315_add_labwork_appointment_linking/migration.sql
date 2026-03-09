-- AlterTable
ALTER TABLE "labworks" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "priceIncludedInAppointment" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "labworks_appointmentId_idx" ON "labworks"("appointmentId");

-- AddForeignKey
ALTER TABLE "labworks" ADD CONSTRAINT "labworks_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
