import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { AccountSettings } from "@/components/portal/account-settings";
import { prisma } from "@backend/lib/prisma";
export default async function Page() {
  const { user, locale } = await adminContext();
  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, email: true, username: true },
  });
  return (
    <PortalShell
      title={locale === "en" ? "My account" : "ကျွန်ုပ်၏အကောင့်"}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <AccountSettings user={record} locale={locale} />
    </PortalShell>
  );
}
