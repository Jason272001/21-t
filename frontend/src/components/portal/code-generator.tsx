"use client";
import { useActionState, useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { issueCodeAction, type CodeState } from "@backend/actions/workspace";
import { workspaceCopy } from "@/lib/workspace-copy";
import type { Locale } from "@/lib/i18n";
export function CodeGenerator({
  classes,
  locale,
}: {
  classes: { id: string; label: string }[];
  locale: Locale;
}) {
  const t = workspaceCopy(locale),
    [state, action, pending] = useActionState<CodeState, FormData>(issueCodeAction, {
      ok: false,
      message: "",
    });
  const [copied, setCopied] = useState<string | null>(null),
    [copyError, setCopyError] = useState(false);
  const field = "min-h-11 w-full rounded-xl border border-line/20 bg-page p-3 text-foreground";
  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-xl bg-accent/10 p-3 text-accent">
          <KeyRound size={21} />
        </span>
        <h2 className="font-bold">{t.generate}</h2>
      </div>
      <p className="mb-6 text-sm leading-7 text-muted">{t.codeHint}</p>
      <form action={action} className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">
          {t.choose}
          <select name="classScheduleId" required className={field} defaultValue="">
            <option value="" disabled>
              {t.choose}
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            {t.recipient}
            <input name="recipient" maxLength={254} className={field} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            {t.payment}
            <input name="paymentReference" maxLength={200} className={field} />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          {t.days}
          <input
            type="number"
            name="expiresDays"
            min={1}
            max={365}
            defaultValue={30}
            required
            className={field}
          />
        </label>
        {state.message && (
          <p role="status" className="text-sm text-warning">
            {state.message}
          </p>
        )}
        <button
          disabled={pending || !classes.length}
          className="min-h-12 rounded-xl bg-cyan-300 px-5 font-bold text-slate-950 disabled:opacity-50"
        >
          {t.generate}
          {pending && "…"}
        </button>
      </form>
      {state.code && (
        <div role="status" className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-sm leading-7 text-muted">{t.oneTime}</p>
          <p className="my-4 break-all font-mono text-lg font-bold tracking-wider text-accent">
            {state.code}
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(state.code!);
                setCopied(state.code!);
                setCopyError(false);
              } catch {
                setCopyError(true);
              }
            }}
            className="flex min-h-11 items-center gap-2 text-sm font-bold"
          >
            <Copy size={16} />
            {copied === state.code ? t.copied : t.copy}
          </button>
          {copyError && (
            <p className="text-sm text-warning">
              {locale === "en"
                ? "Select and copy the code above manually."
                : "အထက်ပါကုဒ်ကို ရွေးပြီး ကိုယ်တိုင်ကူးပါ။"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
