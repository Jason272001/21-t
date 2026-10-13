"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { dictionaries, localeCookie, resolveLocale, type Locale } from "@/lib/i18n";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line/20 bg-surface px-2 text-foreground focus-within:ring-2 focus-within:ring-accent">
      <Languages aria-hidden="true" className="h-4 w-4 text-accent" />
      <span className="sr-only">{dictionaries[locale].nav.language}</span>
      <select
        value={locale}
        disabled={pending}
        aria-busy={pending}
        onChange={(event) => {
          const nextLocale = resolveLocale(event.target.value);
          const secure = window.location.protocol === "https:" ? "; Secure" : "";
          document.cookie = `${localeCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
          startTransition(() => router.refresh());
        }}
        className="min-h-11 max-w-28 cursor-pointer rounded-lg bg-surface text-sm font-semibold outline-none disabled:cursor-wait disabled:opacity-60"
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="my" lang="my">
          မြန်မာ
        </option>
      </select>
    </label>
  );
}
