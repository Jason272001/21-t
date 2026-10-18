import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { ArticleEditor } from "@/components/portal/management-editors";

export default async function Page() {
  const { user, locale, t } = await adminContext("articles");
  return (
    <PortalShell title={t.createArticle} name={user.name || user.email} locale={locale} admin>
      <ArticleEditor locale={locale} />
    </PortalShell>
  );
}
