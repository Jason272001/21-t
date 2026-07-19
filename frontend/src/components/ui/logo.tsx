import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)} aria-label="21CT home">
      <span className="relative h-11 w-11 overflow-hidden rounded-lg border border-cyan-300/40 bg-black shadow-[0_0_26px_rgba(34,211,238,0.24)]">
        <Image src="/21ct-logo.jpg" alt="21CT logo" fill sizes="44px" className="object-cover" priority />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-black tracking-wide text-white">21CT</span>
        <span className="block text-xs font-semibold text-slate-300">21st Century Technology</span>
      </span>
    </Link>
  );
}
