CREATE TYPE "StoreOrderStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED');

CREATE TABLE "StoreOrder" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT,
  "customerWhatsapp" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "amount" INTEGER NOT NULL,
  "status" "StoreOrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentProvider" TEXT NOT NULL DEFAULT 'MIDTRANS',
  "paymentUrl" TEXT,
  "qrCodeUrl" TEXT,
  "providerOrderId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoreOrder_transactionId_key" ON "StoreOrder"("transactionId");
CREATE INDEX "StoreOrder_status_expiresAt_idx" ON "StoreOrder"("status", "expiresAt");
CREATE INDEX "StoreOrder_customerWhatsapp_createdAt_idx" ON "StoreOrder"("customerWhatsapp", "createdAt");