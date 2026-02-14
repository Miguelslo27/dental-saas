-- CreateTable
CREATE TABLE "patient_payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_payments_tenantId_idx" ON "patient_payments"("tenantId");

-- CreateIndex
CREATE INDEX "patient_payments_patientId_idx" ON "patient_payments"("patientId");

-- CreateIndex
CREATE INDEX "patient_payments_date_idx" ON "patient_payments"("date");

-- AddForeignKey
ALTER TABLE "patient_payments" ADD CONSTRAINT "patient_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_payments" ADD CONSTRAINT "patient_payments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
