"use client";

import { useActionState } from "react";
import type { ActionState } from "@backend/actions/public";

export function ActionForm({
  action,
  children,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });
  return (
    <form action={formAction} className="grid gap-4">
      {children}
      {state.message ? (
        <p
          role="status"
          className={
            state.ok ? "text-sm font-semibold text-success" : "text-sm font-semibold text-warning"
          }
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-wait disabled:opacity-60"
      >
        {submitLabel}
        {pending ? "…" : ""}
      </button>
    </form>
  );
}
