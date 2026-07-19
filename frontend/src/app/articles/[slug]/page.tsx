import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/articles/article-card";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  return { title: article?.seoTitle || article?.title, description: article?.seoDescription || article?.excerpt };
}

export default async function ArticleDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true, author: true, tags: true },
  });
  if (!article) notFound();
  const related = await prisma.article.findMany({
    where: { categoryId: article.categoryId, id: { not: article.id }, status: "PUBLISHED" },
    include: { category: true, author: true },
    take: 3,
  });

  return (
    <main className="bg-slate-950 px-4 py-12 text-white lg:px-6">
      <article className="mx-auto max-w-4xl">
        <nav className="text-sm text-slate-400"><Link href="/">Home</Link> / <Link href="/articles">Articles</Link> / {article.category.name}</nav>
        <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-9 text-slate-300">{article.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
          <span>{article.author.name || "21CT"}</span><span>{article.readingTime} min read</span><span>{article.publishedAt?.toLocaleDateString()}</span>
        </div>
        <div className="tech-grid mt-8 h-72 rounded-lg border border-cyan-300/20 bg-slate-900" />
        <div className="prose-21ct mt-8 whitespace-pre-line">{article.content}</div>
        <div className="mt-10 rounded-lg border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-black">21CT မှ သင်တန်းအကြံပြုချက်</h2>
          <p className="mt-3 text-slate-300">ဒီအကြောင်းအရာကို လက်တွေ့သင်တန်းအနေနဲ့ ဆက်လေ့လာချင်ပါက course catalog ကိုကြည့်ပါ။</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/courses">သင်တန်းများ ကြည့်ရန်</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">မေးမြန်းရန်</ButtonLink>
          </div>
        </div>
      </article>
      <section className="mx-auto mt-12 max-w-7xl">
        <h2 className="mb-5 text-2xl font-black">Related articles</h2>
        <div className="grid gap-5 md:grid-cols-3">{related.map((item) => <ArticleCard key={item.id} article={item} />)}</div>
      </section>
    </main>
  );
}
