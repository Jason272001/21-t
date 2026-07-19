import type { Metadata } from "next";
import { ArticleCard } from "@/components/articles/article-card";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Burmese Technology Articles" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const params = await searchParams;
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      title: params.q ? { contains: params.q, mode: "insensitive" } : undefined,
      category: params.category ? { slug: params.category } : undefined,
    },
    include: { category: true, author: true, tags: true },
    orderBy: params.sort === "popular" ? { views: "desc" } : { publishedAt: "desc" },
    take: 24,
  });
  const categories = await prisma.articleCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <Section eyebrow="Articles" title="Burmese technology articles" body="Search, filter, and learn practical IT knowledge in Burmese.">
      <form className="mb-8 grid gap-3 rounded-lg border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_220px_180px_auto]">
        <input name="q" defaultValue={params.q} placeholder="Search articles" className="min-h-11 rounded-lg bg-slate-950 px-3 text-white" />
        <select name="category" defaultValue={params.category} className="min-h-11 rounded-lg bg-slate-950 px-3 text-white">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <select name="sort" defaultValue={params.sort} className="min-h-11 rounded-lg bg-slate-950 px-3 text-white">
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
        </select>
        <button className="rounded-lg bg-cyan-300 px-5 font-bold text-slate-950">Filter</button>
      </form>
      {articles.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <EmptyState title="No articles found" body="Try another search or category." />}
    </Section>
  );
}
