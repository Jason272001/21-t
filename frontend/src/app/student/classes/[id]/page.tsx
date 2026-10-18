import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, GraduationCap, Download, Video } from "lucide-react";
import { prisma } from "@backend/lib/prisma";
import { requireStudent } from "@backend/lib/access";
import { studentClass } from "@backend/server/student";
import { availableVideos } from "@backend/server/videos";
import { getLanguage } from "@/lib/i18n-server";
import { studentCopy } from "@/lib/student-copy";
import { VideoLibrary } from "@/components/portal/video-library";
function safeLink(value: string | null) {
  try {
    const url = new URL(value || "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ joined?: string }>;
}) {
  const user = await requireStudent(),
    { locale } = await getLanguage(),
    t = studentCopy(locale),
    record = await studentClass(user.id, (await params).id);
  if (!record) notFound();
  const klass = record.classSchedule;
  const [videos, materials] = await Promise.all([
    prisma.video.findMany({
      where: { AND: [availableVideos(user.id), { courseId: klass.courseId }] },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    prisma.courseMaterial.findMany({
      where: { courseId: klass.courseId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  const meeting = safeLink(klass.meetingLink);
  return (
    <article>
      <Link href="/student/classes" className="text-sm font-semibold text-accent">
        ← {t.back}
      </Link>
      {(await searchParams).joined && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success"
        >
          {t.joined}
        </p>
      )}
      <div className="my-7 rounded-2xl border border-line/10 bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold text-accent">{klass.title}</p>
        <h1 className="mt-3 text-3xl font-bold">{klass.course.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-muted">
          {klass.course.shortDescription}
        </p>
        <div className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <CalendarDays size={20} className="shrink-0 text-accent" />
            <div>
              <p className="font-semibold">{t.schedule}</p>
              <p className="mt-2 leading-7 text-muted">
                {klass.startDate.toLocaleDateString(locale, { timeZone: klass.timezone })}–
                {klass.endDate.toLocaleDateString(locale, { timeZone: klass.timezone })}
                <br />
                {klass.daysOfWeek.join(" · ")} · {klass.startTime}–{klass.endTime}
                <br />
                {klass.timezone}
                {klass.location && (
                  <>
                    <br />
                    {klass.location}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <GraduationCap size={20} className="shrink-0 text-accent" />
            <div>
              <p className="font-semibold">{t.teacher}</p>
              <p className="mt-2 text-muted">{klass.instructor.fullName}</p>
            </div>
          </div>
        </div>
        {meeting && (
          <a
            href={meeting}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950"
          >
            {locale === "en" ? "Open live class" : "တိုက်ရိုက်အတန်း ဖွင့်ရန်"}
          </a>
        )}
      </div>
      <section className="mb-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
          <Video size={20} />
          {t.videos}
        </h2>
        {videos.length ? (
          <VideoLibrary videos={videos} locale={locale} hrefPrefix="/student/videos" />
        ) : (
          <p className="rounded-2xl border border-dashed border-line/20 p-6 text-sm text-muted">
            {t.noVideos}
          </p>
        )}
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line/10 bg-surface p-6">
          <h2 className="mb-5 text-lg font-bold">{t.materials}</h2>
          {materials.length ? (
            <div className="grid gap-3">
              {materials.map((file) => {
                const href = safeLink(file.fileUrl);
                return href ? (
                  <a
                    key={file.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-line/10 p-4 text-sm font-semibold"
                  >
                    {file.title}
                    <Download size={16} />
                  </a>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-sm leading-7 text-muted">{t.noMaterials}</p>
          )}
        </section>
        <section className="rounded-2xl border border-line/10 bg-surface p-6">
          <h2 className="mb-5 text-lg font-bold">{t.announcements}</h2>
          {klass.announcements.length ? (
            <div className="space-y-5">
              {klass.announcements.map((item) => (
                <div key={item.id}>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">{t.noUpdates}</p>
          )}
        </section>
      </div>
    </article>
  );
}
