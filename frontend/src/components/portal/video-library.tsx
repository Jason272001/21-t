import Link from "next/link";
import type { Video } from "@prisma/client";
import { managementCopy } from "@/lib/management-copy";
import type { Locale } from "@/lib/i18n";
export function VideoLibrary({
  videos,
  locale,
  hrefPrefix = "/videos",
}: {
  videos: Video[];
  locale: Locale;
  hrefPrefix?: string;
}) {
  const t = managementCopy(locale);
  return videos.length ? (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <article key={video.id} className="rounded-xl border border-line/10 bg-surface p-6">
          <div
            className="mb-5 flex aspect-video items-center justify-center rounded-lg bg-page text-4xl text-accent"
            aria-hidden
          >
            ▶
          </div>
          <h2 className="text-xl font-bold">{video.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm text-muted">{video.description}</p>
          <Link
            href={`${hrefPrefix}/${video.id}`}
            className="mt-5 inline-block font-semibold text-accent"
          >
            {t.watch}
          </Link>
        </article>
      ))}
    </div>
  ) : (
    <p className="rounded-xl border border-dashed border-line/20 p-8 text-muted">{t.empty}</p>
  );
}
