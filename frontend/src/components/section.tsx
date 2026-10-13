import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  body,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-page px-4 py-16 text-foreground lg:px-6", className)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          {eyebrow ? <p className="text-sm font-black uppercase tracking-[0.16em] text-accent">{eyebrow}</p> : null}
          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
          {body ? <p className="mt-4 text-base leading-8 text-muted">{body}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
