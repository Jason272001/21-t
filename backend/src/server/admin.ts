import { createHash, randomUUID } from "node:crypto";
import slugify from "slugify";
import { prisma } from "../lib/prisma";
import { myanmarDateTime, type ClassInput, type CourseInput } from "../validators/admin";

export class AdminError extends Error {}

type Actor = { id: string; role: string };

export async function assertAdmin(actor: Actor) {
  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { role: true, isActive: true },
  });
  if (user?.role !== "ADMIN" || !user.isActive)
    throw new AdminError("Administrator access is required.");
}

export async function saveCourse(actor: Actor, input: CourseInput, id?: string) {
  await assertAdmin(actor);
  const instructor = await prisma.instructorProfile.findUnique({
    where: { id: input.instructorId },
    select: { id: true },
  });
  if (!instructor) throw new AdminError("Choose a valid instructor.");
  return prisma.$transaction(async (tx) => {
    const categorySlug =
      slugify(input.category, { lower: true, strict: true }) ||
      `category-${createHash("sha256").update(input.category).digest("hex").slice(0, 16)}`;
    const category = await tx.courseCategory.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { name: input.category, slug: categorySlug },
    });
    const { category: _category, ...fields } = input;
    void _category;
    const data = { ...fields, categoryId: category.id };
    if (id) {
      if (!(await tx.course.findUnique({ where: { id }, select: { id: true } })))
        throw new AdminError("Course not found.");
      return tx.course.update({ where: { id }, data });
    }
    const prefix = slugify(input.title, { lower: true, strict: true }).slice(0, 70) || "course";
    return tx.course.create({ data: { ...data, slug: `${prefix}-${randomUUID().slice(0, 8)}` } });
  });
}

export async function saveClass(actor: Actor, input: ClassInput, id?: string) {
  await assertAdmin(actor);
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { id: true, instructorId: true, status: true },
  });
  if (!course) throw new AdminError("Choose a valid course.");
  const startDate = myanmarDateTime(input.startDate, input.startTime);
  const enrollmentDeadline = myanmarDateTime(input.deadlineDate, input.deadlineTime);
  if (["UPCOMING", "OPEN_FOR_ENROLLMENT"].includes(input.status)) {
    if (course.status !== "PUBLISHED")
      throw new AdminError("Publish the course before publishing its class.");
    if (startDate <= new Date()) throw new AdminError("Choose a future start date.");
  }
  if (input.status === "OPEN_FOR_ENROLLMENT" && enrollmentDeadline <= new Date())
    throw new AdminError("Choose a future enrollment deadline.");
  const data = {
    title: input.title,
    courseId: course.id,
    instructorId: course.instructorId,
    startDate,
    endDate: myanmarDateTime(input.endDate, input.endTime),
    startTime: input.startTime,
    endTime: input.endTime,
    timezone: "Asia/Yangon",
    enrollmentDeadline,
    daysOfWeek: [...new Set(input.daysOfWeek)],
    maxStudents: input.maxStudents,
    price: input.price,
    deliveryType: input.deliveryType,
    location: input.location || null,
    status: input.status,
    notes: input.notes,
  };
  if (!id) return prisma.classSchedule.create({ data });
  return prisma.$transaction(async (tx) => {
    // Serialize edits against enrollment seat allocation.
    const [existing] = await tx.$queryRaw<{ currentEnrolled: number; courseId: string }[]>`
      SELECT "currentEnrolled", "courseId" FROM "ClassSchedule" WHERE "id" = ${id} FOR UPDATE
    `;
    if (!existing) throw new AdminError("Class not found.");
    if (data.maxStudents < existing.currentEnrolled)
      throw new AdminError("Capacity cannot be lower than the current enrollment count.");
    if (data.courseId !== existing.courseId && existing.currentEnrolled > 0)
      throw new AdminError("The course cannot change after students have enrolled.");
    return tx.classSchedule.update({ where: { id }, data });
  });
}
