import { ClassCard } from "@/components/courses/class-card";
import { Section } from "@/components/section";
import { prisma } from "@backend/lib/prisma";
import { UpcomingCourses } from "@/components/courses/upcoming-courses";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { locale } = await getLanguage();
  const my = locale === "my";
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
      eyebrow={my ? "သင်တန်းအစီအစဉ်" : "Class schedule"}
      title={my ? "မကြာမီ ဖွင့်လှစ်မည့် သင်တန်းများ" : "Your next step in technology starts here"}
    >
      <UpcomingCourses />
      {classes.length > 0 && (
        <h2 className="mb-6 mt-12 text-2xl font-black">
          {my ? "ရက်သတ်မှတ်ပြီးသော အတန်းများ" : "Scheduled classes"}
        </h2>
      )}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {classes.map((item) => (
          <ClassCard key={item.id} item={item} />
        ))}
      </div>
    </Section>
  );
}
