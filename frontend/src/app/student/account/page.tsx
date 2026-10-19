import { requireStudent } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { getLanguage } from "@/lib/i18n-server";
import { AccountSettings } from "@/components/portal/account-settings";
export default async function Page() {
  const user = await requireStudent(),
    { locale } = await getLanguage();
  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, email: true, username: true },
  });
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        {locale === "en" ? "My account" : "ကျွန်ုပ်၏အကောင့်"}
      </h1>
      <AccountSettings user={record} locale={locale} />
    </div>
  );
}
