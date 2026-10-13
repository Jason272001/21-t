"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { LanguageSelector } from "@/components/layout/language-selector";
import { dictionaries, type Locale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { Theme } from "@/lib/theme";

export function Header({ locale, theme }: { locale: Locale; theme: Theme }) {
  const [open, setOpen] = useState(false);
  const { nav: labels } = dictionaries[locale];
  const nav = [
    [labels.home, "/"],
    [labels.articles, "/articles"],
    [labels.courses, "/courses"],
    [labels.schedule, "/schedule"],
    [labels.instructors, "/instructors"],
    [labels.about, "/about"],
    [labels.contact, "/contact"],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-line/10 bg-page/90 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <Logo compact />
        <nav aria-label={labels.mainNavigation} className="hidden items-center gap-4 2xl:flex">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap text-sm font-semibold text-muted hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSelector locale={locale} />
          <ThemeToggle theme={theme} locale={locale} />
          <div className="hidden items-center gap-2 2xl:flex">
            <ButtonLink href="/portal" variant="secondary">
              {locale === "en" ? "My portal" : "ကျွန်ုပ်၏စာမျက်နှာ"}
            </ButtonLink>
            <ButtonLink href="/enrollment" variant="accent">
              {labels.enroll}
            </ButtonLink>
          </div>
          <button
            aria-label={open ? labels.closeMenu : labels.openMenu}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="min-h-11 min-w-11 rounded-lg border border-line/10 p-2 text-foreground 2xl:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <div
          id="mobile-navigation"
          className="border-t border-line/10 bg-page px-4 py-4 2xl:hidden"
        >
          <nav aria-label={labels.mainNavigation} className="grid gap-3">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-overlay/10"
              >
                {label}
              </Link>
            ))}
            <ButtonLink href="/portal" variant="secondary">
              {locale === "en" ? "My portal" : "ကျွန်ုပ်၏စာမျက်နှာ"}
            </ButtonLink>
            <ButtonLink href="/enrollment" variant="accent">
              {labels.enroll}
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
