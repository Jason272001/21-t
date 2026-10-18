import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { ArticleEditor, DeleteEditor } from "@/components/portal/management-editors";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { user, locale, t } = await adminContext("articles");
  const { id } = await params;
  const record = await prisma.article.findUnique({ where: { id }, include: { category: true } });
  if (!record) notFound();
  return (
    <PortalShell title={record.title} name={user.name || user.email} locale={locale} admin>
      {(await searchParams).saved && (
        <p role="status" className="mb-4 text-accent">
          {t.saved}
        </p>
      )}
      <ArticleEditor key={record.id} article={record} locale={locale} />
      {record.status === "PUBLISHED" && (
        <a href={`/articles/${record.slug}`} className="my-6 inline-block text-accent">
          {t.view}
        </a>
      )}
      <DeleteEditor kind="article" id={record.id} confirmation={record.title} locale={locale} />
    </PortalShell>
  );
}
