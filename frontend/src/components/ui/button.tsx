import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
  secondary: "border border-line/15 bg-overlay/8 text-foreground hover:bg-overlay/12",
  accent: "bg-orange-400 text-slate-950 hover:bg-orange-300",
  ghost: "text-foreground hover:bg-overlay/10",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-accent">
      {children}
    </button>
  );
}
