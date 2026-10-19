import { prisma } from "@backend/lib/prisma";
import { getCurrentUser } from "@backend/lib/access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { status: true } });
  if (!article) return new Response(null, { status: 404 });
  if (article.status !== "PUBLISHED") {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return new Response(null, { status: 404 });
  }
  const picture = await prisma.articleImage.findUnique({ where: { articleId: id } });
  if (!picture) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(picture.data), {
    headers: {
      "Content-Type": picture.mediaType,
      "Content-Length": String(picture.data.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
