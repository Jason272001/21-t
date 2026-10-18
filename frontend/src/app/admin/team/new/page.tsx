import { redirect } from "next/navigation";
import { adminContext } from "@/lib/admin-context";
import { workspaceCopy } from "@/lib/workspace-copy";
import { PortalShell } from "@/components/portal/shell";
import { TeamEditor } from "@/components/portal/workspace-editors";
export default async function Page() {
  const { user, locale } = await adminContext("team");
  if (user.adminLevel !== "OWNER") redirect("/admin/team");
  return (
    <PortalShell
      title={workspaceCopy(locale).newAdmin}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <TeamEditor locale={locale} owner />
    </PortalShell>
  );
}
