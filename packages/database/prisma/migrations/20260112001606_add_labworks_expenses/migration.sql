-- CreateTable
CREATE TABLE "labworks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT,
    "lab" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "doctorIds" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "issuer" TEXT,
    "phoneNumber" TEXT,
    "note" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "doctorIds" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "labworks_tenantId_idx" ON "labworks"("tenantId");

-- CreateIndex
CREATE INDEX "labworks_patientId_idx" ON "labworks"("patientId");

-- CreateIndex
CREATE INDEX "labworks_date_idx" ON "labworks"("date");

-- CreateIndex
CREATE INDEX "labworks_isPaid_idx" ON "labworks"("isPaid");

-- CreateIndex
CREATE INDEX "labworks_isDelivered_idx" ON "labworks"("isDelivered");

-- CreateIndex
CREATE INDEX "expenses_tenantId_idx" ON "expenses"("tenantId");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "expenses_isPaid_idx" ON "expenses"("isPaid");

-- AddForeignKey
ALTER TABLE "labworks" ADD CONSTRAINT "labworks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labworks" ADD CONSTRAINT "labworks_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
