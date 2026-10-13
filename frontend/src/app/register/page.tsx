import { backendConfigured } from "@backend/lib/access";
import { getLanguage } from "@/lib/i18n-server";
import { portalCopy } from "@/lib/portal-copy";
import { registerAction } from "@backend/actions/public";
import { ActionForm } from "@/components/forms/action-form";
import { TextField } from "@/components/forms/fields";
import { Logo } from "@/components/ui/logo";

export default async function RegisterPage() {
  const { locale } = await getLanguage();
  const t = portalCopy(locale);
  return (
    <main className="bg-page px-4 py-16 text-foreground">
      <section className="mx-auto max-w-md rounded-lg border border-line/10 bg-surface p-6">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">{t.register}</h1>
        <p className="mt-3 text-sm text-muted">{t.registerHint}</p>
        <div className="mt-6">
          {backendConfigured() ? (
            <ActionForm action={registerAction} submitLabel={t.register}>
              <TextField name="name" label={t.fullName} required />
              <TextField name="email" label={t.email} type="email" required />
              <TextField name="password" label={t.password} type="password" required />
            </ActionForm>
          ) : (
            <p>{t.unavailable}</p>
          )}
        </div>
      </section>
    </main>
  );
}
