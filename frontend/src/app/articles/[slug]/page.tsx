import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/articles/article-card";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@backend/lib/prisma";
import { getLanguage } from "@/lib/i18n-server";
import { Discussion } from "@/components/articles/discussion";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug, status: "PUBLISHED" } });
  return {
    title: article?.seoTitle || article?.title,
    description: article?.seoDescription || article?.excerpt,
  };
}

export default async function ArticleDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ commentsPage?: string }>;
}) {
  const { slug } = await params;
  const { locale } = await getLanguage();
  const query = await searchParams;
  const page = Math.min(10000, Math.max(1, Math.floor(Number(query.commentsPage) || 1)));
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, author: { select: { name: true } }, tags: true },
  });
  if (!article) notFound();
  const [comments, commentCount] = await Promise.all([
    prisma.articleComment.findMany({
      where: { articleId: article.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 20,
      skip: (page - 1) * 20,
      select: { id: true, body: true, createdAt: true },
    }),
    prisma.articleComment.count({ where: { articleId: article.id } }),
  ]);
  const related = await prisma.article.findMany({
    where: { categoryId: article.categoryId, id: { not: article.id }, status: "PUBLISHED" },
    include: { category: true, author: { select: { name: true } } },
    take: 3,
  });

  return (
    <main className="bg-page px-4 py-12 text-foreground lg:px-6">
      <article className="mx-auto max-w-4xl">
        <nav className="text-sm text-subtle">
          <Link href="/">Home</Link> / <Link href="/articles">Articles</Link> /{" "}
          {article.category.name}
        </nav>
        <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-9 text-muted">{article.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-subtle">
          <span>{article.author.name || "21CT"}</span>
          <span>{article.readingTime} min read</span>
          <span>{article.publishedAt?.toLocaleDateString()}</span>
        </div>
        {article.featuredImage ? (
          <Image
            unoptimized
            width={1200}
            height={675}
            src={article.featuredImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="mt-8 max-h-[36rem] w-full rounded-2xl border border-line/10 object-contain"
          />
        ) : (
          <div className="tech-grid mt-8 h-72 rounded-lg border border-cyan-300/20 bg-surface" />
        )}

        {!!article.tags.length && (
          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label={locale === "en" ? "Tags" : "တဂ်များ"}
          >
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-line/10 bg-surface px-3 py-1.5 text-xs text-muted"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="prose-21ct mt-8 whitespace-pre-line">{article.content}</div>
        <Discussion
          articleId={article.id}
          thumbsUp={article.thumbsUp}
          thumbsDown={article.thumbsDown}
          locale={locale}
        />
        <section className="mt-8" aria-label={locale === "en" ? "Comments" : "မှတ်ချက်များ"}>
          <h2 className="text-xl font-bold">
            {locale === "en" ? "Comments" : "မှတ်ချက်များ"} ({commentCount.toLocaleString(locale)})
          </h2>
          {!comments.length && (
            <p className="mt-4 text-sm text-muted">
              {locale === "en"
                ? "No comments yet. Start the conversation."
                : "မှတ်ချက် မရှိသေးပါ။ ပထမဆုံး ဆွေးနွေးသူ ဖြစ်ပါစေ။"}
            </p>
          )}
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="mt-4 rounded-xl border border-line/10 bg-surface p-5"
            >
              <time dateTime={comment.createdAt.toISOString()} className="text-xs text-subtle">
                {comment.createdAt.toLocaleString(locale, { timeZone: "Asia/Yangon" })} ·
                Asia/Yangon
              </time>
              <p className="mt-3 whitespace-pre-wrap break-words leading-8 text-muted">
                {comment.body}
              </p>
            </article>
          ))}
          <nav aria-label="Comment pages" className="mt-5 flex gap-5 text-sm text-accent">
            {page > 1 && (
              <Link href={`?commentsPage=${page - 1}`}>
                {locale === "en" ? "Newer comments" : "မှတ်ချက် အသစ်များ"}
              </Link>
            )}
            {page * 20 < commentCount && (
              <Link href={`?commentsPage=${page + 1}`}>
                {locale === "en" ? "Older comments" : "မှတ်ချက် အဟောင်းများ"}
              </Link>
            )}
          </nav>
        </section>
        <div className="mt-10 rounded-lg border border-line/10 bg-surface p-6">
          <h2 className="text-2xl font-black">21CT မှ သင်တန်းအကြံပြုချက်</h2>
          <p className="mt-3 text-muted">
            ဒီအကြောင်းအရာကို လက်တွေ့သင်တန်းအနေနဲ့ ဆက်လေ့လာချင်ပါက course catalog ကိုကြည့်ပါ။
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/courses">သင်တန်းများ ကြည့်ရန်</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              မေးမြန်းရန်
            </ButtonLink>
          </div>
        </div>
      </article>
      <section className="mx-auto mt-12 max-w-7xl">
        <h2 className="mb-5 text-2xl font-black">Related articles</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ArticleCard key={item.id} article={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
