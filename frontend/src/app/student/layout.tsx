import { cookies } from "next/headers";
import { requireStudent } from "@backend/lib/access";
import { getLanguage } from "@/lib/i18n-server";
import { resolveTheme, themeCookie } from "@/lib/theme";
import { StudentFrame } from "@/components/portal/student-frame";
export const metadata = { title: "My learning", robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent(),
    { locale } = await getLanguage(),
    theme = resolveTheme((await cookies()).get(themeCookie)?.value);
  return (
    <StudentFrame name={user.name || user.email} locale={locale} theme={theme}>
      {children}
    </StudentFrame>
  );
}
