import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, MapPin, UserRound } from "lucide-react";
import { prisma } from "@backend/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.instructorProfile.findUnique({
    where: { slug, featured: true },
    select: { fullName: true, jobTitle: true, experience: true },
  });
  return {
    title: profile ? `${profile.fullName} | ${profile.jobTitle}` : "Instructor",
    description: profile?.experience,
  };
}

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ locale }, profile] = await Promise.all([
    getLanguage(),
    prisma.instructorProfile.findUnique({ where: { slug, featured: true } }),
  ]);
  if (!profile) notFound();
  const my = locale === "my";
  return (
    <main className="bg-page px-4 py-14 text-foreground lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="tech-grid rounded-3xl border border-cyan-300/20 p-7 md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
            21CT / {my ? "သင်တန်းဆရာ" : "Meet your instructor"}
          </p>
          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-center">
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl border border-cyan-300/25 bg-surface text-accent">
              <UserRound className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight md:text-6xl">{profile.fullName}</h1>
              <p className="mt-3 text-xl font-semibold text-accent">{profile.jobTitle}</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4" />
                {profile.experience}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-7 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-line/10 bg-surface p-7">
            <h2 className="text-2xl font-black">{my ? "ဆရာအကြောင်း" : "About your instructor"}</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted">
              {profile.biography}
            </p>
          </section>
          <aside className="rounded-2xl border border-line/10 bg-surface p-7">
            <BookOpen className="h-7 w-7 text-accent" />
            <h2 className="mt-4 text-2xl font-black">
              {my ? "သင်ကြားမည့် အကြောင်းအရာများ" : "Teaching focus"}
            </h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted">
              {profile.expertise.map((item) => (
                <li key={item} className="rounded-lg border border-line/10 bg-page px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/schedule" className="mt-7 w-full">
              {my ? "လာမည့်သင်တန်းများ" : "Explore upcoming classes"}
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" className="mt-3 w-full">
              {my ? "မေးမြန်းရန်" : "Ask about a class"}
            </ButtonLink>
          </aside>
        </div>
      </div>
    </main>
  );
}
