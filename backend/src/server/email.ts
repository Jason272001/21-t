type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: EmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email:dev] ${input.subject} -> ${input.to}`);
    return { ok: true, provider: "console" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "21CT <noreply@example.com>",
      ...input,
    }),
  });

  if (!response.ok) throw new Error("Email provider rejected the request");
  return { ok: true, provider: "resend" };
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "21CT မှ ကြိုဆိုပါတယ်",
    html: `<p>${name} ရေ၊ 21st Century Technology မှ ကြိုဆိုပါတယ်။ မြန်မာလို IT ပညာရပ်များကို အတူတူလေ့လာကြပါစို့။</p>`,
  }),
  enrollmentReceived: (name: string, course: string) => ({
    subject: "အတန်းအပ်နှံမှု လက်ခံရရှိပါပြီ",
    html: `<p>${name} ရေ၊ ${course} အတွက် enrollment ကို လက်ခံရရှိပါပြီ။ 21CT team မှ မကြာမီအတည်ပြုပေးပါမည်။</p>`,
  }),
  paymentReminder: (course: string) => ({
    subject: "Payment reminder",
    html: `<p>${course} အတွက် payment status ကို စစ်ဆေးပေးပါရန် အသိပေးအပ်ပါသည်။</p>`,
  }),
  classReminder: (course: string) => ({
    subject: "Class starting reminder",
    html: `<p>${course} class စတင်ရန်နီးကပ်လာပါပြီ။ Materials နှင့် schedule ကို dashboard တွင်ကြည့်ရှုနိုင်ပါသည်။</p>`,
  }),
  passwordReset: () => ({
    subject: "Password reset request",
    html: "<p>Password reset request ကို လက်ခံရရှိပါသည်။ Secure reset flow ကို production email provider နှင့်ချိတ်ဆက်ပြီး အသုံးပြုနိုင်ပါသည်။</p>",
  }),
};
