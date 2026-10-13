"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <form
      className="mt-6 grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await signIn("credentials", {
          email: form.get("email"),
          password: form.get("password"),
          redirect: false,
        });
        if (result?.error) {
          setError("Invalid email or password.");
          return;
        }
        router.push("/student");
      }}
    >
      <label className="grid gap-2 text-sm font-semibold text-foreground">Email<input name="email" type="email" required className="min-h-11 rounded-lg border border-line/10 bg-page px-3 text-foreground" /></label>
      <label className="grid gap-2 text-sm font-semibold text-foreground">Password<input name="password" type="password" required className="min-h-11 rounded-lg border border-line/10 bg-page px-3 text-foreground" /></label>
      {error ? <p className="text-sm font-semibold text-warning">{error}</p> : null}
      <button className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Login</button>
      <a href="/forgot-password" className="text-sm font-semibold text-accent">Forgot password?</a>
    </form>
  );
}
