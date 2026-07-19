"use server";

import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import { confirmationNumber } from "../lib/utils";
import { contactSchema, enrollmentSchema, newsletterSchema, registerSchema } from "../validators/forms";
import { emailTemplates, sendEmail } from "../server/email";

export type ActionState = { ok: boolean; message: string };

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Invalid data" };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false, message: "This email is already registered." };

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: "STUDENT",
      studentProfile: { create: {} },
    },
  });
  await sendEmail({ to: user.email, ...emailTemplates.welcome(user.name || "Student") });
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
    html: `<p>${parsed.data.name} ရေ၊ သင့် message ကို လက်ခံရရှိပါပြီ။ 21CT team မှ ပြန်လည်ဆက်သွယ်ပါမည်။</p>`,
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
  const parsed = enrollmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Please complete all required enrollment fields." };

  const klass = await prisma.classSchedule.findUnique({
    where: { id: parsed.data.classScheduleId },
    include: { course: true, instructor: true },
  });
  if (!klass) return { ok: false, message: "Selected class was not found." };
  if (klass.currentEnrolled >= klass.maxStudents) return { ok: false, message: "This class is full." };

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.fullName },
    create: {
      email: parsed.data.email,
      name: parsed.data.fullName,
      role: "STUDENT",
      passwordHash: await bcrypt.hash(`21CT-${Math.random().toString(36).slice(2)}`, 12),
    },
  });

  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      phone: parsed.data.phone,
      educationLevel: parsed.data.educationLevel,
      occupation: parsed.data.occupation,
      city: parsed.data.city,
      country: parsed.data.country,
      preferredContact: parsed.data.preferredContact as never,
      emergencyName: parsed.data.emergencyName,
      emergencyPhone: parsed.data.emergencyPhone,
      learningGoal: parsed.data.learningGoal,
    },
    create: {
      userId: user.id,
      phone: parsed.data.phone,
      educationLevel: parsed.data.educationLevel,
      occupation: parsed.data.occupation,
      city: parsed.data.city,
      country: parsed.data.country,
      preferredContact: parsed.data.preferredContact as never,
      emergencyName: parsed.data.emergencyName,
      emergencyPhone: parsed.data.emergencyPhone,
      learningGoal: parsed.data.learningGoal,
    },
  });

  const enrollment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const fresh = await tx.classSchedule.findUniqueOrThrow({ where: { id: klass.id } });
    if (fresh.currentEnrolled >= fresh.maxStudents) throw new Error("This class is full.");
    await tx.classSchedule.update({
      where: { id: klass.id },
      data: { currentEnrolled: { increment: 1 } },
    });
    return tx.enrollment.create({
      data: {
        confirmationNumber: confirmationNumber(),
        studentProfileId: profile.id,
        classScheduleId: klass.id,
        status: klass.price > 0 ? "AWAITING_PAYMENT" : "CONFIRMED",
        priorExperience: parsed.data.priorExperience,
        learningGoal: parsed.data.learningGoal,
        heardFrom: parsed.data.heardFrom,
        payments: {
          create: {
            amount: klass.price,
            method: klass.price > 0 ? "MANUAL" : "FREE",
            status: klass.price > 0 ? "UNPAID" : "PAID",
          },
        },
      },
    });
  });

  await sendEmail({
    to: parsed.data.email,
    ...emailTemplates.enrollmentReceived(parsed.data.fullName, klass.course.title),
  });
  redirect(`/enrollment/confirmation/${enrollment.confirmationNumber}`);
}
