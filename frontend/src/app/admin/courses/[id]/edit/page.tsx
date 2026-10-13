import { notFound } from "next/navigation";
import { requireAdmin } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { CourseEditor } from "@/components/portal/editors";
import { PortalShell } from "@/components/portal/shell";
import { getLanguage } from "@/lib/i18n-server";
import { portalCopy } from "@/lib/portal-copy";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const { locale } = await getLanguage();
  const [course, instructors] = await Promise.all([
    prisma.course.findUnique({ where: { id }, include: { category: { select: { name: true } } } }),
    prisma.instructorProfile.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);
  if (!course) notFound();
  return (
    <PortalShell title={course.title} name={user.name || user.email} locale={locale} admin>
      {(await searchParams).saved === "1" && (
        <p role="status" className="mb-4 text-success">
          {portalCopy(locale).saved}
        </p>
      )}
      <CourseEditor course={course} instructors={instructors} locale={locale} />
    </PortalShell>
  );
}
