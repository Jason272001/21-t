import { enrollmentAction } from "@backend/actions/public";
import { ActionForm } from "@/components/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Section } from "@/components/section";
import { prisma } from "@backend/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EnrollmentPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const params = await searchParams;
  const classes = await prisma.classSchedule.findMany({
    where: { status: { in: ["OPEN_FOR_ENROLLMENT", "UPCOMING"] } },
    include: { course: true, instructor: true },
    orderBy: { startDate: "asc" },
  });

  return (
    <Section eyebrow="Enrollment" title="အတန်းအပ်နှံရန်" body="Student registration, class selection, seat check, confirmation email, and dashboard enrollment are handled by this flow.">
      <div className="rounded-lg border border-white/10 bg-slate-900 p-6">
        <ActionForm action={enrollmentAction} submitLabel="Enrollment တင်ရန်">
          <label className="grid gap-2 text-sm font-semibold text-slate-200">
            Selected class
            <select name="classScheduleId" defaultValue={params.classId} required className="min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white">
              <option value="">Select class</option>
              {classes.map((klass) => (
                <option key={klass.id} value={klass.id}>
                  {klass.course.title} - {klass.title} ({klass.startDate.toLocaleDateString()})
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="fullName" label="Student full name" required />
            <TextField name="email" label="Email" type="email" required />
            <TextField name="phone" label="Phone number" required />
            <TextField name="dateOfBirth" label="Date of birth" type="date" />
            <TextField name="educationLevel" label="Current education level" required />
            <TextField name="occupation" label="Current occupation" required />
            <TextField name="city" label="City" required />
            <TextField name="country" label="Country" required />
            <SelectField name="preferredContact" label="Preferred contact method" options={["EMAIL", "PHONE", "MESSENGER", "VIBER"]} required />
            <TextField name="emergencyName" label="Emergency contact name" required />
            <TextField name="emergencyPhone" label="Emergency contact phone" required />
            <TextField name="heardFrom" label="How did you hear about 21CT?" />
          </div>
          <TextAreaField name="priorExperience" label="Prior experience" />
          <TextAreaField name="learningGoal" label="Learning goal" required />
          <label className="flex gap-3 text-sm text-slate-200"><input name="agreement" type="checkbox" required /> Information is accurate.</label>
          <label className="flex gap-3 text-sm text-slate-200"><input name="terms" type="checkbox" required /> I accept terms and conditions.</label>
          <label className="flex gap-3 text-sm text-slate-200"><input name="privacy" type="checkbox" required /> I accept privacy policy.</label>
        </ActionForm>
      </div>
    </Section>
  );
}
