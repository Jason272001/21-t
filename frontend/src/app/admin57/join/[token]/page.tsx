import Link from "next/link";
import type { Metadata } from "next";
import { getLanguage } from "@/lib/i18n-server";
import { inspectInvitation } from "@backend/server/invitations";
import { getCurrentUser } from "@backend/lib/access";
import { acceptInvitationAction, signOutForInvitationAction } from "@backend/actions/invitations";
import { ActionForm } from "@/components/forms/action-form";
import { Input } from "@/components/portal/management-editors";
import { PasswordField } from "@/components/forms/password-field";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin invitation",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params,
    { locale } = await getLanguage(),
    en = locale === "en";
  const invite = await inspectInvitation(token),
    user = await getCurrentUser();
  return (
    <main className="min-h-screen bg-page px-4 py-12 text-foreground">
      <section className="mx-auto max-w-xl rounded-2xl border border-line/10 bg-surface p-6 sm:p-8">
        <p className="text-sm font-bold text-accent">
          21CT · {en ? "Team invitation" : "အဖွဲ့ဝင် ဖိတ်ကြားချက်"}
        </p>
        {!invite ? (
          <>
            <h1 className="mt-5 text-2xl font-bold">
              {en ? "Invitation unavailable" : "ဖိတ်ကြားချက် မရနိုင်ပါ"}
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              {en
                ? "This link is invalid, expired, revoked or already used. Ask the person who invited you for a new link."
                : "ဤလင့်ခ်သည် မမှန်ကန်ခြင်း၊ သက်တမ်းကုန်ခြင်း၊ ပယ်ဖျက်ခြင်း သို့မဟုတ် အသုံးပြုပြီး ဖြစ်နိုင်သည်။ ဖိတ်ကြားသူထံမှ လင့်ခ်အသစ် တောင်းပါ။"}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-2xl font-bold">
              {en ? "Create your admin account" : "သင့်စီမံသူအကောင့် ဖွင့်ရန်"}
            </h1>
            <p className="my-5 text-sm leading-7 text-muted">
              {en ? "Access level" : "စီမံခွင့် အဆင့်"}:{" "}
              <strong>
                {invite.adminLevel === "MANAGER"
                  ? en
                    ? "Manager"
                    : "မန်နေဂျာ"
                  : en
                    ? "Staff"
                    : "ဝန်ထမ်း"}
              </strong>
              .{" "}
              {en
                ? "Choose your own details and password. This invitation creates one new account."
                : "ကိုယ်ပိုင် အချက်အလက်နှင့် စကားဝှက်ကို သတ်မှတ်ပါ။ ဤဖိတ်ကြားချက်ဖြင့် အကောင့်တစ်ခုသာ ဖွင့်နိုင်သည်။"}
            </p>
            {user ? (
              <div className="rounded-xl border border-line/10 p-5">
                <p className="mb-4 text-sm text-muted">
                  {en
                    ? "You are already signed in. Sign out before creating a new invited account."
                    : "သင် အကောင့်ဝင်ထားပါသည်။ အကောင့်အသစ် မဖွင့်မီ အကောင့်ထွက်ပါ။"}
                </p>
                <form action={signOutForInvitationAction.bind(null, token)}>
                  <button className="min-h-11 rounded-lg bg-cyan-300 px-4 font-bold text-slate-950">
                    {en ? "Sign out to continue" : "ဆက်လုပ်ရန် အကောင့်ထွက်ပါ"}
                  </button>
                </form>
              </div>
            ) : (
              <ActionForm
                action={acceptInvitationAction.bind(null, token)}
                submitLabel={en ? "Create my account" : "အကောင့် ဖွင့်ရန်"}
              >
                <Input name="name" label={en ? "Full name" : "အမည်အပြည့်အစုံ"} required />
                <Input name="email" type="email" label={en ? "Email" : "အီးမေးလ်"} required />
                <Input name="username" label={en ? "Username" : "အသုံးပြုသူအမည်"} required />
                <PasswordField
                  name="password"
                  label={en ? "Password" : "စကားဝှက်"}
                  locale={locale}
                  hint={
                    en
                      ? "At least 8 characters. Any letters, numbers or symbols are allowed."
                      : "အနည်းဆုံး ၈ လုံး။ အက္ခရာ၊ ဂဏန်းနှင့် သင်္ကေတများ သုံးနိုင်ပါသည်။"
                  }
                  required
                />
                <PasswordField
                  name="confirmPassword"
                  label={en ? "Confirm password" : "စကားဝှက် အတည်ပြုပါ"}
                  locale={locale}
                  required
                />
              </ActionForm>
            )}
          </>
        )}
        <Link
          href="/admin57/log-in"
          className="mt-6 inline-block text-sm font-semibold text-accent"
        >
          {en ? "Already have an admin account? Sign in" : "စီမံသူအကောင့် ရှိပြီးပါက အကောင့်ဝင်ရန်"}
        </Link>
      </section>
    </main>
  );
}
