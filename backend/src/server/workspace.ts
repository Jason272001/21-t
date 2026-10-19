import { randomBytes, createHash, randomUUID } from "node:crypto";
import { hashPassword } from "./passwords";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AdminError, assertAdmin } from "./admin";
import type { CodeInput, TeamInput, InstructorInput } from "../validators/workspace";
type Actor = { id: string; role: string };

export async function saveTeamMember(actor: Actor, input: TeamInput, id?: string) {
  await assertAdmin(actor, "team");
  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  return prisma.$transaction(async (tx) => {
    // Serialize account/level changes, then re-read privileges under the lock.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(210018)`;
    const editor = await tx.user.findUnique({ where: { id: actor.id } });
    if (
      editor?.role !== "ADMIN" ||
      !editor.isActive ||
      !["OWNER", "MANAGER"].includes(editor.adminLevel || "")
    )
      throw new AdminError("Administrator access is required.");
    const target = id ? await tx.user.findUnique({ where: { id } }) : null;
    if (id && target?.role !== "ADMIN") throw new AdminError("Admin account not found.");
    if (
      editor.adminLevel !== "OWNER" &&
      ((id && target?.adminLevel !== "STAFF") || input.adminLevel !== "STAFF")
    )
      throw new AdminError("Managers can only create or update Staff accounts.");
    if (id === actor.id && (!input.isActive || input.adminLevel !== editor.adminLevel))
      throw new AdminError("You cannot disable or change your own admin level.");
    if (id === actor.id)
      throw new AdminError(
        "Use My account and confirm your current password to change your own account.",
      );
    if (!id && !passwordHash) throw new AdminError("A password is required for a new admin.");
    const duplicate = await tx.user.findFirst({
      where: {
        OR: [{ email: { equals: input.email, mode: "insensitive" } }, { username: input.username }],
        ...(id ? { id: { not: id } } : {}),
      },
    });
    if (duplicate) throw new AdminError("Email or username is already in use.");
    const data = {
      name: input.name,
      email: input.email,
      username: input.username,
      adminLevel: input.adminLevel,
      isActive: input.isActive,
      passwordHash,
    };
    return id
      ? tx.user.update({
          where: { id },
          data: { ...data, authVersion: { increment: 1 } },
          select: { id: true },
        })
      : tx.user.create({ data: { ...data, role: "ADMIN" }, select: { id: true } });
  });
}

export async function saveInstructor(actor: Actor, input: InstructorInput, id?: string) {
  await assertAdmin(actor, "instructors");
  return prisma.$transaction(async (tx) => {
    const existing = id
      ? await tx.instructorProfile.findUnique({ where: { id }, include: { user: true } })
      : null;
    if (id && existing?.user.role !== "INSTRUCTOR") throw new AdminError("Instructor not found.");
    if (
      await tx.user.findFirst({
        where: {
          email: { equals: input.email, mode: "insensitive" },
          ...(existing ? { id: { not: existing.userId } } : {}),
        },
      })
    )
      throw new AdminError("Email is already in use.");
    const { email, ...profile } = input;
    if (existing) {
      await tx.user.update({
        where: { id: existing.userId },
        data: { name: input.fullName, email },
      });
      return tx.instructorProfile.update({ where: { id }, data: profile });
    }
    return tx.instructorProfile.create({
      data: {
        ...profile,
        slug: `instructor-${randomUUID()}`,
        certifications: [],
        user: { create: { email, name: input.fullName, role: "INSTRUCTOR" } },
      },
    });
  });
}

