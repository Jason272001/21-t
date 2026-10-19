import { ActionForm } from "@/components/forms/action-form";
import { Input } from "./management-editors";
import { PasswordField } from "@/components/forms/password-field";
import { updateOwnProfileAction, changeOwnPasswordAction } from "@backend/actions/account";
import type { Locale } from "@/lib/i18n";

export function AccountSettings({
  user,
  locale,
}: {
  user: { name: string | null; email: string; username: string | null };
  locale: Locale;
}) {
  const en = locale === "en";
  return (
    <div className="grid max-w-4xl gap-8">
      <section
        aria-labelledby="profile-title"
        className="rounded-2xl border border-line/10 bg-surface p-5 sm:p-8"
      >
        <h2 id="profile-title" className="text-xl font-bold">
          {en ? "Profile details" : "ကိုယ်ရေးအချက်အလက်"}
        </h2>
        <p className="mb-6 mt-3 text-sm leading-7 text-muted">
          {en
            ? "Edit only the details you want to change. No password is needed, and you stay signed in."
            : "ပြောင်းလိုသည့် အချက်အလက်ကိုသာ ပြင်ပါ။ စကားဝှက် မလိုအပ်ဘဲ အကောင့်တွင် ဆက်ဝင်ထားမည်။"}
        </p>
        <ActionForm
          action={updateOwnProfileAction}
          submitLabel={en ? "Save profile details" : "ကိုယ်ရေးအချက်အလက် သိမ်းရန်"}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              name="name"
              label={en ? "Full name" : "အမည်အပြည့်အစုံ"}
              value={user.name}
              required
            />
            <Input
              name="email"
              type="email"
              label={en ? "Email" : "အီးမေးလ်"}
              value={user.email}
              required
            />
            <Input
              name="username"
              label={en ? "Username (optional)" : "အသုံးပြုသူအမည် (ရွေးချယ်နိုင်)"}
              value={user.username}
              hint={
                en
                  ? "You can always sign in with your email."
                  : "အီးမေးလ်ဖြင့် အမြဲ အကောင့်ဝင်နိုင်ပါသည်။"
              }
            />
          </div>
        </ActionForm>
      </section>
      <section
        aria-labelledby="password-title"
        className="rounded-2xl border border-line/10 bg-surface p-5 sm:p-8"
      >
        <h2 id="password-title" className="text-xl font-bold">
          {en ? "Change password" : "စကားဝှက် ပြောင်းရန်"}
        </h2>
        <p className="mb-6 mt-3 text-sm leading-7 text-muted">
          {en
            ? "Use this section only when you want a new password. Confirm your current password. After saving, sign in again on your devices."
            : "စကားဝှက်အသစ် ပြောင်းလိုမှ ဤအပိုင်းကို သုံးပါ။ လက်ရှိစကားဝှက်ဖြင့် အတည်ပြုပါ။ သိမ်းပြီးလျှင် စက်များတွင် ပြန်ဝင်ရမည်။"}
        </p>
        <ActionForm
          action={changeOwnPasswordAction}
          submitLabel={en ? "Change password" : "စကားဝှက် ပြောင်းရန်"}
        >
          <PasswordField
            name="currentPassword"
            label={en ? "Current password" : "လက်ရှိစကားဝှက်"}
            autoComplete="current-password"
            minLength={0}
            locale={locale}
            required
          />
          <PasswordField
            name="newPassword"
            label={en ? "New password" : "စကားဝှက်အသစ်"}
            hint={
              en
                ? "At least 8 characters. Any letters, numbers or symbols are allowed."
                : "အနည်းဆုံး ၈ လုံး။ အက္ခရာ၊ ဂဏန်းနှင့် သင်္ကေတများ သုံးနိုင်ပါသည်။"
            }
            locale={locale}
            required
          />
          <PasswordField
            name="confirmPassword"
            label={en ? "Confirm new password" : "စကားဝှက်အသစ် အတည်ပြုပါ"}
            locale={locale}
            required
          />
        </ActionForm>
      </section>
    </div>
  );
}
