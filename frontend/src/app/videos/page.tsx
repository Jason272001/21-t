import { prisma } from "@backend/lib/prisma";
import { availableVideos } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { managementCopy } from "@/lib/management-copy";
import { VideoLibrary } from "@/components/portal/video-library";
export const dynamic = "force-dynamic";
export default async function Page() {
  const { locale } = await getLanguage();
  const videos = await prisma.video.findMany({
    where: availableVideos(),
    orderBy: { createdAt: "desc" },
  });
  return (
    <main className="bg-page px-4 py-12 text-foreground">
      <section className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-black">{managementCopy(locale).library}</h1>
        <VideoLibrary videos={videos} locale={locale} />
      </section>
    </main>
  );
}
