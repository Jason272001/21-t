export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-600 bg-slate-900/70 p-8 text-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
    </div>
  );
}

export function LoadingSkeleton() {
  return <div className="h-32 animate-pulse rounded-lg bg-slate-800" />;
}
