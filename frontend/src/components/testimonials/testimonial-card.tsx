import { Star } from "lucide-react";

export function TestimonialCard({ item }: { item: { studentName: string; rating: number; body: string; course?: { title: string } | null } }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="flex gap-1 text-orange-300">
        {Array.from({ length: item.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
      </div>
      <p className="mt-4 leading-8 text-slate-200">“{item.body}”</p>
      <p className="mt-4 font-bold text-white">{item.studentName}</p>
      {item.course ? <p className="text-xs text-slate-400">{item.course.title}</p> : null}
    </article>
  );
}
