import { requireUser } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { PortalShell } from "@/components/portal/shell";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLanguage } from "@/lib/i18n-server";
import { managementCopy } from "@/lib/management-copy";
import { enumLabel, portalCopy } from "@/lib/portal-copy";

export const metadata = { title: "My learning", robots: { index: false, follow: false } };

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await requireUser();
  const { locale } = await getLanguage();
  const t = portalCopy(locale);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentProfile: { userId: user.id } },
    include: { classSchedule: { include: { course: { select: { title: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <PortalShell
      title={t.student}
      description={t.studentIntro}
      name={user.name || user.email}
      locale={locale}
    >
      {(await searchParams).denied === "1" && (
        <p role="alert" className="mb-6 rounded-lg border border-orange-300/40 p-4 text-warning">
          {t.denied}
        </p>
      )}
      <div className="mb-8 flex flex-wrap gap-3">
        <ButtonLink href="/student/videos">{managementCopy(locale).library}</ButtonLink>
        <ButtonLink href="/courses">{t.browse}</ButtonLink>
      </div>
      {enrollments.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {enrollments.map((item) => (
            <article key={item.id} className="rounded-xl border border-line/10 bg-surface p-6">
              <StatusBadge
                label={enumLabel(item.status, locale)}
                tone={item.status === "CONFIRMED" ? "green" : "orange"}
              />
              <h2 className="mt-4 text-xl font-bold">{item.classSchedule.course.title}</h2>
              <p className="mt-2 text-muted">{item.classSchedule.title}</p>
              <p className="mt-2 text-sm text-subtle">
                {item.classSchedule.startDate.toLocaleDateString(locale, {
                  timeZone: item.classSchedule.timezone,
                })}{" "}
                · {item.classSchedule.startTime}–{item.classSchedule.endTime} (
                {item.classSchedule.timezone})
              </p>
              <ButtonLink
                className="mt-5"
                href={`/enrollment/confirmation/${item.confirmationNumber}`}
                variant="secondary"
              >
                {t.confirmation}
              </ButtonLink>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line/30 p-10 text-muted">
          {t.noLearning}
        </p>
      )}
    </PortalShell>
  );
}
