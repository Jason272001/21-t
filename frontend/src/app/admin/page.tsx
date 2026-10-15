import Link from "next/link";
import { requireAdmin } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { PortalShell } from "@/components/portal/shell";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLanguage } from "@/lib/i18n-server";
import { managementCopy } from "@/lib/management-copy";
import { enumLabel, portalCopy } from "@/lib/portal-copy";

export const metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await requireAdmin();
  const { locale } = await getLanguage();
  const t = portalCopy(locale);
  const m = managementCopy(locale);
  const [courses, classes, enrollments, studentCount, enrollmentCount] = await Promise.all([
    prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { classSchedules: true } } },
    }),
    prisma.classSchedule.findMany({
      orderBy: { startDate: "asc" },
      include: { course: { select: { title: true } } },
    }),
    prisma.enrollment.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: { include: { user: { select: { name: true, email: true } } } },
        classSchedule: { select: { title: true } },
      },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count(),
  ]);
  return (
    <PortalShell
      title={t.admin}
      description={t.adminIntro}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t.courses, courses.length],
          [t.classes, classes.length],
          [t.students, studentCount],
          [t.enrollments, enrollmentCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line/10 bg-surface p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-3 text-3xl font-black text-accent">{value}</p>
          </div>
        ))}
      </div>
      <div className="mb-10 flex flex-wrap gap-3">
        <ButtonLink href="/admin/students/new">{m.createStudent}</ButtonLink>
        <ButtonLink href="/admin/articles/new">{m.createArticle}</ButtonLink>
        <ButtonLink href="/admin/videos/new">{m.createVideo}</ButtonLink>
        <ButtonLink href="/admin/courses/new">{t.newCourse}</ButtonLink>
        {courses.length > 0 && (
          <ButtonLink href="/admin/classes/new" variant="accent">
            {t.newClass}
          </ButtonLink>
        )}
      </div>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{t.courses}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-xl border border-line/10 bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">{course.title}</h3>
                <StatusBadge
                  label={enumLabel(course.status, locale)}
                  tone={course.status === "PUBLISHED" ? "green" : "slate"}
                />
              </div>
              <p className="mt-2 text-sm text-muted">
                {course._count.classSchedules} {t.classes}
              </p>
              <div className="mt-4 flex gap-4 text-sm font-bold text-accent">
                <Link href={`/admin/courses/${course.id}/edit`}>{t.edit}</Link>
                {course.status === "PUBLISHED" && (
                  <Link href={`/courses/${course.slug}`}>{t.view}</Link>
                )}
                <Link href={`/admin/classes/new?courseId=${course.id}`}>{t.newClass}</Link>
              </div>
            </article>
          ))}
        </div>
        {!courses.length && <Empty>{t.emptyCourses}</Empty>}
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{t.classes}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((klass) => (
            <article key={klass.id} className="rounded-xl border border-line/10 bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">{klass.title}</h3>
                <StatusBadge label={enumLabel(klass.status, locale)} />
              </div>
              <p className="mt-2 text-sm text-muted">{klass.course.title}</p>
              <p className="mt-2 text-sm text-muted">
                {klass.startDate.toLocaleDateString(locale, { timeZone: klass.timezone })} ·{" "}
                {klass.startTime} · {klass.timezone}
              </p>
              <p className="mt-2 text-sm">
                {t.seats}: {klass.currentEnrolled} / {klass.maxStudents}
              </p>
              <Link
                className="mt-4 inline-flex text-sm font-bold text-accent"
                href={`/admin/classes/${klass.id}/edit`}
              >
                {t.edit}
              </Link>
            </article>
          ))}
        </div>
        {!classes.length && <Empty>{t.emptyClasses}</Empty>}
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-bold">{t.recent}</h2>
        {enrollments.length ? (
          <div className="overflow-x-auto rounded-xl border border-line/10 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line/10 text-subtle">
                <tr>
                  {[t.name, t.email, t.classes, t.status].map((label) => (
                    <th key={label} className="p-4">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((item) => (
                  <tr key={item.id} className="border-b border-line/10 last:border-0">
                    <td className="p-4">{item.studentProfile.user.name}</td>
                    <td className="p-4">{item.studentProfile.user.email}</td>
                    <td className="p-4">{item.classSchedule.title}</td>
                    <td className="p-4">
                      <Link
                        className="text-accent"
                        href={`/enrollment/confirmation/${item.confirmationNumber}`}
                      >
                        {enumLabel(item.status, locale)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>{t.emptyEnrollments}</Empty>
        )}
      </section>
    </PortalShell>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line/30 p-8 text-muted">{children}</p>
  );
}
