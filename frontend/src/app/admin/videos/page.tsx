import Link from "next/link";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { enumLabel } from "@/lib/portal-copy";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { user, locale, t } = await adminContext();
  const params = await searchParams;
  const q = params.q?.slice(0, 100);
  const page = Math.floor(Math.max(1, Math.min(10000, Number(params.page) || 1)));
  const records = await prisma.video.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : {},
    orderBy: { updatedAt: "desc" },
    skip: (Math.floor(page) - 1) * 50,
    take: 51,
  });
  return (
    <PortalShell title={t.videos} name={user.name || user.email} locale={locale} admin>
      <Link
        className="mb-6 inline-flex rounded-lg bg-cyan-300 px-5 py-3 font-bold text-slate-950"
        href="/admin/videos/new"
      >
        {t.createVideo}
      </Link>

      <div className="grid gap-4 md:grid-cols-2">
        {records.slice(0, 50).map((record) => (
          <article
            key={record.id}
            className="min-w-0 rounded-xl border border-line/10 bg-surface p-6"
          >
            <h2 className="break-words text-lg font-bold">{record.title}</h2>
            <p className="mt-2 break-words text-sm text-muted">{`${enumLabel(record.status, locale)} · ${record.fileKey ? Math.ceil((record.size || 0) / 1048576) + " MB" : t.videoHint}`}</p>
            <Link
              className="mt-4 inline-block font-semibold text-accent"
              href={`/admin/videos/${record.id}/edit`}
            >
              {t.edit}
            </Link>
          </article>
        ))}
      </div>
      {!records.length && <p>{t.empty}</p>}
      <nav aria-label="Pagination" className="mt-8 flex gap-5 text-accent">
        {page > 1 && (
          <Link href={`?page=${page - 1}&q=${encodeURIComponent(q || "")}`}>
            {locale === "en" ? "Previous" : "ရှေ့သို့"}
          </Link>
        )}
        {records.length > 50 && (
          <Link href={`?page=${page + 1}&q=${encodeURIComponent(q || "")}`}>
            {locale === "en" ? "Next" : "နောက်သို့"}
          </Link>
        )}
      </nav>
    </PortalShell>
  );
}
