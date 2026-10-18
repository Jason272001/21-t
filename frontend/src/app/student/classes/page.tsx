import Link from "next/link";
import { requireStudent } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { getLanguage } from "@/lib/i18n-server";
import { studentCopy } from "@/lib/student-copy";
import { StudentClasses } from "@/components/portal/student-classes";
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireStudent(),
    { locale } = await getLanguage(),
    t = studentCopy(locale),
    page = Math.floor(Math.max(1, Math.min(10000, Number((await searchParams).page) || 1)));
  const records = await prisma.enrollment.findMany({
    where: { studentProfile: { userId: user.id } },
    include: {
      classSchedule: { include: { course: { select: { title: true, shortDescription: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 51,
    skip: (page - 1) * 50,
  });
  return (
    <section>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t.classes}</h1>
        <Link
          href="/student/join"
          className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950"
        >
          {t.join}
        </Link>
      </div>
      <StudentClasses records={records.slice(0, 50)} locale={locale} />
      <nav aria-label="Pagination" className="mt-6 flex gap-5 text-accent">
        {page > 1 && (
          <Link href={`?page=${page - 1}`}>{locale === "en" ? "Previous" : "ရှေ့သို့"}</Link>
        )}
        {records.length > 50 && (
          <Link href={`?page=${page + 1}`}>{locale === "en" ? "Next" : "နောက်သို့"}</Link>
        )}
      </nav>
    </section>
  );
}
