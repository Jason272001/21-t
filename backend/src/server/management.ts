import { hashPassword } from "./passwords";
import { createHash, randomUUID } from "node:crypto";
import slugify from "slugify";
import { prisma } from "../lib/prisma";
import { AdminError, assertAdmin } from "./admin";
import type { StudentInput, ArticleInput, VideoInput } from "../validators/management";
import type { ArticlePicture } from "./article-images";
type Actor = { id: string; role: string };
const slug = (title: string) =>
  slugify(title, { lower: true, strict: true }).slice(0, 70) ||
  createHash("sha256").update(title).digest("hex").slice(0, 16);
const tagSlug = (name: string) =>
  `${slug(name).slice(0, 50)}-${createHash("sha256").update(name.normalize("NFKC").toLowerCase()).digest("hex").slice(0, 12)}`;

export async function saveStudent(actor: Actor, input: StudentInput, id?: string) {
  await assertAdmin(actor, "students");
  if (!id && !input.password) throw new AdminError("A password is required for a new student.");
  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  const profile = { phone: input.phone, city: input.city, country: input.country };
  return prisma.$transaction(async (tx) => {
    if (id) {
      const [student] = await tx.$queryRaw<
        { role: string }[]
      >`SELECT "role" FROM "User" WHERE "id" = ${id} FOR UPDATE`;
      if (student?.role !== "STUDENT") throw new AdminError("Student account not found.");
    }
    const existing = await tx.user.findFirst({
      where: {
        email: { equals: input.email, mode: "insensitive" },
        ...(id ? { id: { not: id } } : {}),
      },
      select: { id: true },
    });
    if (existing) throw new AdminError("This email is already in use.");
    const data = { name: input.name, email: input.email, isActive: input.isActive, passwordHash };
    if (id)
      return tx.user.update({
        where: { id },
        data: {
          ...data,
          authVersion: { increment: 1 },
          studentProfile: { upsert: { create: profile, update: profile } },
        },
        select: { id: true },
      });
    return tx.user.create({
      data: { ...data, role: "STUDENT", studentProfile: { create: profile } },
      select: { id: true },
    });
  });
}
export async function deleteStudent(actor: Actor, id: string, confirmation: string) {
  await assertAdmin(actor, "students");
  await prisma.$transaction(async (tx) => {
    const [student] = await tx.$queryRaw<
      { role: string; email: string }[]
    >`SELECT "role", "email" FROM "User" WHERE "id" = ${id} FOR UPDATE`;
    if (student?.role !== "STUDENT") throw new AdminError("Student account not found.");
    if (confirmation !== student.email)
      throw new AdminError("Type the student's email to confirm deletion.");
    const enrollments = await tx.enrollment.findMany({
      where: { studentProfile: { userId: id } },
      orderBy: { classScheduleId: "asc" },
    });
    for (const enrollment of enrollments) {
      if (!["CANCELLED", "REFUNDED", "WAITLISTED"].includes(enrollment.status)) {
        await tx.$executeRaw`UPDATE "ClassSchedule" SET "currentEnrolled" = GREATEST(0, "currentEnrolled" - 1) WHERE "id" = ${enrollment.classScheduleId}`;
      }
    }
    await tx.payment.deleteMany({ where: { enrollment: { studentProfile: { userId: id } } } });
    await tx.enrollment.deleteMany({ where: { studentProfile: { userId: id } } });
    await tx.user.delete({ where: { id } });
  });
}
export async function saveArticle(
  actor: Actor,
  input: ArticleInput,
  id?: string,
  picture?: ArticlePicture,
) {
  await assertAdmin(actor, "articles");
  return prisma.$transaction(async (tx) => {
    const category = await tx.articleCategory.upsert({
      where: { slug: slug(input.category) },
      update: {},
      create: { name: input.category, slug: slug(input.category) },
    });
    const previous = id ? await tx.article.findUnique({ where: { id } }) : null;
    if (id && !previous) throw new AdminError("Blog post not found.");
    const data = {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      categoryId: category.id,
      status: input.status,
      featured: input.featured,
      tags: {
        ...(id ? { set: [] } : {}),
        connectOrCreate: input.tags.map((name) => ({
          where: { slug: tagSlug(name) },
          create: { name, slug: tagSlug(name) },
        })),
      },
      readingTime: Math.max(1, Math.ceil(input.content.split(/\s+/).length / 200)),
      publishedAt: input.status === "PUBLISHED" ? previous?.publishedAt || new Date() : null,
    };
    const saved = id
      ? tx.article.update({ where: { id }, data })
      : tx.article.create({
          data: {
            ...data,
            authorId: actor.id,
            slug: `${slug(input.title)}-${randomUUID().slice(0, 8)}`,
          },
        });
    const record = await saved;
    if (picture) {
      await tx.articleImage.upsert({
        where: { articleId: record.id },
        create: { articleId: record.id, ...picture },
        update: picture,
      });
      await tx.article.update({
        where: { id: record.id },
        data: { featuredImage: `/api/articles/${record.id}/image` },
      });
    } else if (input.removeImage) {
      await tx.articleImage.deleteMany({ where: { articleId: record.id } });
      await tx.article.update({ where: { id: record.id }, data: { featuredImage: null } });
    }
    return record;
  });
}
export async function saveVideo(actor: Actor, input: VideoInput, id?: string) {
  await assertAdmin(actor, "videos");
  if (
    input.courseId &&
    !(await prisma.course.findUnique({ where: { id: input.courseId }, select: { id: true } }))
  )
    throw new AdminError("Course not found.");
  return prisma.$transaction(async (tx) => {
    if (id) await tx.$queryRaw`SELECT "id" FROM "Video" WHERE "id" = ${id} FOR UPDATE`;
    const previous = id ? await tx.video.findUnique({ where: { id } }) : null;
    if (id && !previous) throw new AdminError("Video not found.");
    if (input.status === "PUBLISHED" && !previous?.fileKey)
      throw new AdminError("Save a draft and upload a video file before publishing.");
    const data = { ...input, courseId: input.courseId || null };
    return id ? tx.video.update({ where: { id }, data }) : tx.video.create({ data });
  });
}
export async function deleteArticle(actor: Actor, id: string, confirmation: string) {
  await assertAdmin(actor, "articles");
  const result = await prisma.article.deleteMany({ where: { id, title: confirmation } });
  if (!result.count) throw new AdminError("Type the post title to confirm deletion.");
}
