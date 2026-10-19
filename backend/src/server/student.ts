import { hashPassword } from "./passwords";
import { prisma } from "../lib/prisma";
import { AdminError } from "./admin";
import { redeemClassCodeInTransaction } from "./workspace";
import type { StudentRegistrationInput } from "../validators/account";
export async function registerStudent(input: StudentRegistrationInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    if (
      await tx.user.findFirst({
        where: {
          OR: [{ email: { equals: input.email, mode: "insensitive" } }, { username: input.email }],
        },
      })
    )
      throw new AdminError(
        "This email is already registered. Sign in and use Join a class instead.",
      );
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "STUDENT",
        studentProfile: { create: {} },
      },
    });
    await redeemClassCodeInTransaction(tx, user.id, input.classCode);
    return { id: user.id, name: user.name, email: user.email };
  });
}
export async function studentClass(userId: string, classId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });
  if (user?.role !== "STUDENT" || !user.isActive) return null;
  return prisma.enrollment.findFirst({
    where: {
      studentProfile: { userId },
      classScheduleId: classId,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      classSchedule: { status: { not: "CANCELLED" } },
    },
    include: {
      classSchedule: {
        include: {
          instructor: { select: { fullName: true } },
          course: true,
          announcements: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });
}
