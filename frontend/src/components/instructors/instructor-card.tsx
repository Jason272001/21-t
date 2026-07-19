import Link from "next/link";
import { UserRoundCheck } from "lucide-react";

export function InstructorCard({ instructor }: { instructor: { fullName: string; slug: string; jobTitle: string; expertise: string[]; experience: string } }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="grid h-20 w-20 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
        <UserRoundCheck className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-xl font-black text-white">{instructor.fullName}</h3>
      <p className="mt-1 text-sm font-semibold text-cyan-200">{instructor.jobTitle}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{instructor.experience}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {instructor.expertise.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{item}</span>
        ))}
      </div>
      <Link href={`/instructors/${instructor.slug}`} className="mt-5 inline-flex text-sm font-bold text-cyan-200">View profile</Link>
    </article>
  );
}
