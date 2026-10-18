import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { StudentEditor } from "@/components/portal/management-editors";

export default async function Page() {
  const { user, locale, t } = await adminContext("students");
  return (
    <PortalShell title={t.createStudent} name={user.name || user.email} locale={locale} admin>
      <StudentEditor locale={locale} />
    </PortalShell>
  );
}
