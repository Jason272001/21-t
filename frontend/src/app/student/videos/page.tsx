import Link from "next/link";
import { prisma } from "@backend/lib/prisma";
import { requireStudent } from "@backend/lib/access";
import { availableVideos } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { studentCopy } from "@/lib/student-copy";
import { VideoLibrary } from "@/components/portal/video-library";
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireStudent(),
    { locale } = await getLanguage(),
    t = studentCopy(locale),
    page = Math.floor(Math.max(1, Math.min(10000, Number((await searchParams).page) || 1)));
  const records = await prisma.video.findMany({
    where: availableVideos(user.id),
    orderBy: { createdAt: "desc" },
    take: 25,
    skip: (page - 1) * 24,
  });
  return (
    <section>
      <h1 className="mb-7 text-3xl font-bold">{t.videos}</h1>
      {records.length ? (
        <VideoLibrary videos={records.slice(0, 24)} locale={locale} hrefPrefix="/student/videos" />
      ) : (
        <p className="rounded-2xl border border-dashed border-line/20 bg-surface p-8 text-sm leading-7 text-muted">
          {t.noVideos}
        </p>
      )}
      <nav aria-label="Pagination" className="mt-6 flex gap-5 text-accent">
        {page > 1 && (
          <Link href={`?page=${page - 1}`}>{locale === "en" ? "Previous" : "ရှေ့သို့"}</Link>
        )}
        {records.length > 24 && (
          <Link href={`?page=${page + 1}`}>{locale === "en" ? "Next" : "နောက်သို့"}</Link>
        )}
      </nav>
    </section>
  );
}
