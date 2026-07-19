import { cn } from "@/lib/utils";

export function StatusBadge({ label, tone = "cyan" }: { label: string; tone?: "cyan" | "orange" | "green" | "slate" }) {
  const tones = {
    cyan: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
    orange: "border-orange-300/40 bg-orange-300/10 text-orange-100",
    green: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
    slate: "border-slate-300/20 bg-slate-300/10 text-slate-100",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {label.replaceAll("_", " ")}
    </span>
  );
}
