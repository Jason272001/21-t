import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  BookOpen,
  CalendarDays,
  FileText,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@backend/lib/access";
import { canManage } from "@backend/lib/admin-permissions";
import { prisma } from "@backend/lib/prisma";
import { getLanguage } from "@/lib/i18n-server";
import { workspaceCopy } from "@/lib/workspace-copy";
export const metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await requireAdmin(),
    { locale } = await getLanguage(),
    t = workspaceCopy(locale),
    content = canManage(user.adminLevel, "courses");
  const [students, articles, courses, classes, codes, staff] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.article.count(),
    content ? prisma.course.count() : 0,
    content ? prisma.classSchedule.count() : 0,
    content
      ? prisma.classAccessCode.count({
          where: { revokedAt: null, redeemedAt: null, expiresAt: { gt: new Date() } },
        })
      : 0,
    user.adminLevel === "MANAGER"
      ? prisma.user.count({ where: { role: "ADMIN", adminLevel: "STAFF" } })
      : 0,
  ]);
  const metrics = [
    { label: t.students, value: students, href: "students", icon: Users },
    { label: t.articles, value: articles, href: "articles", icon: FileText },
    ...(content
      ? [
          { label: t.courses, value: courses, href: "courses", icon: BookOpen },
          { label: t.classes, value: classes, href: "classes", icon: CalendarDays },
        ]
      : []),
    ...(user.adminLevel === "MANAGER"
      ? [{ label: t.staff, value: staff, href: "team", icon: ShieldCheck }]
      : []),
  ];
  const quick = [
    {
      label: t.students,
      href: "students/new",
      description:
        locale === "en"
          ? "Create and manage student accounts."
          : "သင်တန်းသားအကောင့်များ ဖန်တီး၊ ပြင်ဆင်ပါ။",
      icon: Users,
    },
    {
      label: t.articles,
      href: "articles/new",
      description:
        locale === "en"
          ? "Write your next update or lesson."
          : "သတင်းနှင့် ဆောင်းပါးများ ရေးသားပါ။",
      icon: FileText,
    },
    ...(content
      ? [
          {
            label: t.codes,
            href: "codes",
            description:
              locale === "en"
                ? "Verify payment, then issue a one-use class code."
                : "ငွေပေးချေမှု စစ်ပြီး တစ်ကြိမ်သုံးကုဒ် ထုတ်ပါ။",
            icon: KeyRound,
          },
          {
            label: t.classes,
            href: "classes",
            description:
              locale === "en"
                ? "Organize schedules and your next batch."
                : "အချိန်ဇယားနှင့် လာမည့်အတန်းများ စီမံပါ။",
            icon: CalendarDays,
          },
        ]
      : []),
  ];
  return (
    <div>
      {(await searchParams).denied && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-warning/30 p-4 text-sm text-warning"
        >
          {t.denied}
        </p>
      )}
      <div className="mb-9 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">
            21CT / {t.dashboard}
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
            {t.welcome}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{t.intro}</p>
        </div>
        <p className="rounded-full border border-line/10 bg-surface px-4 py-2 text-xs text-subtle">
          {new Date().toLocaleDateString(locale, {
            timeZone: "Asia/Yangon",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Link
            key={item.href}
            href={`/admin/${item.href}`}
            className="rounded-2xl border border-line/10 bg-surface p-6 transition hover:border-accent/40"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-accent/10 p-3 text-accent">
                <item.icon size={21} />
              </span>
              <ArrowUpRight size={16} className="text-subtle" />
            </div>
            <p className="mt-6 text-4xl font-bold tracking-tight">
              {item.value.toLocaleString(locale)}
            </p>
            <p className="mt-2 text-sm text-muted">{item.label}</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-5 text-lg font-bold">
        {locale === "en" ? "What would you like to do?" : "ဘာလုပ်ဆောင်လိုပါသလဲ။"}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {quick.map((item) => (
          <Link
            key={item.href}
            href={`/admin/${item.href}`}
            className="flex gap-4 rounded-2xl border border-line/10 bg-surface p-6 transition hover:bg-overlay/5"
          >
            <span className="h-fit rounded-xl bg-overlay/5 p-3 text-accent">
              <item.icon size={21} />
            </span>
            <div className="flex-1">
              <h3 className="font-semibold">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            </div>
            <ArrowUpRight size={17} className="shrink-0 text-subtle" />
          </Link>
        ))}
      </div>
      {content && (
        <div className="mt-7 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <div>
            <p className="text-sm font-semibold">
              {t.reserved}: {codes}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{t.codeHint}</p>
          </div>
          <Link
            href="/admin/codes"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950"
          >
            <KeyRound size={16} />
            {t.generate}
          </Link>
        </div>
      )}
    </div>
  );
}
