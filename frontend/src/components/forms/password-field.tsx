"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function PasswordField({
  label,
  name,
  defaultValue,
  required = false,
  hint,
  locale = "en",
  autoComplete = "new-password",
  minLength = 8,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  locale?: Locale;
  autoComplete?: "current-password" | "new-password";
  minLength?: number;
}) {
  const id = useId(),
    [visible, setVisible] = useState(false);
  const toggleLabel =
    locale === "my"
      ? visible
        ? "စကားဝှက် ဖျောက်ရန်"
        : "စကားဝှက် ပြရန်"
      : visible
        ? "Hide password"
        : "Show password";
  return (
    <div className="grid gap-2 text-sm font-semibold text-foreground">
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          defaultValue={defaultValue}
          required={required}
          minLength={minLength || undefined}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="min-h-11 w-full rounded-lg border border-line/20 bg-page py-3 pl-3 pr-14 text-foreground outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={`${toggleLabel}: ${label}`}
          aria-pressed={visible}
          aria-controls={id}
          title={toggleLabel}
          className="absolute inset-y-0 right-0 grid min-h-11 w-12 place-items-center rounded-r-lg text-subtle hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-sm font-normal text-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}
