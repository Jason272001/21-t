import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { TeamEditor, WorkspaceDelete } from "@/components/portal/workspace-editors";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { user, locale } = await adminContext("team");
  const record = await prisma.user.findUnique({
    where: { id: (await params).id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      adminLevel: true,
      isActive: true,
      role: true,
    },
  });
  if (
    !record ||
    record.role !== "ADMIN" ||
    (user.adminLevel !== "OWNER" && record.adminLevel !== "STAFF")
  )
    notFound();
  return (
    <PortalShell
      title={record.name || record.email}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <TeamEditor record={record} locale={locale} owner={user.adminLevel === "OWNER"} />
      {user.adminLevel === "OWNER" && record.id !== user.id && (
        <WorkspaceDelete kind="team" id={record.id} confirmation={record.email} locale={locale} />
      )}
    </PortalShell>
  );
}
