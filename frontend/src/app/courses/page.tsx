import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/course-card";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Professional IT Courses" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; level?: string }> }) {
  const params = await searchParams;
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        title: params.q ? { contains: params.q, mode: "insensitive" } : undefined,
        category: params.category ? { slug: params.category } : undefined,
        level: params.level ? (params.level as never) : undefined,
      },
      include: { category: true, instructor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.courseCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <Section eyebrow="Courses" title="Professional course catalog" body="Computer, Networking, Cybersecurity, AI, IT Support, Web Development and Career Preparation.">
      <form className="mb-8 grid gap-3 rounded-lg border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_220px_180px_auto]">
        <input name="q" defaultValue={params.q} placeholder="Search courses" className="min-h-11 rounded-lg bg-slate-950 px-3 text-white" />
        <select name="category" defaultValue={params.category} className="min-h-11 rounded-lg bg-slate-950 px-3 text-white">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <select name="level" defaultValue={params.level} className="min-h-11 rounded-lg bg-slate-950 px-3 text-white">
          <option value="">All levels</option><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option>
        </select>
        <button className="rounded-lg bg-cyan-300 px-5 font-bold text-slate-950">Filter</button>
      </form>
      {courses.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <EmptyState title="No courses found" body="Try another filter." />}
    </Section>
  );
}
