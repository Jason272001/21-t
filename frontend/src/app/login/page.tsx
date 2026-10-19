import { redirect } from "next/navigation";
import { backendConfigured, getCurrentUser, portalPath } from "@backend/lib/access";
import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/ui/logo";
import { getLanguage } from "@/lib/i18n-server";
import { portalCopy } from "@/lib/portal-copy";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; updated?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(portalPath(user.role));
  const { locale } = await getLanguage();
  const t = portalCopy(locale);
  const params = await searchParams;
  return (
    <main className="bg-page px-4 py-16 text-foreground">
      <section className="mx-auto max-w-md rounded-lg border border-line/10 bg-surface p-6">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">
          {locale === "en" ? "Student sign in" : "သင်တန်းသား အကောင့်ဝင်ရန်"}
        </h1>
        <p className="mt-2 text-sm text-muted">{t.loginHint}</p>
        {params.registered ? (
          <p role="status" className="mt-4 text-accent">
            {t.registered}
          </p>
        ) : null}
        {params.updated && (
          <p role="status" className="mt-4 text-accent">
            {locale === "en"
              ? "Password changed. Sign in with your new password."
              : "စကားဝှက် ပြောင်းပြီးပါပြီ။ စကားဝှက်အသစ်ဖြင့် ပြန်ဝင်ပါ။"}
          </p>
        )}
        {backendConfigured() ? (
          <LoginForm locale={locale} />
        ) : (
          <p className="mt-6 text-warning">{t.unavailable}</p>
        )}
      </section>
    </main>
  );
}
