"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { portalCopy } from "@/lib/portal-copy";
import type { Locale } from "@/lib/i18n";

export function LoginForm({ locale, admin = false }: { locale: Locale; admin?: boolean }) {
  const router = useRouter();
  const t = portalCopy(locale);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="mt-6 grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const form = new FormData(event.currentTarget);
        setError(false);
        setPending(true);
        try {
          const result = await signIn(admin ? "admin-credentials" : "student-credentials", {
            email: form.get("email"),
            password: form.get("password"),
            redirect: false,
          });
          if (!result || result.error) {
            setError(true);
            setPending(false);
            return;
          }
          router.replace(admin ? "/admin" : "/student");
          router.refresh();
        } catch {
          setError(true);
          setPending(false);
        }
      }}
    >
      <label className="grid gap-2 text-sm font-semibold">
        {admin
          ? locale === "en"
            ? "Admin username or email"
            : "စီမံသူ အမည် သို့မဟုတ် အီးမေးလ်"
          : t.email}
        <input
          name="email"
          type={admin ? "text" : "email"}
          autoComplete="username"
          required
          className="min-h-11 rounded-lg border border-line/10 bg-page px-3 text-foreground"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        {t.password}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-11 rounded-lg border border-line/10 bg-page px-3 text-foreground"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-warning">
          {t.loginError}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"
      >
        {pending ? t.loggingIn : t.login}
      </button>
      {!admin && (
        <Link href="/register" className="text-sm font-semibold text-accent">
          {t.register}
        </Link>
      )}
    </form>
  );
}
