import Link from "next/link";
import { Section } from "@/components/section";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [articleCategories, courseCategories] = await Promise.all([
    prisma.articleCategory.findMany({ include: { _count: { select: { articles: true } } } }),
    prisma.courseCategory.findMany({ include: { _count: { select: { courses: true } } } }),
  ]);
  return (
    <Section eyebrow="Categories" title="Browse learning categories">
      <div className="grid gap-5 md:grid-cols-2">
        {[...articleCategories.map((c) => ({ ...c, type: "Article", count: c._count.articles, href: `/articles?category=${c.slug}` })), ...courseCategories.map((c) => ({ ...c, type: "Course", count: c._count.courses, href: `/courses?category=${c.slug}` }))].map((category) => (
          <Link key={`${category.type}-${category.id}`} href={category.href} className="rounded-lg border border-line/10 bg-surface p-6 hover:border-cyan-300/40">
            <p className="text-sm font-bold text-accent">{category.type}</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">{category.name}</h2>
            <p className="mt-2 text-muted">{category.count} items</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
