import { Star } from "lucide-react";

export function TestimonialCard({ item }: { item: { studentName: string; rating: number; body: string; course?: { title: string } | null } }) {
  return (
    <article className="rounded-lg border border-line/10 bg-surface p-5">
      <div className="flex gap-1 text-warning">
        {Array.from({ length: item.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
      </div>
      <p className="mt-4 leading-8 text-foreground">“{item.body}”</p>
      <p className="mt-4 font-bold text-foreground">{item.studentName}</p>
      {item.course ? <p className="text-xs text-subtle">{item.course.title}</p> : null}
    </article>
  );
}