export async function deleteWorkspaceRecord(
  actor: Actor,
  kind: "course" | "class" | "instructor" | "team",
  id: string,
  confirmation: string,
) {
  await assertAdmin(
    actor,
    kind === "course"
      ? "courses"
      : kind === "class"
        ? "classes"
        : kind === "instructor"
          ? "instructors"
          : "team",
  );
  return prisma.$transaction(async (tx) => {
    if (kind === "team") {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(210018)`;
      const editor = await tx.user.findUnique({ where: { id: actor.id } });
      if (editor?.adminLevel !== "OWNER" || !editor.isActive || editor.role !== "ADMIN")
        throw new AdminError("Only Owners can delete admin accounts.");
      const target = await tx.user.findUnique({ where: { id } });
      if (id === actor.id) throw new AdminError("You cannot delete your own account.");
      if (target?.role !== "ADMIN" || confirmation !== target.email)
        throw new AdminError("Type the account email to confirm deletion.");
      if (
        (await tx.article.count({ where: { authorId: id } })) ||
        (await tx.classAccessCode.count({ where: { issuedById: id } })) ||
        (await tx.instructorProfile.count({ where: { userId: id } }))
      )
        throw new AdminError("This account has linked records. Disable it to preserve history.");
      await tx.user.delete({ where: { id } });
    } else if (kind === "course") {
      const record = await tx.course.findUnique({
        where: { id },
        include: {
          _count: {
            select: { classSchedules: true, videos: true, materials: true, testimonials: true },
          },
        },
      });
      if (!record || confirmation !== record.title)
        throw new AdminError("Type the course title to confirm deletion.");
      if (Object.values(record._count).some(Boolean))
        throw new AdminError("This course has linked records. Archive it instead.");
      await tx.course.delete({ where: { id } });
    } else if (kind === "class") {
      await tx.$queryRaw`SELECT "id" FROM "ClassSchedule" WHERE "id" = ${id} FOR UPDATE`;
      const record = await tx.classSchedule.findUnique({
        where: { id },
        include: { _count: { select: { enrollments: true, accessCodes: true } } },
      });
      if (!record || confirmation !== record.title)
        throw new AdminError("Type the class title to confirm deletion.");
      if (record._count.enrollments || record._count.accessCodes)
        throw new AdminError(
          "This class has enrollments or issued codes. Cancel it to preserve history.",
        );
      await tx.classSchedule.delete({ where: { id } });
    } else {
      const record = await tx.instructorProfile.findUnique({
        where: { id },
        include: {
          user: true,
          _count: {
            select: { courses: true, classes: true, announcements: true, materials: true },
          },
        },
      });
      if (!record || record.user.role !== "INSTRUCTOR" || confirmation !== record.fullName)
        throw new AdminError("Type the instructor name to confirm deletion.");
      if (Object.values(record._count).some(Boolean))
        throw new AdminError(
          "Reassign linked courses and classes before deleting this instructor.",
        );
      await tx.user.delete({ where: { id: record.userId } });
    }
  });
}

const digest = (code: string) =>
  createHash("sha256").update(code.trim().toUpperCase().replaceAll("-", "")).digest("hex");
export async function issueClassCode(actor: Actor, input: CodeInput) {
  await assertAdmin(actor, "codes");
  const raw = randomBytes(12).toString("hex").toUpperCase();
  const code = raw.match(/.{6}/g)!.join("-");
  const record = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "ClassSchedule" WHERE "id" = ${input.classScheduleId} FOR UPDATE`;
    const klass = await tx.classSchedule.findUnique({
      where: { id: input.classScheduleId },
      include: { course: true },
    });
    if (
      !klass ||
      klass.course.status !== "PUBLISHED" ||
      !["UPCOMING", "OPEN_FOR_ENROLLMENT", "IN_PROGRESS"].includes(klass.status) ||
      klass.endDate <= new Date()
    )
      throw new AdminError("Choose a published course with an upcoming or active class.");
    const reserved = await tx.classAccessCode.count({
      where: {
        classScheduleId: klass.id,
        redeemedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (klass.currentEnrolled + reserved >= klass.maxStudents)
      throw new AdminError("No unreserved seats remain in this class.");
    return tx.classAccessCode.create({
      data: {
        digest: digest(code),
        label: raw.slice(-6),
        classScheduleId: klass.id,
        issuedById: actor.id,
        recipient: input.recipient || null,
        paymentReference: input.paymentReference || null,
        expiresAt: new Date(
          Math.min(Date.now() + input.expiresDays * 86400000, klass.endDate.getTime()),
        ),
      },
    });
  });
  return { id: record.id, code };
}
export async function revokeClassCode(actor: Actor, id: string) {
  await assertAdmin(actor, "codes");
  const result = await prisma.classAccessCode.updateMany({
    where: { id, redeemedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (!result.count) throw new AdminError("This code was already used or revoked.");
}

export async function redeemClassCode(userId: string, code: string) {
  return prisma.$transaction((tx) => redeemClassCodeInTransaction(tx, userId, code));
}
export async function redeemClassCodeInTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  code: string,
) {
  if (!/^[A-F0-9]{24}$/.test(code.trim().toUpperCase().replaceAll("-", "")))
    throw new AdminError("Invalid class code.");
  const student = await tx.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true },
  });
  if (!student?.isActive || student.role !== "STUDENT" || !student.studentProfile)
    throw new AdminError("An active student account is required.");
  const candidate = await tx.classAccessCode.findUnique({ where: { digest: digest(code) } });
  if (!candidate) throw new AdminError("Invalid class code.");
  await tx.$queryRaw`SELECT "id" FROM "ClassSchedule" WHERE "id" = ${candidate.classScheduleId} FOR UPDATE`;
  const token = await tx.classAccessCode.findUniqueOrThrow({ where: { id: candidate.id } });
  const klass = await tx.classSchedule.findUniqueOrThrow({
    where: { id: token.classScheduleId },
    include: { course: true },
  });
  if (token.revokedAt || token.redeemedAt || token.expiresAt <= new Date())
    throw new AdminError("This class code is expired, revoked or already used.");
  if (
    klass.course.status !== "PUBLISHED" ||
    !["UPCOMING", "OPEN_FOR_ENROLLMENT", "IN_PROGRESS"].includes(klass.status) ||
    klass.endDate <= new Date() ||
    klass.currentEnrolled >= klass.maxStudents
  )
    throw new AdminError("This class is no longer available.");
  if (
    await tx.enrollment.findUnique({
      where: {
        studentProfileId_classScheduleId: {
          studentProfileId: student.studentProfile.id,
          classScheduleId: klass.id,
        },
      },
    })
  )
    throw new AdminError("You already have an enrollment for this class.");
  // Conditional update also serializes with revocation; rollback restores the code on any failure.
  const claimed = await tx.classAccessCode.updateMany({
    where: { id: token.id, revokedAt: null, redeemedAt: null, expiresAt: { gt: new Date() } },
    data: { redeemedAt: new Date(), redeemedById: userId },
  });
  if (!claimed.count) throw new AdminError("This class code is no longer available.");
  const enrollment = await tx.enrollment.create({
    data: {
      studentProfileId: student.studentProfile.id,
      classScheduleId: klass.id,
      confirmationNumber: `21CT-${randomUUID()}`,
      status: "CONFIRMED",
      payments: {
        create: {
          method: "MANUAL",
          status: "PAID",
          amount: klass.price,
          paidDate: new Date(),
          notes: "Payment verified offline before issuing class code.",
        },
      },
    },
  });
  await tx.classSchedule.update({
    where: { id: klass.id },
    data: { currentEnrolled: { increment: 1 } },
  });
  return enrollment;
}
