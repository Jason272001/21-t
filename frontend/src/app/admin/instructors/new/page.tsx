import { adminContext } from "@/lib/admin-context";
import { workspaceCopy } from "@/lib/workspace-copy";
import { PortalShell } from "@/components/portal/shell";
import { InstructorEditor } from "@/components/portal/workspace-editors";
export default async function Page() {
  const { user, locale } = await adminContext("instructors");
  return (
    <PortalShell
      title={workspaceCopy(locale).newInstructor}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <InstructorEditor locale={locale} />
    </PortalShell>
  );
}
