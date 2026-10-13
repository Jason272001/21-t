import { requireAdmin } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { CourseEditor } from "@/components/portal/editors";
import { PortalShell } from "@/components/portal/shell";
import { getLanguage } from "@/lib/i18n-server";
import { portalCopy } from "@/lib/portal-copy";

export default async function NewCoursePage() {
  const user = await requireAdmin();
  const { locale } = await getLanguage();
  const instructors = await prisma.instructorProfile.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });
  return (
    <PortalShell
      title={portalCopy(locale).newCourse}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <CourseEditor instructors={instructors} locale={locale} />
    </PortalShell>
  );
}
