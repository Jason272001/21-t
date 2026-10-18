import { adminContext } from "@/lib/admin-context";
import { workspaceCopy } from "@/lib/workspace-copy";
import { PortalShell } from "@/components/portal/shell";
import { TeamEditor } from "@/components/portal/workspace-editors";
export default async function Page() {
  const { user, locale } = await adminContext("team");
  return (
    <PortalShell
      title={
        user.adminLevel === "OWNER"
          ? workspaceCopy(locale).newAdmin
          : locale === "en"
            ? "Add Staff account"
            : "ဝန်ထမ်းအကောင့် ဖန်တီးရန်"
      }
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <TeamEditor locale={locale} owner={user.adminLevel === "OWNER"} />
    </PortalShell>
  );
}
