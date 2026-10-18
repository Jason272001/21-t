import Link from "next/link";
import { BookOpen, ArrowUpRight, CalendarDays } from "lucide-react";
import type { Enrollment, ClassSchedule, Course } from "@prisma/client";
import { studentCopy } from "@/lib/student-copy";
import { enumLabel } from "@/lib/portal-copy";
import type { Locale } from "@/lib/i18n";
export function StudentClasses({
  records,
  locale,
}: {
  records: (Enrollment & {
    classSchedule: ClassSchedule & { course: Pick<Course, "title" | "shortDescription"> };
  })[];
  locale: Locale;
}) {
  const t = studentCopy(locale);
  return records.length ? (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => {
        const klass = record.classSchedule,
          ready =
            ["CONFIRMED", "COMPLETED"].includes(record.status) && klass.status !== "CANCELLED";
        return (
          <article
            key={record.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-line/10 bg-surface"
          >
            <div className="flex h-28 items-center justify-between bg-accent/5 p-6">
              <span className="rounded-xl bg-surface p-3 text-accent">
                <BookOpen size={26} />
              </span>
              <span className="rounded-full border border-line/10 bg-surface px-3 py-1 text-xs font-semibold text-muted">
                {enumLabel(klass.status === "CANCELLED" ? "CANCELLED" : record.status, locale)}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-semibold text-accent">{klass.title}</p>
              <h2 className="mt-3 text-xl font-bold leading-8">{klass.course.title}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">
                {klass.course.shortDescription}
              </p>
              <div className="mt-5 flex items-start gap-2 text-xs leading-6 text-subtle">
                <CalendarDays size={16} className="mt-1 shrink-0" />
                <span>
                  {klass.startDate.toLocaleDateString(locale, { timeZone: klass.timezone })} ·{" "}
                  {klass.startTime}–{klass.endTime}
                  <br />
                  {klass.timezone}
                </span>
              </div>
              <Link
                href={
                  ready
                    ? `/student/classes/${klass.id}`
                    : `/enrollment/confirmation/${record.confirmationNumber}`
                }
                className="mt-6 flex min-h-11 items-center justify-between rounded-xl border border-line/15 px-4 text-sm font-semibold"
              >
                {ready ? t.open : t.confirm}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-line/20 bg-surface p-8 sm:p-12">
      <BookOpen className="mb-5 text-accent" size={30} />
      <h2 className="text-xl font-bold">{t.empty}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{t.emptyHint}</p>
      <Link
        href="/student/join"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950"
      >
        {t.join}
      </Link>
    </div>
  );
}
