"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  KeyRound,
  Video,
  LayoutDashboard,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logoutAction } from "@backend/actions/account";
import { studentCopy } from "@/lib/student-copy";
import type { Locale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
export function StudentFrame({
  children,
  locale,
  theme,
  name,
}: {
  children: React.ReactNode;
  locale: Locale;
  theme: Theme;
  name: string;
}) {
  const t = studentCopy(locale),
    path = usePathname();
  const links = [
    { href: "/student", label: t.overview, icon: LayoutDashboard },
    { href: "/student/classes", label: t.classes, icon: CalendarDays },
    { href: "/student/videos", label: t.videos, icon: Video },
    { href: "/student/join", label: t.join, icon: KeyRound },
  ];
  return (
    <div className="min-h-screen bg-page text-foreground">
      <header className="border-b border-line/10 bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-7">
          <Link href="/student" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
              <BookOpen size={22} />
            </span>
            <span>
              <span className="block text-xl font-black">21CT</span>
              <span className="text-xs text-subtle">{t.workspace}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} />
            <ThemeToggle theme={theme} locale={locale} />
            <form action={logoutAction.bind(null, false)}>
              <button
                aria-label={t.signOut}
                title={t.signOut}
                className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-line/20"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-line/5">
          <nav
            aria-label={t.workspace}
            className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-2 sm:flex sm:flex-wrap sm:px-7"
          >
            {links.map((item) => {
              const active =
                item.href === "/student" ? path === item.href : path.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-accent/10 text-accent" : "text-muted hover:bg-overlay/5"}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="ml-auto hidden items-center gap-2 px-3 text-sm text-muted md:flex"
            >
              {t.website}
              <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 sm:py-10">
        <p className="mb-6 text-xs text-subtle">
          {name} · {t.learning}
        </p>
        {children}
      </main>
      <footer className="mx-auto max-w-7xl px-4 py-8 text-xs text-subtle sm:px-7">
        21CT · {t.contact}
      </footer>
    </div>
  );
}
