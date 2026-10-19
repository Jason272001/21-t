CREATE TABLE "AdminInvitation" (
  "id" TEXT NOT NULL,
  "digest" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "note" TEXT,
  "adminLevel" "AdminLevel" NOT NULL,
  "issuedById" TEXT NOT NULL,
  "acceptedById" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdminInvitation_level_check" CHECK ("adminLevel" IN ('MANAGER', 'STAFF')),
  CONSTRAINT "AdminInvitation_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AdminInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AdminInvitation_digest_key" ON "AdminInvitation"("digest");
CREATE INDEX "AdminInvitation_issuedById_createdAt_idx" ON "AdminInvitation"("issuedById", "createdAt");
