import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { workspaceCopy } from "@/lib/workspace-copy";
import { enumLabel } from "@/lib/portal-copy";
import { PortalShell } from "./shell";
type Kind = "courses" | "classes" | "instructors" | "team";
export async function WorkspaceCatalog({ kind, page = 1 }: { kind: Kind; page?: number }) {
  const { user, locale } = await adminContext(kind),
    t = workspaceCopy(locale);
  page = Math.floor(Math.max(1, Math.min(10000, page || 1)));
  const paging = { take: 51, skip: (page - 1) * 50 };
  let rows: { id: string; title: string; detail: string; badge: string }[] = [];
  if (kind === "courses")
    rows = (
      await prisma.course.findMany({
        ...paging,
        orderBy: { updatedAt: "desc" },
        include: { instructor: true, _count: { select: { classSchedules: true } } },
      })
    ).map((r) => ({
      id: r.id,
      title: r.title,
      detail: `${r.instructor.fullName} · ${r._count.classSchedules} ${t.classes}`,
      badge: enumLabel(r.status, locale),
    }));
  if (kind === "classes")
    rows = (
      await prisma.classSchedule.findMany({
        ...paging,
        orderBy: { startDate: "asc" },
        include: { course: true },
      })
    ).map((r) => ({
      id: r.id,
      title: r.title,
      detail: `${r.course.title} · ${r.startDate.toLocaleDateString(locale, { timeZone: r.timezone })} · ${r.currentEnrolled}/${r.maxStudents}`,
      badge: enumLabel(r.status, locale),
    }));
  if (kind === "instructors")
    rows = (
      await prisma.instructorProfile.findMany({
        ...paging,
        where: { user: { role: "INSTRUCTOR" } },
        orderBy: { fullName: "asc" },
        include: { _count: { select: { courses: true } } },
      })
    ).map((r) => ({
      id: r.id,
      title: r.fullName,
      detail: r.jobTitle,
      badge: `${r._count.courses} ${t.courses}`,
    }));
  if (kind === "team")
    rows = (
      await prisma.user.findMany({
        ...paging,
        where: {
          role: "ADMIN",
          ...(user.adminLevel === "MANAGER" ? { adminLevel: "STAFF" as const } : {}),
        },
        orderBy: { createdAt: "desc" },
      })
    ).map((r) => ({
      id: r.id,
      title: r.name || r.email,
      detail: r.email,
      badge: `${r.adminLevel === "OWNER" ? t.owner : r.adminLevel === "MANAGER" ? t.manager : t.staff} · ${r.isActive ? (locale === "en" ? "Active" : "ဖွင့်ထား") : locale === "en" ? "Disabled" : "ပိတ်ထား"}`,
    }));
  const canCreate = kind !== "team" || user.adminLevel === "OWNER" || user.adminLevel === "MANAGER";
  return (
    <PortalShell title={t[kind]} name={user.name || user.email} locale={locale} admin>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm text-muted">
          {kind === "team" ? t.managerHint : "21CT · " + t[kind]}
        </p>
        {canCreate && (
          <Link
            href={`/admin/${kind}/new`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950"
          >
            <Plus size={17} />
            {kind === "team"
              ? user.adminLevel === "OWNER"
                ? t.newAdmin
                : locale === "en"
                  ? "Add Staff account"
                  : "ဝန်ထမ်းအကောင့် ဖန်တီးရန်"
              : kind === "instructors"
                ? t.newInstructor
                : t.create}
          </Link>
        )}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.slice(0, 50).map((row) => (
          <Link
            key={row.id}
            href={`/admin/${kind}/${row.id}/edit`}
            className="group flex min-w-0 items-start gap-4 rounded-2xl border border-line/10 bg-surface p-6 transition hover:border-accent/40"
          >
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-md bg-overlay/5 px-2 py-1 text-[11px] font-semibold text-subtle">
                {row.badge}
              </span>
              <h2 className="mt-4 break-words text-lg font-bold group-hover:text-accent">
                {row.title}
              </h2>
              <p className="mt-2 break-words text-sm leading-6 text-muted">{row.detail}</p>
              <p className="mt-5 text-sm font-semibold text-accent">{t.edit}</p>
            </div>
            <ArrowUpRight className="mt-1 shrink-0 text-subtle" size={18} />
          </Link>
        ))}
      </div>
      {!rows.length && (
        <p className="rounded-2xl border border-dashed border-line/20 p-10 text-sm text-muted">
          {t.empty}
        </p>
      )}
      <nav aria-label="Pagination" className="mt-7 flex gap-6 text-sm text-accent">
        {page > 1 && (
          <Link href={`?page=${page - 1}`}>{locale === "en" ? "Previous" : "ရှေ့သို့"}</Link>
        )}
        {rows.length > 50 && (
          <Link href={`?page=${page + 1}`}>{locale === "en" ? "Next" : "နောက်သို့"}</Link>
        )}
      </nav>
    </PortalShell>
  );
}
