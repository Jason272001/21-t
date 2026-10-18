import { cookies } from "next/headers";
import { requireAdmin } from "@backend/lib/access";
import { getLanguage } from "@/lib/i18n-server";
import { resolveTheme, themeCookie } from "@/lib/theme";
import { AdminFrame } from "@/components/portal/admin-frame";
export const metadata = { title: "Administration", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const { locale } = await getLanguage();
  const theme = resolveTheme((await cookies()).get(themeCookie)?.value);
  return (
    <AdminFrame
      locale={locale}
      theme={theme}
      name={user.name || user.email}
      level={user.adminLevel}
    >
      {children}
    </AdminFrame>
  );
}
