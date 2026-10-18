import Link from "next/link";
import { BookOpen, CircleCheck, Video, KeyRound, CalendarDays, ArrowUpRight } from "lucide-react";
import { requireStudent } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { availableVideos } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { studentCopy } from "@/lib/student-copy";
import { StudentClasses } from "@/components/portal/student-classes";
export default async function Page() {
  const user = await requireStudent(),
    { locale } = await getLanguage(),
    t = studentCopy(locale),
    now = new Date();
  const where = { studentProfile: { userId: user.id } };
  const [records, active, completed, videos, next] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: {
        classSchedule: { include: { course: { select: { title: true, shortDescription: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.enrollment.count({
      where: {
        ...where,
        status: "CONFIRMED",
        classSchedule: { status: { notIn: ["CANCELLED", "COMPLETED"] }, endDate: { gt: now } },
      },
    }),
    prisma.enrollment.count({
      where: {
        ...where,
        OR: [
          { status: "COMPLETED" },
          { status: "CONFIRMED", classSchedule: { status: "COMPLETED" } },
        ],
      },
    }),
    prisma.video.count({ where: availableVideos(user.id) }),
    prisma.enrollment.findFirst({
      where: {
        ...where,
        status: "CONFIRMED",
        classSchedule: {
          startDate: { gt: now },
          status: {
            in: ["UPCOMING", "OPEN_FOR_ENROLLMENT", "IN_PROGRESS", "FULL", "ENROLLMENT_CLOSED"],
          },
        },
      },
      include: { classSchedule: { include: { course: { select: { title: true } } } } },
      orderBy: { classSchedule: { startDate: "asc" } },
    }),
  ]);
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">
            21CT / {t.learning}
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
            {t.welcome}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">{t.intro}</p>
        </div>
        <Link
          href="/student/join"
          className="flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950"
        >
          <KeyRound size={16} />
          {t.join}
        </Link>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: t.active, value: active, icon: BookOpen },
          { label: t.completed, value: completed, icon: CircleCheck },
          { label: t.available, value: videos, icon: Video },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-2xl border border-line/10 bg-surface p-5"
          >
            <span className="rounded-xl bg-accent/10 p-3 text-accent">
              <item.icon size={22} />
            </span>
            <div>
              <p className="text-3xl font-bold">{item.value.toLocaleString(locale)}</p>
              <p className="mt-1 text-xs text-muted">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      {next && (
        <Link
          href={`/student/classes/${next.classScheduleId}`}
          className="mb-9 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-accent/20 bg-accent/5 p-6"
        >
          <div className="flex gap-4">
            <CalendarDays className="shrink-0 text-accent" size={23} />
            <div>
              <p className="text-xs font-semibold text-accent">{t.next}</p>
              <h2 className="mt-2 font-bold">{next.classSchedule.course.title}</h2>
              <p className="mt-2 text-sm text-muted">
                {next.classSchedule.startDate.toLocaleDateString(locale, {
                  timeZone: next.classSchedule.timezone,
                })}{" "}
                · {next.classSchedule.startTime} · {next.classSchedule.timezone}
              </p>
            </div>
          </div>
          <ArrowUpRight size={19} />
        </Link>
      )}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{t.classes}</h2>
        <Link href="/student/classes" className="text-sm font-semibold text-accent">
          {t.all}
        </Link>
      </div>
      <StudentClasses records={records} locale={locale} />
    </div>
  );
}
