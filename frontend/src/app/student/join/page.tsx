import { KeyRound } from "lucide-react";
import { requireStudent } from "@backend/lib/access";
import { joinClassAction } from "@backend/actions/student";
import { getLanguage } from "@/lib/i18n-server";
import { studentCopy } from "@/lib/student-copy";
import { ActionForm } from "@/components/forms/action-form";
export default async function Page() {
  await requireStudent();
  const { locale } = await getLanguage(),
    t = studentCopy(locale);
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-line/10 bg-surface p-6 sm:p-10">
      <span className="mb-6 inline-flex rounded-2xl bg-accent/10 p-4 text-accent">
        <KeyRound size={28} />
      </span>
      <h1 className="text-3xl font-bold">{t.join}</h1>
      <p className="my-5 text-sm leading-7 text-muted">{t.joinHint}</p>
      <ActionForm action={joinClassAction} submitLabel={t.join}>
        <label className="grid gap-2 text-sm font-semibold">
          {t.code}
          <input
            name="classCode"
            required
            maxLength={40}
            autoComplete="off"
            spellCheck={false}
            placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX"
            className="min-h-12 w-full rounded-xl border border-line/20 bg-page p-3 font-mono text-sm uppercase text-foreground"
          />
        </label>
      </ActionForm>
    </section>
  );
}
