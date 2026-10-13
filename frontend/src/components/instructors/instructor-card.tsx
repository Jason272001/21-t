import Link from "next/link";
import { UserRoundCheck } from "lucide-react";
import { getLanguage } from "@/lib/i18n-server";

export async function InstructorCard({
  instructor,
}: {
  instructor: {
    fullName: string;
    slug: string;
    jobTitle: string;
    expertise: string[];
    experience: string;
  };
}) {
  const {
    messages: { common },
  } = await getLanguage();
  return (
    <article className="rounded-lg border border-line/10 bg-surface p-5">
      <div className="grid h-20 w-20 place-items-center rounded-lg bg-cyan-300/10 text-accent">
        <UserRoundCheck className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-xl font-black text-foreground">{instructor.fullName}</h3>
      <p className="mt-1 text-sm font-semibold text-accent">{instructor.jobTitle}</p>
      <p className="mt-3 text-sm leading-7 text-muted">{instructor.experience}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {instructor.expertise.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full bg-overlay/10 px-3 py-1 text-xs text-foreground">
            {item}
          </span>
        ))}
      </div>
      <Link
        href={`/instructors/${instructor.slug}`}
        className="mt-5 inline-flex text-sm font-bold text-accent"
      >
        {common.profile}
      </Link>
    </article>
  );
}
