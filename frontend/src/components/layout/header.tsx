"use client";

import Link from "next/link";
import { Menu, Moon, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

const nav = [
  ["Home", "/"],
  ["ဆောင်းပါးများ", "/articles"],
  ["သင်တန်းများ", "/courses"],
  ["Class Schedule", "/schedule"],
  ["Instructors", "/instructors"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-semibold text-slate-300 hover:text-cyan-200">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <button aria-label="Toggle theme" className="rounded-lg border border-white/10 p-2 text-slate-200">
            <Moon className="h-4 w-4" />
          </button>
          <ButtonLink href="/login" variant="secondary">Login</ButtonLink>
          <ButtonLink href="/enrollment" variant="accent">အတန်းအပ်ရန်</ButtonLink>
        </div>
        <button
          aria-label="Open menu"
          className="rounded-lg border border-white/10 p-2 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 lg:hidden">
          <nav className="grid gap-3">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10">
                {label}
              </Link>
            ))}
            <ButtonLink href="/login" variant="secondary">Login</ButtonLink>
            <ButtonLink href="/enrollment" variant="accent">အတန်းအပ်ရန်</ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
