"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import { requireUser, backendConfigured } from "../lib/access";
import { enrollStudent, EnrollmentError } from "../server/enrollment";
import {
  contactSchema,
  enrollmentSchema,
  newsletterSchema,
  registerSchema,
} from "../validators/forms";
import { emailTemplates, sendEmail, escapeHtml } from "../server/email";

export type ActionState = { ok: boolean; message: string };

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!backendConfigured())
    return { ok: false, message: "Account registration is not configured yet." };
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message || "Invalid data" };

  const existing = await prisma.user.findFirst({
    where: { email: { equals: parsed.data.email, mode: "insensitive" } },
  });
  if (existing) return { ok: false, message: "This email is already registered." };

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: "STUDENT",
        studentProfile: { create: {} },
      },
    });
    await sendEmail({ to: user.email, ...emailTemplates.welcome(user.name || "Student") }).catch(
      () => console.warn("Welcome email could not be sent."),
    );
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
          ? "This email is already registered."
          : "Could not create your account. Please try again.",
    };
  }
  redirect("/login?registered=1");
}

export async function contactAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Please check the contact form fields." };
  await prisma.contactSubmission.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
      inquiryType: parsed.data.inquiryType as never,
      courseInterest: parsed.data.courseInterest,
      contactPreference: parsed.data.contactPreference as never,
    },
  });
  await sendEmail({
    to: parsed.data.email,
    subject: "21CT contact form confirmation",
    html: `<p>${escapeHtml(parsed.data.name)} ရေ၊ သင့် message ကို လက်ခံရရှိပါပြီ။ 21CT team မှ ပြန်လည်ဆက်သွယ်ပါမည်။</p>`,
  });
  revalidatePath("/contact");
  return { ok: true, message: "Message sent successfully." };
}

export async function newsletterAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Valid email is required." };
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.name },
    create: { email: parsed.data.email, name: parsed.data.name, source: "website" },
  });
  return { ok: true, message: "Subscribed. 21CT updates will arrive soon." };
}

export async function enrollmentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = enrollmentSchema.safeParse({ ...Object.fromEntries(formData), email: user.email });
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please check the enrollment fields.",
    };
  let number: string;
  try {
    const result = await enrollStudent(user.id, parsed.data);
    number = result.enrollment.confirmationNumber;
    if (result.created) {
      const klass = await prisma.classSchedule.findUniqueOrThrow({
        where: { id: parsed.data.classScheduleId },
        include: { course: true },
      });
      await sendEmail({
        to: user.email,
        ...emailTemplates.enrollmentReceived(parsed.data.fullName, klass.course.title),
      }).catch(() => console.warn("Enrollment email could not be sent."));
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof EnrollmentError
          ? error.message
          : "Enrollment could not be completed. Please try again.",
    };
  }
  for (const path of ["/student", "/admin", "/schedule", "/enrollment", "/"]) revalidatePath(path);
  redirect(`/enrollment/confirmation/${number}`);
}
