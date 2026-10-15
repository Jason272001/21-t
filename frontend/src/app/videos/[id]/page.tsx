import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { getCurrentUser } from "@backend/lib/access";
import { canWatch } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { managementCopy } from "@/lib/management-copy";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const video = await prisma.video.findUnique({ where: { id: (await params).id } });
  if (!video || !(await canWatch(video, user?.id))) notFound();
  const { locale } = await getLanguage();
  return (
    <main className="bg-page px-4 py-12 text-foreground">
      <article className="mx-auto max-w-5xl">
        <Link className="text-accent" href={user ? "/student/videos" : "/videos"}>
          {managementCopy(locale).library}
        </Link>
        <h1 className="my-6 text-3xl font-black">{video.title}</h1>
        {video.fileKey && (
          <video
            controls
            playsInline
            preload="metadata"
            src={`/api/videos/${video.id}/stream`}
            className="aspect-video w-full rounded-xl bg-black"
            aria-label={video.title}
          />
        )}
        <p className="mt-6 whitespace-pre-line leading-8 text-muted">{video.description}</p>
      </article>
    </main>
  );
}
