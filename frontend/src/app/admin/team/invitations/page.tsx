import Link from "next/link";
import { prisma } from "@backend/lib/prisma";
import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { InvitationGenerator } from "@/components/portal/invitation-generator";
import { ActionForm } from "@/components/forms/action-form";
import { revokeInvitationAction } from "@backend/actions/invitations";
import { canInvite } from "@backend/server/invitations";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { user, locale } = await adminContext("team"),
    en = locale === "en";
  const page = Math.min(10000, Math.max(1, Math.floor(Number((await searchParams).page) || 1)));
  const invitations = await prisma.adminInvitation.findMany({
    where: user.adminLevel === "OWNER" ? {} : { issuedById: user.id },
    include: {
      issuedBy: {
        select: { name: true, role: true, adminLevel: true, isActive: true, localOnly: true },
      },
      acceptedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 51,
    skip: (page - 1) * 50,
  });
  return (
    <PortalShell
      title={en ? "Admin invitations" : "စီမံသူ ဖိတ်ကြားချက်များ"}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <Link href="/admin/team" className="mb-6 inline-block text-sm font-semibold text-accent">
        ← {en ? "Admin team" : "စီမံသူအဖွဲ့"}
      </Link>
      <div className="grid items-start gap-7 2xl:grid-cols-2">
        <InvitationGenerator owner={user.adminLevel === "OWNER"} locale={locale} />
        <section>
          <h2 className="mb-4 text-xl font-bold">
            {en ? "Invitation history" : "ဖိတ်ကြားမှု မှတ်တမ်း"}
          </h2>
          {!invitations.length && (
            <p className="rounded-xl border border-dashed border-line/20 p-6 text-sm text-muted">
              {en ? "No invitations yet." : "ဖိတ်ကြားချက် မရှိသေးပါ။"}
            </p>
          )}
          <div className="grid gap-4">
            {invitations.slice(0, 50).map((invite) => {
              const active =
                !invite.acceptedAt &&
                !invite.revokedAt &&
                invite.expiresAt > new Date() &&
                canInvite(invite.issuedBy, invite.adminLevel);
              const status = invite.acceptedAt
                ? en
                  ? "Used"
                  : "အသုံးပြုပြီး"
                : invite.revokedAt
                  ? en
                    ? "Revoked"
                    : "ပယ်ဖျက်ပြီး"
                  : invite.expiresAt <= new Date()
                    ? en
                      ? "Expired"
                      : "သက်တမ်းကုန်"
                    : !active
                      ? en
                        ? "Unavailable"
                        : "မရနိုင်ပါ"
                      : en
                        ? "Active"
                        : "အသုံးပြုနိုင်";
              return (
                <article
                  key={invite.id}
                  className="rounded-xl border border-line/10 bg-surface p-5"
                >
                  <p className="text-xs text-subtle">
                    {status} · …{invite.label}
                  </p>
                  <h3 className="mt-2 font-bold">
                    {invite.adminLevel === "MANAGER"
                      ? en
                        ? "Manager"
                        : "မန်နေဂျာ"
                      : en
                        ? "Staff"
                        : "ဝန်ထမ်း"}
                  </h3>
                  {invite.note && (
                    <p className="mt-2 break-words text-sm text-muted">{invite.note}</p>
                  )}
                  <p className="mt-2 text-xs leading-6 text-subtle">
                    {en ? "Expires" : "သက်တမ်းကုန်ချိန်"}:{" "}
                    {invite.expiresAt.toLocaleString(locale, { timeZone: "Asia/Yangon" })} ·
                    Asia/Yangon
                  </p>
                  <p className="text-xs text-subtle">
                    {en ? "Created by" : "ဖန်တီးသူ"}: {invite.issuedBy.name || "21CT"}
                  </p>
                  {invite.acceptedAt && (
                    <p className="mt-2 text-sm text-muted">
                      {en ? "Account created" : "အကောင့်ဖွင့်ပြီး"}:{" "}
                      {invite.acceptedBy?.name || "—"}
                    </p>
                  )}
                  {!invite.acceptedAt && !invite.revokedAt && (
                    <div className="mt-4">
                      <ActionForm
                        action={revokeInvitationAction.bind(null, invite.id)}
                        submitLabel={en ? "Revoke link" : "လင့်ခ် ပယ်ဖျက်ရန်"}
                      >
                        {null}
                      </ActionForm>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <nav className="mt-6 flex gap-6 text-sm text-accent" aria-label="Invitation pages">
            {page > 1 && <Link href={`?page=${page - 1}`}>{en ? "Previous" : "ရှေ့သို့"}</Link>}
            {invitations.length > 50 && (
              <Link href={`?page=${page + 1}`}>{en ? "Next" : "နောက်သို့"}</Link>
            )}
          </nav>
        </section>
      </div>
    </PortalShell>
  );
}
