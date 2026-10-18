import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { workspaceCopy } from "@/lib/workspace-copy";
import { PortalShell } from "@/components/portal/shell";
import { CodeGenerator } from "@/components/portal/code-generator";
import { ActionForm } from "@/components/forms/action-form";
import { revokeCodeAction } from "@backend/actions/workspace";
import Link from "next/link";
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { user, locale } = await adminContext("codes"),
    t = workspaceCopy(locale),
    now = new Date();
  const page = Math.floor(Math.max(1, Math.min(10000, Number((await searchParams).page) || 1)));
  const [classes, codes] = await Promise.all([
    prisma.classSchedule.findMany({
      where: {
        course: { status: "PUBLISHED" },
        status: { in: ["UPCOMING", "OPEN_FOR_ENROLLMENT", "IN_PROGRESS"] },
        endDate: { gt: now },
      },
      include: { course: { select: { title: true } } },
      orderBy: { startDate: "asc" },
      take: 200,
    }),
    prisma.classAccessCode.findMany({
      include: {
        classSchedule: { include: { course: { select: { title: true } } } },
        redeemedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 51,
      skip: (page - 1) * 50,
    }),
  ]);
  return (
    <PortalShell title={t.codes} name={user.name || user.email} locale={locale} admin>
      <div className="grid items-start gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <CodeGenerator
          locale={locale}
          classes={classes.map((c) => ({
            id: c.id,
            label: `${c.course.title} · ${c.title} · ${c.startDate.toLocaleDateString(locale, { timeZone: c.timezone })}`,
          }))}
        />
        <section>
          <h2 className="mb-4 text-lg font-bold">{t.recent}</h2>
          <div className="space-y-3">
            {codes.slice(0, 50).map((code) => {
              const status = code.redeemedAt
                ? t.used
                : code.revokedAt
                  ? t.revoked
                  : code.expiresAt <= now
                    ? t.expired
                    : t.available;
              return (
                <article key={code.id} className="rounded-2xl border border-line/10 bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-sm font-semibold">•••••• · {code.label}</span>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${status === t.available ? "bg-success/10 text-success" : "bg-overlay/5 text-subtle"}`}
                    >
                      {status}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{code.classSchedule.course.title}</h3>
                  <p className="mt-1 text-sm text-muted">{code.classSchedule.title}</p>
                  <p className="mt-3 break-words text-xs text-subtle">
                    {code.recipient || "—"}
                    {code.paymentReference && ` · ${code.paymentReference}`}
                  </p>
                  <p className="mt-2 text-xs text-subtle">
                    {t.expires}:{" "}
                    {code.expiresAt.toLocaleDateString(locale, { timeZone: "Asia/Yangon" })}
                  </p>
                  {code.redeemedBy && (
                    <p className="mt-2 text-xs text-muted">
                      {t.used}: {code.redeemedBy.name || code.redeemedBy.email}
                    </p>
                  )}
                  {!code.redeemedAt && !code.revokedAt && code.expiresAt > now && (
                    <details className="mt-4 text-sm">
                      <summary className="cursor-pointer text-warning">{t.revoke}</summary>
                      <div className="mt-3">
                        <ActionForm
                          action={revokeCodeAction.bind(null, code.id)}
                          submitLabel={t.revoke}
                        >
                          <label className="flex items-center gap-2">
                            <input name="confirmation" value="revoke" type="checkbox" required />
                            {locale === "en"
                              ? "Cancel this unused code and release its reserved seat."
                              : "အသုံးမပြုရသေးသောကုဒ်ကို ပယ်ဖျက်ပြီး နေရာကို ပြန်လွှတ်ရန်။"}
                          </label>
                        </ActionForm>
                      </div>
                    </details>
                  )}
                </article>
              );
            })}
            {!codes.length && (
              <p className="rounded-2xl border border-dashed border-line/20 p-8 text-sm text-muted">
                {t.empty}
              </p>
            )}
          </div>
          <nav aria-label="Pagination" className="mt-6 flex gap-5 text-sm text-accent">
            {page > 1 && (
              <Link href={`?page=${page - 1}`}>{locale === "en" ? "Previous" : "ရှေ့သို့"}</Link>
            )}
            {codes.length > 50 && (
              <Link href={`?page=${page + 1}`}>{locale === "en" ? "Next" : "နောက်သို့"}</Link>
            )}
          </nav>
        </section>
      </div>
    </PortalShell>
  );
}
