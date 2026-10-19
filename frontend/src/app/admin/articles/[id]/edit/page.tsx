import { notFound } from "next/navigation";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { ArticleEditor, DeleteEditor } from "@/components/portal/management-editors";
import { ActionForm } from "@/components/forms/action-form";
import { removeCommentAction } from "@backend/actions/discussion";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; commentsPage?: string }>;
}) {
  const { user, locale, t } = await adminContext("articles");
  const { id } = await params;
  const query = await searchParams;
  const page = Math.min(10000, Math.max(1, Math.floor(Number(query.commentsPage) || 1)));
  const record = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      comments: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 20,
        skip: (page - 1) * 20,
      },
      _count: { select: { comments: true } },
    },
  });
  if (!record) notFound();
  return (
    <PortalShell title={record.title} name={user.name || user.email} locale={locale} admin>
      {(await searchParams).saved && (
        <p role="status" className="mb-4 text-accent">
          {t.saved}
        </p>
      )}
      <ArticleEditor key={record.id} article={record} locale={locale} />
      {record.status === "PUBLISHED" && (
        <a href={`/articles/${record.slug}`} className="my-6 inline-block text-accent">
          {t.view}
        </a>
      )}
      <DeleteEditor kind="article" id={record.id} confirmation={record.title} locale={locale} />
      <section className="mt-8 max-w-4xl rounded-xl border border-line/10 bg-surface p-6">
        <h2 className="text-xl font-bold">
          {locale === "en" ? "Comments" : "မှတ်ချက်များ"} ({record._count.comments})
        </h2>
        <p className="mt-3 text-sm text-muted">
          {locale === "en"
            ? "You can remove spam or abusive comments. No commenter identity is stored."
            : "စပမ်းနှင့် မသင့်လျော်သော မှတ်ချက်များကို ဖယ်ရှားနိုင်ပါသည်။ မှတ်ချက်ပေးသူ အချက်အလက် မသိမ်းပါ။"}
        </p>
        {record.comments.map((comment) => (
          <div key={comment.id} className="mt-5 border-t border-line/10 pt-5">
            <time className="text-xs text-subtle" dateTime={comment.createdAt.toISOString()}>
              {comment.createdAt.toLocaleString(locale, { timeZone: "Asia/Yangon" })} · Asia/Yangon
            </time>
            <p className="my-4 whitespace-pre-wrap break-words text-sm">{comment.body}</p>
            <ActionForm
              action={removeCommentAction.bind(null, record.id, comment.id)}
              submitLabel={locale === "en" ? "Remove comment" : "မှတ်ချက် ဖျက်ရန်"}
            >
              {null}
            </ActionForm>
          </div>
        ))}
        <div className="mt-6 flex gap-6 text-sm text-accent">
          {page > 1 && (
            <a href={`?commentsPage=${page - 1}`}>{locale === "en" ? "Newer" : "အသစ်များ"}</a>
          )}
          {page * 20 < record._count.comments && (
            <a href={`?commentsPage=${page + 1}`}>{locale === "en" ? "Older" : "အဟောင်းများ"}</a>
          )}
        </div>
      </section>
    </PortalShell>
  );
}
