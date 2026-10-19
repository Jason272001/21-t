"use client";
import { useActionState, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { issueInvitationAction, type InvitationState } from "@backend/actions/invitations";
import type { Locale } from "@/lib/i18n";

export function InvitationGenerator({ owner, locale }: { owner: boolean; locale: Locale }) {
  const en = locale === "en";
  const [state, action, pending] = useActionState<InvitationState, FormData>(
    issueInvitationAction,
    { ok: false, message: "" },
  );
  const [copied, setCopied] = useState<string | null>(null),
    [copyError, setCopyError] = useState(false);
  const field = "min-h-11 w-full rounded-xl border border-line/20 bg-page p-3 text-foreground";
  return (
    <section className="rounded-2xl border border-line/10 bg-surface p-5 sm:p-7">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <Link2 size={22} />
        {en ? "Create invitation link" : "ဖိတ်ကြားလင့်ခ် ဖန်တီးရန်"}
      </h2>
      <p className="my-4 text-sm leading-7 text-muted">
        {en
          ? "The recipient sets up their own account and password. Each link creates one new account. Share it privately with the intended person."
          : "ဖိတ်ကြားခံရသူက ကိုယ်ပိုင်အကောင့်နှင့် စကားဝှက် သတ်မှတ်မည်။ လင့်ခ်တစ်ခုလျှင် အကောင့်တစ်ခုသာ ဖွင့်နိုင်သည်။ ရည်ရွယ်ထားသူထံ သီးသန့်မျှဝေပါ။"}
      </p>
      <form action={action} className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">
          {en ? "Access level" : "စီမံခွင့် အဆင့်"}
          <select name="adminLevel" defaultValue="STAFF" className={field}>
            <option value="STAFF">{en ? "Staff" : "ဝန်ထမ်း"}</option>
            {owner && <option value="MANAGER">{en ? "Manager" : "မန်နေဂျာ"}</option>}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          {en ? "Private note (optional)" : "သီးသန့် မှတ်စု (ရွေးချယ်နိုင်)"}
          <input name="note" maxLength={100} className={field} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          {en ? "Link expires after" : "လင့်ခ် သက်တမ်း"}
          <select name="expiresHours" defaultValue="24" className={field}>
            <option value="1">{en ? "1 hour" : "၁ နာရီ"}</option>
            <option value="24">{en ? "24 hours" : "၂၄ နာရီ"}</option>
            <option value="72">{en ? "3 days" : "၃ ရက်"}</option>
            <option value="168">{en ? "7 days" : "၇ ရက်"}</option>
          </select>
        </label>
        {state.message && (
          <p role="status" className="text-sm text-warning">
            {state.message}
          </p>
        )}
        <button
          disabled={pending}
          className="min-h-11 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
        >
          {en ? "Generate invitation" : "ဖိတ်ကြားလင့်ခ် ဖန်တီးရန်"}
          {pending ? "…" : ""}
        </button>
      </form>
      {state.url && (
        <div role="status" className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-sm leading-7 text-muted">
            {en
              ? "Copy this link now. It is shown only once; if you lose it, revoke it and generate a new one. Anyone holding this link can create the selected admin account."
              : "လင့်ခ်ကို ယခုကူးယူပါ။ တစ်ကြိမ်သာ ပြမည်။ ပျောက်သွားလျှင် ပယ်ဖျက်၍ အသစ်ဖန်တီးပါ။ လင့်ခ်ရှိသူက သတ်မှတ်ထားသော စီမံသူအကောင့်ကို ဖွင့်နိုင်သည်။"}
          </p>
          <p className="my-4 break-all font-mono text-sm text-accent" data-testid="invitation-url">
            {state.url}
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(state.url!);
                setCopied(state.url!);
                setCopyError(false);
              } catch {
                setCopyError(true);
              }
            }}
            className="flex min-h-11 items-center gap-2 text-sm font-bold"
          >
            <Copy size={16} />
            {copied === state.url
              ? en
                ? "Copied"
                : "ကူးယူပြီး"
              : en
                ? "Copy invitation link"
                : "ဖိတ်ကြားလင့်ခ် ကူးရန်"}
          </button>
          {copyError && (
            <p className="text-sm text-warning">
              {en ? "Select and copy the link manually." : "လင့်ခ်ကို ရွေး၍ ကိုယ်တိုင်ကူးယူပါ။"}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
