import { prisma } from "@backend/lib/prisma";
import { requireUser } from "@backend/lib/access";
import { availableVideos } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { managementCopy } from "@/lib/management-copy";
import { PortalShell } from "@/components/portal/shell";
import { VideoLibrary } from "@/components/portal/video-library";
export default async function Page() {
  const user = await requireUser();
  const { locale } = await getLanguage();
  const videos = await prisma.video.findMany({
    where: availableVideos(user.id),
    orderBy: { createdAt: "desc" },
  });
  return (
    <PortalShell
      title={managementCopy(locale).library}
      name={user.name || user.email}
      locale={locale}
    >
      <VideoLibrary videos={videos} locale={locale} />
    </PortalShell>
  );
}
