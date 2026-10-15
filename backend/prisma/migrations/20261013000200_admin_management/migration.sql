ALTER TABLE "User" ADD COLUMN "username" TEXT, ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "localOnly" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TYPE "VideoAudience" AS ENUM ('PUBLIC', 'STUDENTS', 'ENROLLED');
CREATE TABLE "Video" (
 "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL,
 "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT', "audience" "VideoAudience" NOT NULL DEFAULT 'STUDENTS',
 "courseId" TEXT, "fileKey" TEXT, "mimeType" TEXT, "size" INTEGER,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Video_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "Video_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Video_status_audience_idx" ON "Video"("status", "audience");
