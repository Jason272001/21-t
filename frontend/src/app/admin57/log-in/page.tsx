import { redirect } from "next/navigation";
import { getCurrentUser, backendConfigured } from "@backend/lib/access";
import { LoginForm } from "@/components/forms/login-form";
import { getLanguage } from "@/lib/i18n-server";
export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; invited?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  const { locale } = await getLanguage();
  const query = await searchParams;
  return (
    <main className="bg-page px-4 py-16 text-foreground">
      <section className="mx-auto max-w-md rounded-xl border border-line/10 bg-surface p-8">
        <p className="text-sm font-bold text-accent">21CT • Administration</p>
        <h1 className="mt-4 text-3xl font-black">
          {locale === "en" ? "Admin sign in" : "စီမံသူ အကောင့်ဝင်ရန်"}
        </h1>
        {query.updated && (
          <p role="status" className="mt-5 text-sm leading-7 text-success">
            {locale === "en"
              ? "Password changed. Sign in with your new password."
              : "စကားဝှက် ပြောင်းပြီးပါပြီ။ စကားဝှက်အသစ်ဖြင့် ပြန်ဝင်ပါ။"}
          </p>
        )}
        {query.invited && (
          <p role="status" className="mt-5 text-sm leading-7 text-success">
            {locale === "en"
              ? "Your admin account is ready. Sign in with the details you just chose."
              : "သင့်စီမံသူအကောင့် အဆင်သင့်ဖြစ်ပါပြီ။ သင်သတ်မှတ်ထားသည့် အချက်အလက်များဖြင့် ဝင်ပါ။"}
          </p>
        )}
        {backendConfigured() ? (
          <LoginForm locale={locale} admin />
        ) : (
          <p className="mt-6">Account access is not configured.</p>
        )}
      </section>
    </main>
  );
}
