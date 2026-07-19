import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EnrollmentConfirmationPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { confirmationNumber: number },
    include: { studentProfile: { include: { user: true } }, classSchedule: { include: { course: true, instructor: true } }, payments: true },
  });
  if (!enrollment) notFound();
  const payment = enrollment.payments[0];
  return (
    <main className="bg-slate-950 px-4 py-12 text-white lg:px-6">
      <section className="mx-auto max-w-3xl rounded-lg border border-cyan-300/20 bg-slate-900 p-6 print:bg-white print:text-black">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Enrollment confirmation</h1>
        <p className="mt-2 text-slate-300">Confirmation number: <strong className="text-cyan-200">{enrollment.confirmationNumber}</strong></p>
        <div className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-slate-950 p-5 text-sm">
          <Row label="Student" value={enrollment.studentProfile.user.name || ""} />
          <Row label="Course" value={enrollment.classSchedule.course.title} />
          <Row label="Class" value={enrollment.classSchedule.title} />
          <Row label="Instructor" value={enrollment.classSchedule.instructor.fullName} />
          <Row label="Date and time" value={`${enrollment.classSchedule.startDate.toLocaleDateString()} ${enrollment.classSchedule.startTime}-${enrollment.classSchedule.endTime}`} />
          <Row label="Delivery" value={enrollment.classSchedule.deliveryType.replaceAll("_", " ")} />
          <Row label="Location / Meeting" value={enrollment.classSchedule.location || enrollment.classSchedule.meetingLink || "To be announced"} />
          <Row label="Amount" value={formatMoney(payment?.amount || 0)} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <StatusBadge label={enrollment.status} tone="green" />
          <StatusBadge label={payment?.status || "UNPAID"} tone={payment?.status === "PAID" ? "green" : "orange"} />
        </div>
        <div className="mt-8 rounded-lg bg-cyan-300/10 p-5">
          <h2 className="font-black">Next steps</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">Admin team မှ enrollment ကိုစစ်ဆေးပြီး email သို့မဟုတ် preferred contact method ဖြင့် ဆက်သွယ်ပါမည်။ Payment လိုအပ်ပါက receipt ကိုသိမ်းထားပါ။</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <button onClick={() => window.print()} className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Print receipt</button>
          <ButtonLink href="/student" variant="secondary">Student dashboard</ButtonLink>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-slate-400">{label}</span><span className="font-semibold text-white print:text-black">{value}</span></div>;
}
