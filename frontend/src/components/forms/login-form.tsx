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
      <label className="grid gap-2 text-sm font-semibold text-slate-200">Email<input name="email" type="email" required className="min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white" /></label>
      <label className="grid gap-2 text-sm font-semibold text-slate-200">Password<input name="password" type="password" required className="min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white" /></label>
      {error ? <p className="text-sm font-semibold text-orange-200">{error}</p> : null}
      <button className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Login</button>
      <a href="/forgot-password" className="text-sm font-semibold text-cyan-200">Forgot password?</a>
    </form>
  );
}
