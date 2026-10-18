"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  GraduationCap,
  FileText,
  KeyRound,
  ShieldCheck,
  Video,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { canManage, type AdminArea } from "@backend/lib/admin-permissions";
import { logoutAction } from "@backend/actions/account";
import { LanguageSelector } from "@/components/layout/language-selector";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { workspaceCopy } from "@/lib/workspace-copy";
import type { Locale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
export function AdminFrame({
  children,
  locale,
  theme,
  name,
  level,
}: {
  children: React.ReactNode;
  locale: Locale;
  theme: Theme;
  name: string;
  level: string | null;
}) {
  const t = workspaceCopy(locale),
    path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/admin", label: t.dashboard, icon: LayoutDashboard },
    ...(
      [
        ["students", t.students, Users],
        ["courses", t.courses, BookOpen],
        ["classes", t.classes, CalendarDays],
        ["instructors", t.instructors, GraduationCap],
        ["articles", t.articles, FileText],
        ["codes", t.codes, KeyRound],
        ["videos", t.videos, Video],
        ["team", t.team, ShieldCheck],
      ] as const
    )
      .filter(([area]) => canManage(level, area as AdminArea))
      .map(([area, label, icon]) => ({ href: `/admin/${area}`, label, icon })),
  ];
  const levelLabel = level === "OWNER" ? t.owner : level === "MANAGER" ? t.manager : t.staff;
  return (
    <div className="min-h-screen bg-page text-foreground lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/10 bg-surface lg:flex">
        <Link href="/admin" className="flex items-center gap-3 border-b border-line/10 px-6 py-7">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 font-black text-slate-950">
            21
          </span>
          <span>
            <span className="block text-xl font-black tracking-tight">21CT</span>
            <span className="text-xs text-subtle">{t.workspace}</span>
          </span>
        </Link>
        <p className="px-6 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.2em] text-subtle">
          {t.workspace}
        </p>
        <nav aria-label={t.workspace} className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {links.map((item) => {
            const active = item.href === "/admin" ? path === item.href : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-accent/10 text-accent" : "text-muted hover:bg-overlay/5 hover:text-foreground"}`}
              >
                <item.icon size={19} />
                <span>{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line/10 p-5">
          <p className="truncate font-semibold">{name}</p>
          <p className="mt-1 text-xs text-subtle">{levelLabel}</p>
          <form action={logoutAction.bind(null, true)}>
            <button className="mt-4 flex min-h-11 items-center gap-2 text-sm text-muted">
              <LogOut size={16} />
              {t.signOut}
            </button>
          </form>
        </div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-line/10 bg-surface/95 backdrop-blur">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label={locale === "en" ? "Admin menu" : "စီမံသူမီနူး"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="rounded-xl border border-line/10 p-2.5 lg:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <p className="text-sm font-semibold">{t.workspace}</p>
              <p className="mt-1 text-xs text-subtle">21CT · {levelLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} />
            <ThemeToggle theme={theme} locale={locale} />
            <Link href="/" className="ml-2 hidden items-center gap-2 text-sm text-muted sm:flex">
              {t.visit}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        {open && (
          <nav
            aria-label="Mobile admin"
            className="grid grid-cols-2 gap-2 border-t border-line/10 px-4 pb-4 pt-3 lg:hidden"
          >
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-overlay/5 px-3 py-3 text-sm font-semibold"
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction.bind(null, true)}>
              <button className="px-3 py-3 text-sm">{t.signOut}</button>
            </form>
          </nav>
        )}
      </header>
      <main id="admin-content" className="mx-auto w-full max-w-[1500px] p-4 py-7 sm:p-7 lg:p-10">
        {children}
      </main>
    </div>
  );
}
