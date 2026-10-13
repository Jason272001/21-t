import {
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { ClassCard } from "@/components/courses/class-card";
import { CourseCard } from "@/components/courses/course-card";
import { InstructorCard } from "@/components/instructors/instructor-card";
import { Section } from "@/components/section";
import { TestimonialCard } from "@/components/testimonials/testimonial-card";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import {
  articles as sampleArticles,
  courses as sampleCourses,
  instructors as sampleInstructors,
  testimonials as sampleTestimonials,
} from "@backend/lib/sample-data";
import { prisma } from "@backend/lib/prisma";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const {
    messages: { home, nav },
  } = await getLanguage();
  const { courses, classes, articles, instructors, testimonials, stats } = await getHomeData();

  return (
    <main className="bg-page text-foreground">
      <section className="tech-grid overflow-hidden px-4 py-20 lg:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">
              21st Century Technology
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted">{home.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/articles">{home.readArticles}</ButtonLink>
              <ButtonLink href="/courses" variant="secondary">
                {home.browseCourses}
              </ButtonLink>
              <ButtonLink href="/enrollment" variant="accent">
                {nav.enroll}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-cyan-300/20 bg-surface/80 p-6 shadow-[0_0_60px_rgba(34,211,238,0.16)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { Icon: BookOpen, title: home.articles, text: home.articlesBody },
                { Icon: ShieldCheck, title: home.safety, text: home.safetyBody },
                { Icon: Sparkles, title: home.ai, text: home.aiBody },
                { Icon: BriefcaseBusiness, title: home.career, text: home.careerBody },
              ].map(({ Icon, title, text }) => (
                <div
                  key={String(title)}
                  className="rounded-lg border border-line/10 bg-overlay/5 p-5"
                >
                  <Icon className="h-7 w-7 text-accent" />
                  <h3 className="mt-4 font-black">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow={nav.courses} title={home.featuredCourses}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </Section>

      <Section eyebrow={nav.schedule} title={home.upcomingClasses} className="bg-surface">
        <div className="grid gap-5 lg:grid-cols-3">
          {classes.map((item) => (
            <ClassCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section eyebrow={nav.articles} title={home.featuredArticles}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Section>

      <Section eyebrow={home.why} title={home.whyTitle} className="bg-surface">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            [home.students, stats[0]],
            [nav.courses, stats[1]],
            [nav.articles, stats[2]],
            [home.enrollments, stats[3]],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line/10 bg-page p-6">
              <p className="text-4xl font-black text-accent">{value}</p>
              <p className="mt-2 text-sm font-semibold text-muted">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow={nav.instructors} title={home.instructorsTitle}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </Section>

      <Section eyebrow={home.testimonials} title={home.feedback} className="bg-surface">
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section eyebrow={home.community} title={home.communityTitle}>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-line/10 bg-surface p-6">
            <ExternalLink className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-black">{home.facebookTitle}</h3>
            <p className="mt-3 leading-8 text-muted">{home.facebookBody}</p>
            <ButtonLink href={brand.facebookUrl} variant="accent" className="mt-5">
              {home.facebookButton}
            </ButtonLink>
          </div>
          <div className="rounded-lg border border-line/10 bg-surface p-6">
            <Users className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-black">{home.faqTitle}</h3>
            <p className="mt-3 leading-8 text-muted">{home.faqBody}</p>
            <ButtonLink href="/faq" variant="secondary" className="mt-5">
              {home.faqButton}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}

async function getHomeData() {
  try {
    const [courses, classes, articles, instructors, testimonials, stats] = await Promise.all([
      prisma.course.findMany({
        where: { status: "PUBLISHED", featured: true },
        take: 4,
        include: { category: true, instructor: true },
      }),
      prisma.classSchedule.findMany({
        where: { status: "OPEN_FOR_ENROLLMENT" },
        take: 3,
        include: { course: true, instructor: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED", featured: true },
        take: 4,
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.instructorProfile.findMany({ where: { featured: true }, take: 4 }),
      prisma.testimonial.findMany({
        where: { approved: true },
        take: 3,
        include: { course: true },
      }),
      Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.course.count(),
        prisma.article.count(),
        prisma.enrollment.count(),
      ]),
    ]);
    return { courses, classes, articles, instructors, testimonials, stats };
  } catch {
    return {
      courses: sampleCourses.slice(0, 4).map((course) => ({
        ...course,
        id: course.slug,
        category: { name: course.category },
        instructor: { fullName: course.instructor },
      })),
      classes: sampleCourses.slice(0, 3).map((course, index) => ({
        id: `demo-class-${index + 1}`,
        title: `${course.title} - Demo Batch`,
        startDate: new Date(Date.now() + (index + 5) * 86400000),
        endDate: new Date(Date.now() + (index + 40) * 86400000),
        daysOfWeek: index % 2 === 0 ? ["Sat", "Sun"] : ["Mon", "Wed", "Fri"],
        startTime: index % 2 === 0 ? "09:00" : "19:00",
        endTime: index % 2 === 0 ? "11:00" : "21:00",
        deliveryType: course.deliveryType,
        location: "Yangon / Online",
        meetingLink: null,
        maxStudents: 25,
        currentEnrolled: index + 4,
        price: course.discountPrice ?? course.price,
        status: "OPEN_FOR_ENROLLMENT",
        course: { title: course.title, slug: course.slug },
        instructor: { fullName: course.instructor },
      })),
      articles: sampleArticles.slice(0, 4).map((article) => ({
        ...article,
        id: article.slug,
        category: { name: article.categorySlug.replaceAll("-", " ") },
        author: { name: "21CT" },
      })),
      instructors: sampleInstructors.slice(0, 4).map((instructor) => ({
        ...instructor,
        id: instructor.slug,
      })),
      testimonials: sampleTestimonials.slice(0, 3).map((item) => ({
        ...item,
        id: item.studentName + item.body,
        course: { title: "21CT Course" },
      })),
      stats: [120, 8, 12, 42],
    };
  }
}
