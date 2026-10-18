import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { VideoEditor } from "@/components/portal/management-editors";
import { prisma } from "@backend/lib/prisma";
export default async function Page() {
  const { user, locale, t } = await adminContext("videos");
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return (
    <PortalShell title={t.createVideo} name={user.name || user.email} locale={locale} admin>
      <VideoEditor locale={locale} courses={courses} />
    </PortalShell>
  );
}
