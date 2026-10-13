import { cn } from "@/lib/utils";

export function StatusBadge({ label, tone = "cyan" }: { label: string; tone?: "cyan" | "orange" | "green" | "slate" }) {
  const tones = {
    cyan: "border-cyan-300/40 bg-cyan-300/10 text-accent",
    orange: "border-orange-300/40 bg-orange-300/10 text-warning",
    green: "border-emerald-300/40 bg-emerald-300/10 text-success",
    slate: "border-slate-300/20 bg-slate-300/10 text-foreground",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {label.replaceAll("_", " ")}
    </span>
  );
}
