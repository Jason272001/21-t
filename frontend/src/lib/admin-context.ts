import { requireAdmin } from "@backend/lib/access";
import { getLanguage } from "./i18n-server";
import { managementCopy } from "./management-copy";
export async function adminContext() {
  const user = await requireAdmin();
  const { locale } = await getLanguage();
  return { user, locale, t: managementCopy(locale) };
}
