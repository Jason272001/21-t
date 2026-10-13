"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/button";
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
  const [state, formAction] = useActionState(action, { ok: false, message: "" });
  return (
    <form action={formAction} className="grid gap-4">
      {children}
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-success" : "text-sm font-semibold text-warning"}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
