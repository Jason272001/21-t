import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { InstructorEditor, WorkspaceDelete } from "@/components/portal/workspace-editors";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { user, locale } = await adminContext("instructors");
  const record = await prisma.instructorProfile.findUnique({
    where: { id: (await params).id },
    include: { user: { select: { email: true, role: true } } },
  });
  if (!record || record.user.role !== "INSTRUCTOR") notFound();
  return (
    <PortalShell title={record.fullName} name={user.name || user.email} locale={locale} admin>
      <InstructorEditor record={record} locale={locale} />
      <WorkspaceDelete
        kind="instructor"
        id={record.id}
        confirmation={record.fullName}
        locale={locale}
      />
    </PortalShell>
  );
}
