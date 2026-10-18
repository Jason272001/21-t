import { requireAdmin } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { ClassEditor } from "@/components/portal/editors";
import { PortalShell } from "@/components/portal/shell";
import { ButtonLink } from "@/components/ui/button";
import { getLanguage } from "@/lib/i18n-server";
import { portalCopy } from "@/lib/portal-copy";

export default async function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const user = await requireAdmin("classes");
  const { locale } = await getLanguage();
  const courses = await prisma.course.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, title: true, status: true },
    orderBy: { title: "asc" },
  });
  return (
    <PortalShell
      title={portalCopy(locale).newClass}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      {courses.length ? (
        <ClassEditor
          courses={courses}
          locale={locale}
          selectedCourse={(await searchParams).courseId}
        />
      ) : (
        <ButtonLink href="/admin/courses/new">{portalCopy(locale).newCourse}</ButtonLink>
      )}
    </PortalShell>
  );
}
