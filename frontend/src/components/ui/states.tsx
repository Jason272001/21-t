export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line/40 bg-surface/70 p-8 text-center">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

export function LoadingSkeleton() {
  return <div className="h-32 animate-pulse rounded-lg bg-skeleton" />;
}
