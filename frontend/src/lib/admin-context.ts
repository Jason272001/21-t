import { requireAdmin } from "@backend/lib/access";
import { getLanguage } from "./i18n-server";
import { managementCopy } from "./management-copy";
import type { AdminArea } from "@backend/lib/admin-permissions";
export async function adminContext(area?: AdminArea) {
  const user = await requireAdmin(area);
  const { locale } = await getLanguage();
  return { user, locale, t: managementCopy(locale) };
}
