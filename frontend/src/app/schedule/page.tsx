import { ClassCard } from "@/components/courses/class-card";
import { Section } from "@/components/section";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const classes = await prisma.classSchedule.findMany({ include: { course: true, instructor: true }, orderBy: { startDate: "asc" } });
  return (
    <Section eyebrow="Class schedule" title="Calendar and list view" body="Filter-ready class schedule with seat availability and enrollment deadlines.">
      <div className="mb-8 grid gap-2 rounded-lg border border-white/10 bg-slate-900 p-4 md:grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="rounded-lg bg-slate-950 p-4 text-center text-sm font-bold text-slate-200">{day}</div>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">{classes.map((item) => <ClassCard key={item.id} item={item} />)}</div>
    </Section>
  );
}
