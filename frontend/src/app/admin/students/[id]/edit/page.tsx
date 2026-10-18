import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { StudentEditor, DeleteEditor } from "@/components/portal/management-editors";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { user, locale, t } = await adminContext("students");
  const { id } = await params;
  const record = await prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    select: { id: true, name: true, email: true, isActive: true, studentProfile: true },
  });
  if (!record) notFound();
  return (
    <PortalShell
      title={record.name || record.email}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      {(await searchParams).saved && (
        <p role="status" className="mb-4 text-accent">
          {t.saved}
        </p>
      )}
      <StudentEditor key={record.id} student={record} locale={locale} />
      <DeleteEditor kind="student" id={record.id} confirmation={record.email} locale={locale} />
    </PortalShell>
  );
}
