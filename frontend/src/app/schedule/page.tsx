import { ClassCard } from "@/components/courses/class-card";
import { Section } from "@/components/section";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const classes = await prisma.classSchedule.findMany({
    where: {
      course: { status: "PUBLISHED" },
      status: {
        in: ["UPCOMING", "OPEN_FOR_ENROLLMENT", "ENROLLMENT_CLOSED", "FULL", "IN_PROGRESS"],
      },
      endDate: { gte: new Date() },
    },
    include: { course: true, instructor: true },
    orderBy: { startDate: "asc" },
  });
  return (
    <Section
      eyebrow="Class schedule"
      title="Calendar and list view"
      body="Filter-ready class schedule with seat availability and enrollment deadlines."
    >
      <div className="mb-8 grid gap-2 rounded-lg border border-line/10 bg-surface p-4 md:grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="rounded-lg bg-page p-4 text-center text-sm font-bold text-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {classes.map((item) => (
          <ClassCard key={item.id} item={item} />
        ))}
      </div>
    </Section>
  );
}
