import { Section } from "@/components/section";

export default function ForgotPasswordPage() {
  return (
    <Section eyebrow="Account" title="Forgot password">
      <form className="max-w-md rounded-lg border border-white/10 bg-slate-900 p-6">
        <label className="grid gap-2 text-sm font-semibold text-slate-200">Email<input type="email" required className="min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white" /></label>
        <button className="mt-4 rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Request reset</button>
        <p className="mt-4 text-sm text-slate-400">Production reset emails are ready to connect through the email abstraction.</p>
      </form>
    </Section>
  );
}
