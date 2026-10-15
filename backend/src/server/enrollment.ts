import { randomBytes } from "node:crypto";
import type { z } from "zod";
import { prisma } from "../lib/prisma";
import { enrollmentSchema } from "../validators/forms";

export class EnrollmentError extends Error {}

export async function enrollStudent(userId: string, input: z.infer<typeof enrollmentSchema>) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user?.isActive || user.email.toLowerCase() !== input.email.toLowerCase())
      throw new EnrollmentError("Sign in with your own account to enroll.");
    const profileData = {
      phone: input.phone,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      educationLevel: input.educationLevel,
      occupation: input.occupation,
      city: input.city,
      country: input.country,
      preferredContact: input.preferredContact,
      emergencyName: input.emergencyName,
      emergencyPhone: input.emergencyPhone,
      learningGoal: input.learningGoal,
    };
    const profile = await tx.studentProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    });
    // Lock the seat counter before checking duplicates, status and capacity.
    const rows = await tx.$queryRaw<
      { id: string }[]
    >`SELECT "id" FROM "ClassSchedule" WHERE "id" = ${input.classScheduleId} FOR UPDATE`;
    if (!rows.length) throw new EnrollmentError("Selected class was not found.");
    const existing = await tx.enrollment.findUnique({
      where: {
        studentProfileId_classScheduleId: {
          studentProfileId: profile.id,
          classScheduleId: input.classScheduleId,
        },
      },
    });
    if (existing) return { enrollment: existing, created: false };
    const klass = await tx.classSchedule.findUniqueOrThrow({
      where: { id: input.classScheduleId },
      include: { course: true },
    });
    if (
      klass.status !== "OPEN_FOR_ENROLLMENT" ||
      klass.course.status !== "PUBLISHED" ||
      klass.enrollmentDeadline <= new Date() ||
      klass.startDate <= new Date()
    )
      throw new EnrollmentError("Enrollment for this class is closed.");
    if (klass.currentEnrolled >= klass.maxStudents)
      throw new EnrollmentError("This class is full.");
    await tx.user.update({ where: { id: userId }, data: { name: input.fullName } });
    await tx.classSchedule.update({
      where: { id: klass.id },
      data: { currentEnrolled: { increment: 1 } },
    });
    const enrollment = await tx.enrollment.create({
      data: {
        confirmationNumber: `21CT-${randomBytes(12).toString("hex")}`,
        studentProfileId: profile.id,
        classScheduleId: klass.id,
        status: klass.price > 0 ? "AWAITING_PAYMENT" : "CONFIRMED",
        priorExperience: input.priorExperience,
        learningGoal: input.learningGoal,
        heardFrom: input.heardFrom,
        payments: {
          create: {
            amount: klass.price,
            method: klass.price > 0 ? "MANUAL" : "FREE",
            status: klass.price > 0 ? "UNPAID" : "PAID",
            paidDate: klass.price > 0 ? null : new Date(),
          },
        },
      },
    });
    return { enrollment, created: true };
  });
}
