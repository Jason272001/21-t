"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { dictionaries, type Locale } from "@/lib/i18n";
import { themeCookie, type Theme } from "@/lib/theme";

export function ThemeToggle({ theme, locale }: { theme: Theme; locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = dictionaries[locale].nav[nextTheme === "light" ? "lightMode" : "darkMode"];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${themeCookie}=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
        document.documentElement.dataset.theme = nextTheme;
        startTransition(() => router.refresh());
      }}
      className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-line/20 bg-surface text-foreground transition-colors hover:bg-overlay/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="h-5 w-5" />
      ) : (
        <Moon aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
}
