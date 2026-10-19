import { prisma } from "../lib/prisma";
import { AdminError, assertAdmin } from "./admin";
import { commentSchema, reactionSchema } from "../validators/discussion";

export async function postComment(articleId: string, input: unknown) {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) throw new AdminError(parsed.error.issues[0].message);
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Article" WHERE "id" = ${articleId} FOR UPDATE`;
    const article = await tx.article.findUnique({
      where: { id: articleId },
      select: { status: true },
    });
    if (article?.status !== "PUBLISHED") throw new AdminError("This article is unavailable.");
    // A shared article limit contains bursts without identifying any visitor.
    const recent = await tx.articleComment.count({
      where: { articleId, createdAt: { gt: new Date(Date.now() - 60000) } },
    });
    if (recent >= 20)
      throw new AdminError("This discussion is busy. Please try again in a minute.");
    return tx.articleComment.create({
      data: { articleId, body: parsed.data.body },
      select: { id: true },
    });
  });
}

export async function reactToArticle(articleId: string, direction: unknown) {
  const parsed = reactionSchema.safeParse(direction);
  if (!parsed.success) throw new AdminError("Choose thumbs up or thumbs down.");
  const changed = await prisma.article.updateMany({
    where: { id: articleId, status: "PUBLISHED" },
    data: parsed.data === "UP" ? { thumbsUp: { increment: 1 } } : { thumbsDown: { increment: 1 } },
  });
  if (!changed.count) throw new AdminError("This article is unavailable.");
}

export async function removeComment(
  actor: { id: string; role: string },
  articleId: string,
  id: string,
) {
  await assertAdmin(actor, "articles");
  await prisma.articleComment.deleteMany({ where: { id, articleId } });
}
