import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { studentSchema, articleSchema, videoSchema } from "../src/validators/management";

test("admin management and video access (isolated local schema)", async (t) => {
  const url = new URL(process.env.DATABASE_URL || "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  url.searchParams.set("schema", schema);
  process.env.DATABASE_URL = url.toString();
  const directory = await mkdtemp(join(tmpdir(), "21ct-video-tests-"));
  process.env.VIDEO_STORAGE_PATH = directory;
  execFileSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "migrate",
      "deploy",
      "--schema",
      "backend/prisma/schema.prisma",
    ],
    { env: process.env, stdio: "pipe" },
  );
  const { prisma } = await import("../src/lib/prisma");
  const { saveStudent, deleteStudent, saveArticle, deleteArticle, saveVideo } =
    await import("../src/server/management");
  const { uploadVideo, canWatch, deleteVideo, parseVideoRange, videoFileInfo, videoPath } =
    await import("../src/server/videos");
  const { authenticate } = await import("../src/server/authenticate");
  try {
    const password = "TestPassword-123!";
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.test",
        username: "admin",
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
        instructorProfile: {
          create: {
            fullName: "Test",
            slug: "test",
            jobTitle: "Teacher",
            biography: "Test",
            expertise: [],
            certifications: [],
            experience: "Test",
          },
        },
      },
      include: { instructorProfile: true },
    });
    await t.test("Render blocks uploads without persistent storage", async () => {
      const previousRender = process.env.RENDER;
      const previousPath = process.env.VIDEO_STORAGE_PATH;
      process.env.RENDER = "true";
      delete process.env.VIDEO_STORAGE_PATH;
      try {
        await assert.rejects(
          uploadVideo(admin, "unused", new ReadableStream(), "video/mp4"),
          /persistent video storage/,
        );
      } finally {
        if (previousRender === undefined) delete process.env.RENDER;
        else process.env.RENDER = previousRender;
        process.env.VIDEO_STORAGE_PATH = previousPath;
      }
    });
    const input = studentSchema.parse({
      name: "Test Student",
      email: "student@example.test",
      password,
      phone: "0912345678",
      city: "Yangon",
      country: "Myanmar",
      isActive: "on",
    });
    const student = await saveStudent(admin, input);
    await t.test("admin creates a hashed student account with profile", async () => {
      const record = await prisma.user.findUniqueOrThrow({
        where: { id: student.id },
        include: { studentProfile: true },
      });
      assert.equal(record.role, "STUDENT");
      assert.notEqual(record.passwordHash, password);
      assert.equal(await bcrypt.compare(password, record.passwordHash!), true);
      assert.equal(record.studentProfile?.city, "Yangon");
    });
    await t.test("student cannot manage students or posts, even with a forged role", async () => {
      await assert.rejects(saveStudent({ id: student.id, role: "ADMIN" }, input), /Administrator/);
      await assert.rejects(
        deleteStudent({ id: student.id, role: "ADMIN" }, student.id, input.email),
        /Administrator/,
      );
    });
    await t.test("admin and student credentials cannot cross login portals", async () => {
      assert.equal((await authenticate({ email: "admin", password }, "ADMIN"))?.id, admin.id);
      assert.equal(await authenticate({ email: "admin", password }, "STUDENT"), null);
      assert.equal(
        (await authenticate({ email: input.email, password }, "STUDENT"))?.id,
        student.id,
      );
      assert.equal(await authenticate({ email: input.email, password }, "ADMIN"), null);
    });
    await t.test(
      "editing increments session version and disabled accounts cannot sign in",
      async () => {
        await saveStudent(
          admin,
          { ...input, password: "", name: "Edited Student", isActive: false },
          student.id,
        );
        const record = await prisma.user.findUniqueOrThrow({ where: { id: student.id } });
        assert.equal(record.authVersion, 1);
        assert.equal(record.name, "Edited Student");
        assert.equal(await authenticate({ email: input.email, password }, "STUDENT"), null);
        await saveStudent(admin, { ...input, password: "" }, student.id);
        assert.equal(
          (await authenticate({ email: input.email, password }, "STUDENT"))?.authVersion,
          2,
        );
      },
    );
    await t.test("temporary local-only account rejects a hosted AUTH_URL", async () => {
      await prisma.user.update({ where: { id: admin.id }, data: { localOnly: true } });
      const previous = process.env.AUTH_URL;
      process.env.AUTH_URL = "https://example.test";
      try {
        assert.equal(await authenticate({ email: "admin", password }, "ADMIN"), null);
      } finally {
        process.env.AUTH_URL = previous;
      }
      await prisma.user.update({ where: { id: admin.id }, data: { localOnly: false } });
    });
    await t.test("student forms cannot modify admin accounts or duplicate emails", async () => {
      await assert.rejects(saveStudent(admin, input, admin.id), /not found/);
      await assert.rejects(saveStudent(admin, input), /already in use/);
      await assert.rejects(deleteStudent(admin, admin.id, admin.email), /not found/);
    });
    const postInput = articleSchema.parse({
      title: "Test blog",
      category: "Technology",
      excerpt: "A summary for the test blog",
      content: "This is a complete blog post written for our isolated test.",
      status: "DRAFT",
    });
    let post = await saveArticle(admin, postInput);
    await t.test(
      "blog draft publishes and can be edited and deleted with confirmation",
      async () => {
        assert.equal(post.publishedAt, null);
        assert.equal(post.authorId, admin.id);
        await assert.rejects(
          saveArticle({ id: student.id, role: "ADMIN" }, postInput),
          /Administrator/,
        );
        post = await saveArticle(admin, { ...postInput, status: "PUBLISHED" }, post.id);
        assert.ok(post.publishedAt);
        assert.equal(post.slug.startsWith("test-blog-"), true);
        await assert.rejects(deleteArticle(admin, post.id, "wrong"), /confirm/);
        await deleteArticle(admin, post.id, post.title);
        assert.equal(await prisma.article.count(), 0);
      },
    );
    const course = await prisma.course.create({
      data: {
        title: "Test course",
        slug: "test-course",
        shortDescription: "Test",
        fullDescription: "Test",
        level: "BEGINNER",
        duration: "1 week",
        deliveryType: "ONLINE_LIVE",
        status: "PUBLISHED",
        instructor: { connect: { id: admin.instructorProfile!.id } },
        category: { create: { name: "Test", slug: "test" } },
        outcomes: [],
        requirements: [],
        targetAudience: [],
      },
    });
    const klass = await prisma.classSchedule.create({
      data: {
        title: "Class",
        courseId: course.id,
        instructorId: admin.instructorProfile!.id,
        startDate: new Date("2099-01-10"),
        endDate: new Date("2099-02-10"),
        startTime: "19:00",
        endTime: "21:00",
        daysOfWeek: ["Mon"],
        enrollmentDeadline: new Date("2099-01-09"),
        deliveryType: "ONLINE_LIVE",
        maxStudents: 5,
        currentEnrolled: 1,
        status: "OPEN_FOR_ENROLLMENT",
      },
    });
    const profile = await prisma.studentProfile.findUniqueOrThrow({
      where: { userId: student.id },
    });
    const enrollment = await prisma.enrollment.create({
      data: {
        confirmationNumber: "TEST-1",
        studentProfileId: profile.id,
        classScheduleId: klass.id,
        status: "AWAITING_PAYMENT",
        payments: { create: { amount: 1000, method: "MANUAL" } },
      },
    });
    const videoInput = videoSchema.parse({
      title: "Test video",
      description: "Test description",
      status: "DRAFT",
      audience: "ENROLLED",
      courseId: course.id,
    });
    let video = await saveVideo(admin, videoInput);
    const bytes = Buffer.concat([
      Buffer.from([0, 0, 0, 24]),
      Buffer.from("ftypisom"),
      Buffer.alloc(52),
    ]);
    const stream = (buffer: Uint8Array) =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        },
      });
    await t.test("videos require a valid upload before publishing", async () => {
      await assert.rejects(
        saveVideo(admin, { ...videoInput, status: "PUBLISHED" }, video.id),
        /upload/,
      );
      await assert.rejects(
        uploadVideo({ id: student.id, role: "ADMIN" }, video.id, stream(bytes), "video/mp4"),
        /Administrator/,
      );
      await assert.rejects(
        uploadVideo(admin, video.id, stream(Buffer.from("this is not a video file")), "video/mp4"),
        /not a valid/,
      );
      assert.equal((await readdir(directory)).length, 0);
      await uploadVideo(admin, video.id, stream(bytes), "video/mp4");
      video = await prisma.video.findUniqueOrThrow({ where: { id: video.id } });
      assert.equal(video.size, bytes.length);
      assert.equal((await videoFileInfo(video.fileKey!)).size, bytes.length);
      assert.equal(await canWatch(video, student.id), false);
      assert.equal(await canWatch(video, admin.id), true);
    });
    await t.test("video audience respects enrollment payment and account state", async () => {
      video = await saveVideo(admin, { ...videoInput, status: "PUBLISHED" }, video.id);
      assert.equal(await canWatch(video), false);
      assert.equal(await canWatch(video, student.id), false);
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "CONFIRMED" },
      });
      assert.equal(await canWatch(video, student.id), true);
      await prisma.user.update({ where: { id: student.id }, data: { isActive: false } });
      assert.equal(await canWatch(video, student.id), false);
      await prisma.user.update({ where: { id: student.id }, data: { isActive: true } });
      video = await saveVideo(
        admin,
        { ...videoInput, status: "PUBLISHED", audience: "PUBLIC" },
        video.id,
      );
      assert.equal(await canWatch(video), true);
    });
    await t.test("replacement and deletion clean up uploaded files", async () => {
      await uploadVideo(admin, video.id, stream(bytes), "video/mp4");
      assert.equal((await readdir(directory)).length, 1);
      await assert.rejects(deleteVideo(admin, video.id, "wrong"), /confirm/);
      await deleteVideo(admin, video.id, video.title);
      assert.equal((await readdir(directory)).length, 0);
    });
    await t.test("range requests support seeking and reject invalid ranges and paths", () => {
      assert.deepEqual(parseVideoRange("bytes=10-19", 100), { start: 10, end: 19, partial: true });
      assert.deepEqual(parseVideoRange("bytes=-20", 100), { start: 80, end: 99, partial: true });
      for (const range of [
        "bytes=100-",
        "bytes=30-20",
        "bytes=-0",
        "bytes=0-5,10-15",
        "bytes=-",
        "bytes=999999999999999999999-",
      ])
        assert.equal(parseVideoRange(range, 100), null);
      assert.throws(() => videoPath("../../secret.env"));
    });
    await t.test(
      "student deletion requires confirmation, removes dependent records and frees seat",
      async () => {
        await assert.rejects(deleteStudent(admin, student.id, "wrong"), /confirm/);
        await deleteStudent(admin, student.id, input.email);
        assert.equal(await prisma.user.findUnique({ where: { id: student.id } }), null);
        assert.equal(await prisma.enrollment.count(), 0);
        assert.equal(await prisma.payment.count(), 0);
        assert.equal(
          (await prisma.classSchedule.findUniqueOrThrow({ where: { id: klass.id } }))
            .currentEnrolled,
          0,
        );
      },
    );
  } finally {
    await prisma.$disconnect();
    const cleanup = new PrismaClient({ datasourceUrl: url.toString() });
    assert.match(schema, /^test_[a-f0-9]{32}$/);
    await cleanup.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await cleanup.$disconnect();
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + "21ct-video-tests-"));
    await rm(directory, { recursive: true, force: true });
  }
});
