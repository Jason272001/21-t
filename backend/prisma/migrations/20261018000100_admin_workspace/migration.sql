CREATE TYPE "AdminLevel" AS ENUM ('OWNER', 'MANAGER', 'STAFF');
ALTER TABLE "User" ADD COLUMN "adminLevel" "AdminLevel";
UPDATE "User" SET "adminLevel" = CASE WHEN "username" = 'admin' THEN 'OWNER'::"AdminLevel" ELSE 'STAFF'::"AdminLevel" END WHERE "role" = 'ADMIN';
CREATE TABLE "ClassAccessCode" (
  "id" TEXT NOT NULL,
  "digest" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "recipient" TEXT,
  "paymentReference" TEXT,
  "classScheduleId" TEXT NOT NULL,
  "issuedById" TEXT NOT NULL,
  "redeemedById" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "redeemedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClassAccessCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClassAccessCode_digest_key" ON "ClassAccessCode"("digest");
CREATE INDEX "ClassAccessCode_classScheduleId_createdAt_idx" ON "ClassAccessCode"("classScheduleId", "createdAt");
ALTER TABLE "ClassAccessCode" ADD CONSTRAINT "ClassAccessCode_classScheduleId_fkey" FOREIGN KEY ("classScheduleId") REFERENCES "ClassSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassAccessCode" ADD CONSTRAINT "ClassAccessCode_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassAccessCode" ADD CONSTRAINT "ClassAccessCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
