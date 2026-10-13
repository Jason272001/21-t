import { notFound } from "next/navigation";
import { requireAdmin } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { ClassEditor } from "@/components/portal/editors";
import { PortalShell } from "@/components/portal/shell";
import { getLanguage } from "@/lib/i18n-server";
import { portalCopy } from "@/lib/portal-copy";

export default async function EditClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const { locale } = await getLanguage();
  const [klass, courses] = await Promise.all([
    prisma.classSchedule.findUnique({ where: { id } }),
    prisma.course.findMany({
      select: { id: true, title: true, status: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!klass) notFound();
  return (
    <PortalShell title={klass.title} name={user.name || user.email} locale={locale} admin>
      {(await searchParams).saved === "1" && (
        <p role="status" className="mb-4 text-success">
          {portalCopy(locale).saved}
        </p>
      )}
      <ClassEditor klass={klass} courses={courses} locale={locale} />
    </PortalShell>
  );
}
