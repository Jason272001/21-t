import { adminContext } from "@/lib/admin-context";
import { PortalShell } from "@/components/portal/shell";
import { ActionForm } from "@/components/forms/action-form";
import { Input } from "@/components/portal/management-editors";
import { updateOwnAccountAction } from "@backend/actions/account";
import { workspaceCopy } from "@/lib/workspace-copy";
import { prisma } from "@backend/lib/prisma";
export default async function Page() {
  const { user, locale } = await adminContext(),
    t = workspaceCopy(locale),
    en = locale === "en";
  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { username: true },
  });
  return (
    <PortalShell
      title={en ? "My account" : "ကျွန်ုပ်၏အကောင့်"}
      name={user.name || user.email}
      locale={locale}
      admin
    >
      <div className="max-w-3xl rounded-2xl border border-line/10 bg-surface p-6 sm:p-8">
        <p className="mb-6 text-sm leading-7 text-muted">
          {en
            ? "Update your personal details and sign-in credentials. Confirm your current password to save. You will be signed out on all devices after saving."
            : "ကိုယ်ရေးအချက်အလက်နှင့် အကောင့်ဝင်ရန်အချက်အလက်များကို ပြင်ပါ။ လက်ရှိစကားဝှက်ဖြင့် အတည်ပြုပါ။ သိမ်းပြီးပါက စက်အားလုံးမှ အကောင့်ထွက်မည်။"}
        </p>
        <ActionForm action={updateOwnAccountAction} submitLabel={t.save}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="name" label={t.name} value={user.name} required />
            <Input name="email" label={t.email} value={user.email} type="email" required />
            <Input name="username" label={t.username} value={record.username} required />
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            {en ? "Current password" : "လက်ရှိစကားဝှက်"}
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className="min-h-11 rounded-xl border border-line/20 bg-page p-3"
            />
          </label>
          <Input
            name="newPassword"
            label={en ? "New password (optional)" : "စကားဝှက်အသစ် (ရွေးချယ်နိုင်)"}
            type="password"
            hint={t.passwordHint}
          />
          <Input
            name="confirmPassword"
            label={en ? "Confirm new password" : "စကားဝှက်အသစ် အတည်ပြုပါ"}
            type="password"
          />
        </ActionForm>
      </div>
    </PortalShell>
  );
}
