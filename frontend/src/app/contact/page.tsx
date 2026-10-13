import { contactAction } from "@backend/actions/public";
import { ActionForm } from "@/components/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Section } from "@/components/section";

export default function ContactPage() {
  return (
    <Section eyebrow="Contact" title="21CT ကိုဆက်သွယ်ရန်">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-line/10 bg-surface p-6">
          <ActionForm action={contactAction} submitLabel="Send message">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="name" label="Name" required />
              <TextField name="email" label="Email" type="email" required />
              <TextField name="phone" label="Phone" />
              <TextField name="subject" label="Subject" required />
              <SelectField name="inquiryType" label="Inquiry type" options={["GENERAL_QUESTION", "COURSE_QUESTION", "ENROLLMENT_HELP", "PAYMENT_HELP", "TECHNICAL_SUPPORT", "PARTNERSHIP", "INSTRUCTOR_APPLICATION"]} required />
              <SelectField name="contactPreference" label="Contact method preference" options={["EMAIL", "PHONE", "MESSENGER", "VIBER"]} required />
            </div>
            <TextField name="courseInterest" label="Course interest" />
            <TextAreaField name="message" label="Message" required />
          </ActionForm>
        </div>
        <div className="rounded-lg border border-line/10 bg-surface p-6">
          <h2 className="text-2xl font-black">Support</h2>
          <p className="mt-4 leading-8 text-muted">Course questions, enrollment help, payment support, partnerships, and instructor applications are welcome.</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div><dt className="text-subtle">Email</dt><dd className="font-bold text-accent">support@21ct.edu.mm</dd></div>
            <div><dt className="text-subtle">Phone</dt><dd className="font-bold text-accent">+95 9 123 456 789</dd></div>
            <div><dt className="text-subtle">Office</dt><dd className="font-bold text-accent">Yangon, Myanmar</dd></div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
