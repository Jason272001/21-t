ALTER TABLE "Article" ADD COLUMN "thumbsUp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "thumbsDown" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "ArticleImage" (
  "articleId" TEXT NOT NULL,
  "data" BYTEA NOT NULL,
  "mediaType" TEXT NOT NULL,
  CONSTRAINT "ArticleImage_pkey" PRIMARY KEY ("articleId"),
  CONSTRAINT "ArticleImage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "ArticleComment" (
  "id" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArticleComment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ArticleComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ArticleComment_articleId_createdAt_id_idx" ON "ArticleComment"("articleId", "createdAt", "id");
