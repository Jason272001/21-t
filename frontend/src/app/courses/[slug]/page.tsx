import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassCard } from "@/components/courses/class-card";
import { TestimonialCard } from "@/components/testimonials/testimonial-card";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return { title: course?.title, description: course?.shortDescription };
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { category: true, instructor: true, curriculumSections: { include: { lessons: true }, orderBy: { sortOrder: "asc" } }, classSchedules: { include: { course: true, instructor: true } }, testimonials: true },
  });
  if (!course) notFound();
  return (
    <main className="bg-page px-4 py-12 text-foreground lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <StatusBadge label={course.category.name} />
          <h1 className="mt-5 text-4xl font-black md:text-5xl">{course.title}</h1>
          <p className="mt-5 text-lg leading-9 text-muted">{course.fullDescription}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {course.outcomes.map((item) => <div key={item} className="rounded-lg border border-line/10 bg-surface p-4 text-sm leading-7 text-foreground">{item}</div>)}
          </div>
          <h2 className="mt-10 text-2xl font-black">Curriculum</h2>
          <div className="mt-4 grid gap-3">
            {course.curriculumSections.map((section) => (
              <details key={section.id} className="rounded-lg border border-line/10 bg-surface p-4" open>
                <summary className="cursor-pointer font-bold">{section.title}</summary>
                <ul className="mt-3 grid gap-2 text-sm text-muted">{section.lessons.map((lesson) => <li key={lesson.id}>{lesson.title} • {lesson.duration}</li>)}</ul>
              </details>
            ))}
          </div>
          <h2 className="mt-10 text-2xl font-black">Available classes</h2>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">{course.classSchedules.map((item) => <ClassCard key={item.id} item={item} />)}</div>
          <h2 className="mt-10 text-2xl font-black">Student reviews</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">{course.testimonials.map((item) => <TestimonialCard key={item.id} item={item} />)}</div>
        </section>
        <aside className="h-fit rounded-lg border border-cyan-300/20 bg-surface p-6">
          <p className="text-3xl font-black text-accent">{formatMoney(course.discountPrice ?? course.price)}</p>
          {course.discountPrice ? <p className="text-sm text-faint line-through">{formatMoney(course.price)}</p> : null}
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-subtle">Instructor</dt><dd>{course.instructor.fullName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-subtle">Duration</dt><dd>{course.duration}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-subtle">Level</dt><dd>{course.level}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-subtle">Delivery</dt><dd>{course.deliveryType.replaceAll("_", " ")}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-subtle">Certificate</dt><dd>{course.certificate ? "Available" : "No"}</dd></div>
          </dl>
          <ButtonLink href={`/enrollment?course=${course.slug}`} variant="accent" className="mt-6 w-full">အတန်းအပ်ရန်</ButtonLink>
          <h3 className="mt-8 font-black">Requirements</h3>
          <ul className="mt-3 grid gap-2 text-sm text-muted">{course.requirements.map((item) => <li key={item}>• {item}</li>)}</ul>
          <h3 className="mt-6 font-black">Target audience</h3>
          <ul className="mt-3 grid gap-2 text-sm text-muted">{course.targetAudience.map((item) => <li key={item}>• {item}</li>)}</ul>
        </aside>
      </div>
    </main>
  );
}
