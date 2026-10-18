import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { requireStudent } from "@backend/lib/access";
import { canWatch } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { studentCopy } from "@/lib/student-copy";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStudent(),
    { locale } = await getLanguage(),
    t = studentCopy(locale),
    video = await prisma.video.findUnique({ where: { id: (await params).id } });
  if (!video || !(await canWatch(video, user.id))) notFound();
  return (
    <article>
      <Link href="/student/videos" className="text-sm text-accent">
        ← {t.videos}
      </Link>
      <h1 className="my-6 text-3xl font-bold">{video.title}</h1>
      <video
        controls
        playsInline
        preload="metadata"
        src={`/api/videos/${video.id}/stream`}
        aria-label={video.title}
        className="aspect-video w-full rounded-2xl bg-black"
      />
      <p className="mt-6 whitespace-pre-line text-sm leading-8 text-muted">{video.description}</p>
    </article>
  );
}
