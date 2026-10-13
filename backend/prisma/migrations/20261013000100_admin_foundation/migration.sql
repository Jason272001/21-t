ALTER TYPE "ClassStatus" ADD VALUE 'DRAFT';

CREATE UNIQUE INDEX "Enrollment_studentProfileId_classScheduleId_key"
ON "Enrollment"("studentProfileId", "classScheduleId");

CREATE TABLE "LoginAttempt" (
  "key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "resetAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);
