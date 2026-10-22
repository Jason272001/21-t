import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, UserRound } from "lucide-react";
import { prisma } from "@backend/lib/prisma";
import { getLanguage } from "@/lib/i18n-server";

// These four plans have been approved for public announcement. Other drafts stay private.
const announcements = [
  {
    slug: "21ct-computer-basics",
    guide: "computer-basics",
    en: "Build confidence with everyday computer tasks, files, office tools and safer online habits.",
    my: "နေ့စဉ်ကွန်ပျူတာအသုံးပြုခြင်း၊ ဖိုင်စီမံခြင်း၊ ရုံးသုံးအခြေခံနှင့် အွန်လိုင်းလုံခြုံရေးကို စတင်လေ့လာပါ။",
  },
  {
    slug: "21ct-network-fundamentals",
    guide: "network-fundamentals",
    en: "Understand connections, routers, switches, IP addresses and practical network troubleshooting.",
    my: "Router၊ switch၊ IP address နှင့် ကွန်ရက်ချိတ်ဆက်မှုကို နားလည်ပြီး ပြဿနာရှာဖွေခြင်းကို လေ့ကျင့်ပါ။",
  },
  {
    slug: "21ct-network-plus",
    guide: "network-plus",
    en: "Build on networking fundamentals with structured CompTIA Network+ preparation and practical scenarios.",
    my: "ကွန်ရက်အခြေခံမှတစ်ဆင့် CompTIA Network+ အတွက် စနစ်တကျ ပြင်ဆင်ပြီး လက်တွေ့ scenario များ လေ့ကျင့်ပါ။",
  },
  {
    slug: "21ct-python-machine-learning",
    guide: "python-machine-learning",
    en: "Start with Python, then explore data, introductory machine learning and a guided project.",
    my: "Python programming မှစတင်ပြီး data၊ machine learning အခြေခံနှင့် project တစ်ခုကို အဆင့်ဆင့် လေ့လာပါ။",
  },
] as const;

export async function UpcomingCourses() {
  const [{ locale }, courses] = await Promise.all([
    getLanguage(),
    prisma.course.findMany({
      where: { slug: { in: announcements.map((item) => item.slug) }, status: "DRAFT" },
      select: { slug: true, title: true, instructor: { select: { fullName: true, slug: true } } },
    }),
  ]);
  const my = locale === "my";
  if (!courses.length) return null;

  return (
    <div>
      <p className="mb-6 max-w-3xl text-base leading-8 text-muted">
        {my
          ? "နောက်လာမည့် သင်တန်းများအတွက် ပြင်ဆင်နေပါပြီ။ စတင်မည့်ရက်၊ အချိန်နှင့် သင်တန်းကြေးကို မကြာမီ ကြေညာပါမည်။ လက်ရှိတွင် သင်ရိုးကို ကြိုတင်လေ့လာနိုင်ပါသည်။"
          : "Our next classes are in preparation. Start dates, class times and fees will be announced soon. Explore the learning plans while enrollment is being prepared."}
      </p>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {announcements.map((item, index) => {
          const course = courses.find((course) => course.slug === item.slug);
          if (!course) return null;
          return (
            <article
              key={course.slug}
              className="flex flex-col rounded-2xl border border-cyan-300/20 bg-page p-6 shadow-lg shadow-card-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-accent">
                  {my ? "မကြာမီ ဖွင့်လှစ်မည်" : "Coming soon"}
                </span>
                <span className="text-sm font-black text-faint">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-black leading-8 text-foreground">{course.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted">{my ? item.my : item.en}</p>
              <div className="mt-6 grid gap-3 border-t border-line/10 pt-5 text-sm text-subtle">
                <p className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
                  {my ? "ရက်နှင့် သင်တန်းကြေး ကြေညာပေးပါမည်" : "Dates & fees to be announced"}
                </p>
                <p className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 shrink-0 text-accent" />
                  {my ? "သင်ရိုး ကြိုတင်လေ့လာနိုင်ပါသည်" : "Learning plan available"}
                </p>
                <Link
                  href={`/instructors/${course.instructor.slug}`}
                  className="flex items-center gap-2 font-semibold text-accent"
                >
                  <UserRound className="h-4 w-4 shrink-0" />
                  {course.instructor.fullName}
                </Link>
              </div>
              <Link
                href={`/articles/${item.guide}-30-video-course-plan`}
                className="mt-6 inline-flex items-center justify-between gap-3 rounded-lg border border-line/15 px-4 py-3 text-sm font-bold text-foreground transition hover:border-cyan-300/50 hover:text-accent"
              >
                {my ? "သင်ရိုးကို ကြည့်ရန်" : "Explore the course plan"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
