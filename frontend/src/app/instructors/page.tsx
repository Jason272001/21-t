import type { Metadata } from "next";
import { prisma } from "@backend/lib/prisma";
import { Section } from "@/components/section";
import { InstructorCard } from "@/components/instructors/instructor-card";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meet our instructors" };

export default async function InstructorsPage() {
  const [{ locale }, instructors] = await Promise.all([
    getLanguage(),
    prisma.instructorProfile.findMany({ where: { featured: true }, orderBy: { fullName: "asc" } }),
  ]);
  const my = locale === "my";
  return (
    <Section
      eyebrow={my ? "21CT သင်ကြားရေး" : "The people behind 21CT"}
      title={my ? "သင်တန်းဆရာများနှင့် မိတ်ဆက်ခြင်း" : "Practical learning. A personal approach."}
      body={
        my
          ? "နည်းပညာအကြောင်းအရာများကို နားလည်လွယ်သော ရှင်းလင်းချက်များ၊ လက်တွေ့လေ့ကျင့်ခန်းများနှင့် အဆင့်ဆင့် လေ့လာပါ။"
          : "Learn through clear explanations, practical exercises and a thoughtful, step-by-step approach to technology."
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <InstructorCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </Section>
  );
}
