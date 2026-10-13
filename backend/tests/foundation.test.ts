import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { classSchema, courseSchema, myanmarDateTime } from "../src/validators/admin";
import { enrollmentSchema, registerSchema } from "../src/validators/forms";

test("backend foundation (isolated local PostgreSQL schema)", async (t) => {
  const url = new URL(process.env.DATABASE_URL || "");
  assert.ok(
    ["localhost", "127.0.0.1"].includes(url.hostname),
    "Integration tests require a local database.",
  );
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  url.searchParams.set("schema", schema);
  process.env.DATABASE_URL = url.toString();
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
  const { saveCourse, saveClass } = await import("../src/server/admin");
  const { enrollStudent } = await import("../src/server/enrollment");
  const { allowLogin } = await import("../src/server/login-limit");
  try {
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.test",
        role: "ADMIN",
        instructorProfile: {
          create: {
            fullName: "Test Instructor",
            slug: "test-instructor",
            jobTitle: "Instructor",
            biography: "Test",
            expertise: [],
            certifications: [],
            experience: "Test",
          },
        },
      },
      include: { instructorProfile: true },
    });
    const students = await Promise.all(
      [1, 2, 3].map((i) =>
        prisma.user.create({
          data: {
            email: `student${i}@example.test`,
            role: "STUDENT",
            studentProfile: { create: {} },
          },
        }),
      ),
    );
    const input = courseSchema.parse({
      title: "Test course",
      category: "Test category",
      instructorId: admin.instructorProfile!.id,
      shortDescription: "A course for integration tests",
      fullDescription: "A longer description for integration tests.",
      level: "BEGINNER",
      duration: "4 weeks",
      deliveryType: "ONLINE_LIVE",
      price: 0,
      status: "DRAFT",
      outcomes: "Learn",
      requirements: "",
      targetAudience: "Students",
    });
    await t.test("student cannot create courses by forging an admin role", async () => {
      await assert.rejects(
        saveCourse({ id: students[0].id, role: "ADMIN" }, input),
        /Administrator/,
      );
    });
    const course = await saveCourse(admin, input);
    const klassInput = classSchema.parse({
      title: "Test batch",
      courseId: course.id,
      startDate: "2099-01-10",
      endDate: "2099-02-10",
      startTime: "19:00",
      endTime: "21:00",
      deadlineDate: "2099-01-09",
      deadlineTime: "18:00",
      daysOfWeek: ["Mon"],
      maxStudents: 1,
      price: 0,
      deliveryType: "ONLINE_LIVE",
      location: "",
      status: "OPEN_FOR_ENROLLMENT",
      notes: "",
    });
    await t.test("draft courses cannot open a class", async () => {
      await assert.rejects(saveClass(admin, klassInput), /Publish the course/);
    });
    await saveCourse(admin, { ...input, status: "PUBLISHED" }, course.id);
    const klass = await saveClass(admin, klassInput);
    const enrollInput = (i: number) =>
      enrollmentSchema.parse({
        classScheduleId: klass.id,
        fullName: `Student ${i}`,
        email: students[i].email,
        phone: "0912345678",
        dateOfBirth: "2000-01-01",
        educationLevel: "College",
        occupation: "Student",
        city: "Yangon",
        country: "Myanmar",
        preferredContact: "EMAIL",
        emergencyName: "Test Contact",
        emergencyPhone: "0912345678",
        learningGoal: "Learn technology foundations",
        agreement: "on",
        terms: "on",
        privacy: "on",
      });
    await t.test("enrollment cannot update another account", async () => {
      await assert.rejects(enrollStudent(students[0].id, enrollInput(1)), /own account/);
    });
    let winner = 0;
    await t.test("two concurrent requests cannot take the last seat", async () => {
      const results = await Promise.allSettled(
        [0, 1].map((i) => enrollStudent(students[i].id, enrollInput(i))),
      );
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      winner = results.findIndex((r) => r.status === "fulfilled");
      assert.equal(await prisma.enrollment.count(), 1);
      assert.equal(
        (await prisma.classSchedule.findUniqueOrThrow({ where: { id: klass.id } })).currentEnrolled,
        1,
      );
    });
    await t.test("repeated enrollment is idempotent and free classes are confirmed", async () => {
      const result = await enrollStudent(students[winner].id, enrollInput(winner));
      assert.equal(result.created, false);
      assert.equal(result.enrollment.status, "CONFIRMED");
      assert.equal(await prisma.payment.count(), 1);
      assert.equal((await prisma.payment.findFirstOrThrow()).status, "PAID");
    });
    await t.test("occupied class cannot be moved to a different course", async () => {
      const other = await saveCourse(admin, {
        ...input,
        title: "Other course",
        status: "PUBLISHED",
      });
      await assert.rejects(
        saveClass(admin, { ...klassInput, courseId: other.id }, klass.id),
        /cannot change/,
      );
    });
    await t.test("closed and expired classes reject enrollment", async () => {
      await prisma.classSchedule.update({
        where: { id: klass.id },
        data: { maxStudents: 5, status: "ENROLLMENT_CLOSED" },
      });
      await assert.rejects(enrollStudent(students[2].id, enrollInput(2)), /closed/);
      await prisma.classSchedule.update({
        where: { id: klass.id },
        data: { status: "OPEN_FOR_ENROLLMENT", enrollmentDeadline: new Date(0) },
      });
      await assert.rejects(enrollStudent(students[2].id, enrollInput(2)), /closed/);
    });
    await t.test("paid enrollment stays unpaid until separately confirmed", async () => {
      await prisma.classSchedule.update({
        where: { id: klass.id },
        data: { price: 10000, enrollmentDeadline: new Date("2099-01-01") },
      });
      const result = await enrollStudent(students[2].id, enrollInput(2));
      assert.equal(result.enrollment.status, "AWAITING_PAYMENT");
      assert.equal(
        (await prisma.payment.findFirstOrThrow({ where: { enrollmentId: result.enrollment.id } }))
          .status,
        "UNPAID",
      );
    });
    await t.test("revoked admin role is enforced immediately", async () => {
      await prisma.user.update({ where: { id: admin.id }, data: { role: "STUDENT" } });
      await assert.rejects(saveCourse(admin, input), /Administrator/);
    });
    await t.test(
      "login throttle remains atomic under concurrent requests and expires",
      async () => {
        const email = "rate-limit@example.test";
        const allowed = await Promise.all(Array.from({ length: 12 }, () => allowLogin(email)));
        assert.equal(allowed.filter(Boolean).length, 10);
        await prisma.loginAttempt.update({
          where: { key: createHash("sha256").update(email).digest("hex") },
          data: { resetAt: new Date(0) },
        });
        assert.equal(await allowLogin(email), true);
      },
    );
    await t.test("date, timezone, location and password validation", () => {
      assert.equal(
        classSchema.safeParse({ ...klassInput, startDate: "2099-02-30" }).success,
        false,
      );
      assert.equal(classSchema.safeParse({ ...klassInput, endTime: "18:00" }).success, false);
      assert.equal(
        classSchema.safeParse({ ...klassInput, deliveryType: "IN_PERSON" }).success,
        false,
      );
      assert.equal(classSchema.safeParse({ ...klassInput, maxStudents: 0 }).success, false);
      assert.equal(
        enrollmentSchema.safeParse({ ...enrollInput(0), dateOfBirth: "2000-02-30" }).success,
        false,
      );
      assert.equal(
        registerSchema.safeParse({ name: "Test", email: "a@b.com", password: "short" }).success,
        false,
      );
      assert.equal(
        myanmarDateTime("2099-01-10", "19:00").toISOString(),
        "2099-01-10T12:30:00.000Z",
      );
    });
  } finally {
    await prisma.$disconnect();
    const cleanup = new PrismaClient({ datasourceUrl: url.toString() });
    assert.match(schema, /^test_[a-f0-9]{32}$/);
    await cleanup.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await cleanup.$disconnect();
  }
});
