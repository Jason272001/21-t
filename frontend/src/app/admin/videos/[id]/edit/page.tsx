import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { VideoEditor, DeleteEditor } from "@/components/portal/management-editors";
import { VideoUpload } from "@/components/portal/video-upload";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { user, locale, t } = await adminContext();
  const { id } = await params;
  const record = await prisma.video.findUnique({ where: { id } });
  if (!record) notFound();
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return (
    <PortalShell title={record.title} name={user.name || user.email} locale={locale} admin>
      {(await searchParams).saved && (
        <p role="status" className="mb-4 text-accent">
          {t.saved}
        </p>
      )}
      <VideoEditor key={record.id} video={record} locale={locale} courses={courses} />
      {process.env.RENDER === "true" && !process.env.VIDEO_STORAGE_PATH ? (
        <p role="status" className="my-6 rounded-xl border border-border p-4 text-muted">
          {locale === "my"
            ? "ဗီဒီယိုတင်ရန် အမြဲတမ်းသိမ်းဆည်းနိုင်သော သိုလှောင်မှုကို ဦးစွာ ပြင်ဆင်ပါ။"
            : "Video uploads will be available after persistent video storage is connected."}
        </p>
      ) : (
        <VideoUpload id={record.id} locale={locale} />
      )}
      {record.fileKey && (
        <video
          key={record.updatedAt.toISOString()}
          controls
          preload="metadata"
          src={`/api/videos/${record.id}/stream`}
          className="my-6 aspect-video w-full max-w-4xl rounded-xl bg-black"
          aria-label={record.title}
        />
      )}
      <DeleteEditor kind="video" id={record.id} confirmation={record.title} locale={locale} />
    </PortalShell>
  );
}
