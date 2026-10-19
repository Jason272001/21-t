"use client";
import { useActionState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { commentAction, reactionAction } from "@backend/actions/discussion";
import type { Locale } from "@/lib/i18n";

export function Discussion({
  articleId,
  thumbsUp,
  thumbsDown,
  locale,
}: {
  articleId: string;
  thumbsUp: number;
  thumbsDown: number;
  locale: Locale;
}) {
  const en = locale === "en";
  const [comment, submitComment, posting] = useActionState(commentAction.bind(null, articleId), {
    ok: false,
    message: "",
  });
  const [reaction, submitReaction, voting] = useActionState(reactionAction.bind(null, articleId), {
    ok: false,
    message: "",
  });
  return (
    <section
      className="mt-10 rounded-2xl border border-line/10 bg-surface p-5 sm:p-8"
      aria-labelledby="discussion-title"
    >
      <h2 id="discussion-title" className="flex items-center gap-3 text-2xl font-bold">
        <MessageSquare size={23} />
        {en ? "Join the conversation" : "ဆွေးနွေးမှုတွင် ပါဝင်ပါ"}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        {en
          ? "No account needed. Comments show only your message and the date and time. Please do not include private information in your message."
          : "အကောင့်မလိုပါ။ မှတ်ချက်တွင် စာသား၊ နေ့ရက်နှင့် အချိန်သာ ဖော်ပြမည်။ ကိုယ်ရေးကိုယ်တာ အချက်အလက်များ မထည့်ပါနှင့်။"}
      </p>
      <form action={submitReaction} className="mt-5 flex flex-wrap items-center gap-3">
        {[
          { value: "UP", label: en ? "Thumbs up" : "နှစ်သက်သည်", count: thumbsUp, Icon: ThumbsUp },
          {
            value: "DOWN",
            label: en ? "Thumbs down" : "မနှစ်သက်ပါ",
            count: thumbsDown,
            Icon: ThumbsDown,
          },
        ].map(({ value, label, count, Icon }) => (
          <button
            key={value}
            type="submit"
            name="direction"
            value={value}
            disabled={voting || reaction.ok}
            aria-label={`${label} (${count})`}
            className="flex min-h-11 items-center gap-3 rounded-xl border border-line/20 px-4 text-sm font-semibold hover:bg-accent/10 disabled:opacity-60"
          >
            <Icon size={18} />
            {label}
            <span>
              {locale === "my"
                ? String(count).replace(/\d/g, (digit) => "၀၁၂၃၄၅၆၇၈၉"[Number(digit)])
                : String(count)}
            </span>
          </button>
        ))}
      </form>
      {reaction.message && (
        <p role="status" className="mt-3 text-sm text-accent">
          {reaction.message}
        </p>
      )}
      <p className="mt-3 text-xs leading-6 text-subtle">
        {en
          ? "Votes are anonymous feedback totals, not unique-person counts. We do not use visitor IDs or voting cookies."
          : "မဲများမှာ အမည်မသိ အကြံပြုချက် စုစုပေါင်းဖြစ်ပြီး လူဦးရေ မဟုတ်ပါ။ ဧည့်သည် ID နှင့် မဲပေး cookie မသုံးပါ။"}
      </p>
      <form action={submitComment} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          {en ? "Your comment" : "သင့်မှတ်ချက်"}
          <textarea
            name="body"
            required
            maxLength={2000}
            rows={4}
            className="w-full rounded-xl border border-line/20 bg-page p-3 text-foreground"
          />
        </label>
        <div aria-hidden="true" className="hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="text-xs text-subtle">
          {en
            ? "Up to 2,000 characters. Comments are public."
            : "စာလုံးရေ ၂,၀၀၀ အထိ ရေးနိုင်ပါသည်။ မှတ်ချက်များကို အများမြင်နိုင်ပါသည်။"}
        </p>
        {comment.message && (
          <p role="status" className={`text-sm ${comment.ok ? "text-accent" : "text-warning"}`}>
            {comment.message}
          </p>
        )}
        <button
          disabled={posting}
          className="min-h-11 justify-self-start rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
        >
          {en ? "Post anonymously" : "အမည်မဖော်ဘဲ တင်ရန်"}
          {posting ? "…" : ""}
        </button>
      </form>
    </section>
  );
}
