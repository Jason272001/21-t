import { BookOpen, BriefcaseBusiness, ExternalLink, ShieldCheck, Sparkles, Users } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { ClassCard } from "@/components/courses/class-card";
import { CourseCard } from "@/components/courses/course-card";
import { InstructorCard } from "@/components/instructors/instructor-card";
import { Section } from "@/components/section";
import { TestimonialCard } from "@/components/testimonials/testimonial-card";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { articles as sampleArticles, courses as sampleCourses, instructors as sampleInstructors, testimonials as sampleTestimonials } from "@backend/lib/sample-data";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { courses, classes, articles, instructors, testimonials, stats } = await getHomeData();

  return (
    <main className="bg-slate-950 text-white">
      <section className="tech-grid overflow-hidden px-4 py-20 lg:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">21st Century Technology</p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Technology နဲ့ IT ပညာရပ်တွေကို မြန်မာလို လွယ်ကူစွာ လေ့လာပါ
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-300">{brand.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/articles">ဆောင်းပါးများ ဖတ်ရန်</ButtonLink>
              <ButtonLink href="/courses" variant="secondary">သင်တန်းများ ကြည့်ရန်</ButtonLink>
              <ButtonLink href="/enrollment" variant="accent">အတန်းအပ်ရန်</ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-cyan-300/20 bg-slate-900/80 p-6 shadow-[0_0_60px_rgba(34,211,238,0.16)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [BookOpen, "Burmese Articles", "လက်တွေ့ကျတဲ့နည်းပညာဗဟုသုတ"],
                [ShieldCheck, "Cyber Safety", "နေ့စဉ် digital လုံခြုံရေး"],
                [Sparkles, "AI Learning", "အလုပ်အတွက် AI tools"],
                [BriefcaseBusiness, "IT Career", "Career path နှင့် interview"],
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <Icon className="h-7 w-7 text-cyan-200" />
                  <h3 className="mt-4 font-black">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Courses" title="Featured professional courses">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      </Section>

      <Section eyebrow="Schedule" title="Upcoming classes" className="bg-slate-900">
        <div className="grid gap-5 lg:grid-cols-3">{classes.map((item) => <ClassCard key={item.id} item={item} />)}</div>
      </Section>

      <Section eyebrow="Articles" title="Featured Burmese technology articles">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
      </Section>

      <Section eyebrow="Why 21CT" title="Professional learning for Burmese students and workers" className="bg-slate-900">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["Students", stats[0]],
            ["Courses", stats[1]],
            ["Articles", stats[2]],
            ["Enrollments", stats[3]],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-slate-950 p-6">
              <p className="text-4xl font-black text-cyan-200">{value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Instructors" title="Learn from practical technology professionals">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{instructors.map((instructor) => <InstructorCard key={instructor.id} instructor={instructor} />)}</div>
      </Section>

      <Section eyebrow="Testimonials" title="Student feedback" className="bg-slate-900">
        <div className="grid gap-5 lg:grid-cols-3">{testimonials.map((item) => <TestimonialCard key={item.id} item={item} />)}</div>
      </Section>

      <Section eyebrow="Community" title="Facebook audience growth and newsletter">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-slate-900 p-6">
            <ExternalLink className="h-8 w-8 text-cyan-200" />
            <h3 className="mt-4 text-2xl font-black">21CT Facebook page ကို follow လုပ်ပါ</h3>
            <p className="mt-3 leading-8 text-slate-300">နေ့စဉ် IT tips, class announcement နှင့် free learning content များကို Facebook မှာရယူနိုင်ပါတယ်။</p>
            <ButtonLink href={brand.facebookUrl} variant="accent" className="mt-5">Follow Facebook</ButtonLink>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900 p-6">
            <Users className="h-8 w-8 text-cyan-200" />
            <h3 className="mt-4 text-2xl font-black">FAQ preview</h3>
            <p className="mt-3 leading-8 text-slate-300">သင်တန်းအပ်နှံခြင်း၊ payment, certificate, online class စနစ်များအတွက် မေးလေ့ရှိသောမေးခွန်းများကို ဖတ်ရှုနိုင်ပါတယ်။</p>
            <ButtonLink href="/faq" variant="secondary" className="mt-5">View FAQ</ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}

async function getHomeData() {
  try {
    const [courses, classes, articles, instructors, testimonials, stats] = await Promise.all([
      prisma.course.findMany({ where: { status: "PUBLISHED", featured: true }, take: 4, include: { category: true, instructor: true } }),
      prisma.classSchedule.findMany({ where: { status: "OPEN_FOR_ENROLLMENT" }, take: 3, include: { course: true, instructor: true }, orderBy: { startDate: "asc" } }),
      prisma.article.findMany({ where: { status: "PUBLISHED", featured: true }, take: 4, include: { category: true, author: true }, orderBy: { publishedAt: "desc" } }),
      prisma.instructorProfile.findMany({ where: { featured: true }, take: 4 }),
      prisma.testimonial.findMany({ where: { approved: true }, take: 3, include: { course: true } }),
      Promise.all([prisma.user.count({ where: { role: "STUDENT" } }), prisma.course.count(), prisma.article.count(), prisma.enrollment.count()]),
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
