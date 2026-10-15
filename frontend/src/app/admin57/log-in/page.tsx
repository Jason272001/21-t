import { redirect } from "next/navigation";
import { getCurrentUser, backendConfigured } from "@backend/lib/access";
import { LoginForm } from "@/components/forms/login-form";
import { getLanguage } from "@/lib/i18n-server";
export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export default async function AdminLogin() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  const { locale } = await getLanguage();
  return (
    <main className="bg-page px-4 py-16 text-foreground">
      <section className="mx-auto max-w-md rounded-xl border border-line/10 bg-surface p-8">
        <p className="text-sm font-bold text-accent">21CT • Administration</p>
        <h1 className="mt-4 text-3xl font-black">
          {locale === "en" ? "Admin sign in" : "စီမံသူ အကောင့်ဝင်ရန်"}
        </h1>
        {backendConfigured() ? (
          <LoginForm locale={locale} admin />
        ) : (
          <p className="mt-6">Account access is not configured.</p>
        )}
      </section>
    </main>
  );
}
