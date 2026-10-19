import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { accountSchema, studentRegistrationSchema } from "../src/validators/account";
test("self-service account security and student class access (isolated schema)", async (t) => {
  const url = new URL(process.env.DATABASE_URL || "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
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
  const { prisma } = await import("../src/lib/prisma"),
    { updateOwnAdminAccount } = await import("../src/server/account"),
    { authenticate } = await import("../src/server/authenticate"),
    { registerStudent, studentClass } = await import("../src/server/student"),
    { issueClassCode, redeemClassCode } = await import("../src/server/workspace"),
    { availableVideos, canWatch } = await import("../src/server/videos");
  try {
    const owner = await prisma.user.create({
      data: {
        email: "owner@example.test",
        username: "admin",
        name: "Owner",
        role: "ADMIN",
        adminLevel: "OWNER",
        passwordHash: await bcrypt.hash("12345", 12),
        instructorProfile: {
          create: {
            fullName: "Teacher",
            slug: "teacher",
            jobTitle: "Teacher",
            biography: "Teacher",
            expertise: [],
            certifications: [],
            experience: "Teacher",
          },
        },
      },
      include: { instructorProfile: true },
    });
    const ownInput = accountSchema.parse({
      name: "Updated Owner",
      email: "owner-new@example.test",
      username: "Owner #NEW",
      currentPassword: "12345",
      newPassword: "ABC#1234",
      confirmPassword: "ABC#1234",
    });
    await t.test(
      "Self-service checks current password and confirmation before changing credentials",
      async () => {
        assert.equal(
          accountSchema.safeParse({ ...ownInput, confirmPassword: "different" }).success,
          false,
        );
        assert.equal(
          accountSchema.safeParse({ ...ownInput, newPassword: "12345", confirmPassword: "12345" })
            .success,
          false,
        );
        await assert.rejects(
          updateOwnAdminAccount(owner.id, { ...ownInput, currentPassword: "wrong" }),
          /current password/,
        );
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).authVersion,
          0,
        );
        await updateOwnAdminAccount(owner.id, ownInput);
        const updated = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
        assert.equal(updated.adminLevel, "OWNER");
        assert.equal(updated.role, "ADMIN");
        assert.equal(updated.username, "owner #new");
        assert.equal(updated.authVersion, 1);
        assert.equal(await bcrypt.compare("12345", updated.passwordHash!), false);
        assert.ok(
          await authenticate({ email: "OWNER #NEW", password: ownInput.newPassword }, "ADMIN"),
        );
        assert.equal(await authenticate({ email: "admin", password: "12345" }, "ADMIN"), null);
      },
    );
    await t.test("Self-service cannot escalate Staff or overwrite another account", async () => {
      const staff = await prisma.user.create({
        data: {
          email: "staff@example.test",
          username: "staff",
          role: "ADMIN",
          adminLevel: "STAFF",
          passwordHash: await bcrypt.hash("Staff-Password-123!", 12),
        },
      });
      const input = accountSchema.parse({
        ...ownInput,
        name: "Staff updated",
        email: "staff@example.test",
        username: "staff",
        currentPassword: "Staff-Password-123!",
        newPassword: "",
        confirmPassword: "",
        adminLevel: "OWNER",
        id: owner.id,
      });
      await updateOwnAdminAccount(staff.id, input);
      assert.equal(
        (await prisma.user.findUniqueOrThrow({ where: { id: staff.id } })).adminLevel,
        "STAFF",
      );
      await assert.rejects(
        updateOwnAdminAccount(staff.id, { ...input, email: ownInput.email }),
        /already in use/,
      );
      assert.equal(
        (await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).email,
        ownInput.email,
      );
    });
    const category = await prisma.courseCategory.create({
      data: { name: "Computers", slug: "computers" },
    });
    const course = await prisma.course.create({
      data: {
        title: "Computer basics",
        slug: "computer-basics",
        shortDescription: "Practical basics",
        fullDescription: "Learn practical computer basics.",
        categoryId: category.id,
        instructorId: owner.instructorProfile!.id,
        level: "BEGINNER",
        duration: "4 weeks",
        deliveryType: "ONLINE_LIVE",
        status: "PUBLISHED",
        outcomes: [],
        requirements: [],
        targetAudience: [],
      },
    });
    const createClass = (title: string) =>
      prisma.classSchedule.create({
        data: {
          title,
          courseId: course.id,
          instructorId: owner.instructorProfile!.id,
          startDate: new Date("2099-01-10"),
          endDate: new Date("2099-02-10"),
          enrollmentDeadline: new Date("2099-01-09"),
          startTime: "19:00",
          endTime: "20:00",
          daysOfWeek: ["Mon"],
          maxStudents: 20,
          price: 50000,
          deliveryType: "ONLINE_LIVE",
          status: "OPEN_FOR_ENROLLMENT",
        },
      });
    const klass = await createClass("Evening batch"),
      other = await createClass("Other batch");
    const issue = (id = klass.id) =>
      issueClassCode(owner, {
        classScheduleId: id,
        recipient: "",
        paymentReference: "KBZ-verified",
        expiresDays: 30,
      });
    const signup = (email: string, code: string) =>
      studentRegistrationSchema.parse({
        name: "Test Student",
        email,
        password: "Student-Password-123!",
        classCode: code,
      });
    await t.test("Invalid codes cannot leave orphan accounts behind", async () => {
      assert.equal(
        studentRegistrationSchema.safeParse({
          name: "Student",
          email: "x@example.test",
          password: "Student-Password-123!",
        }).success,
        false,
      );
      await assert.rejects(
        registerStudent(signup("invalid@example.test", "A".repeat(24))),
        /Invalid class code/,
      );
      assert.equal(await prisma.user.count({ where: { email: "invalid@example.test" } }), 0);
    });
    const token = await issue();
    let studentId = "";
    await t.test(
      "Registration consumes one code atomically and enrolls in exactly its class",
      async () => {
        const results = await Promise.allSettled([
          registerStudent(signup("a@example.test", token.code)),
          registerStudent(signup("b@example.test", token.code)),
        ]);
        assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
        const success = results.find((r) => r.status === "fulfilled");
        assert.ok(success && success.status === "fulfilled");
        studentId = success.value.id;
        assert.equal(
          await prisma.user.count({
            where: { email: { in: ["a@example.test", "b@example.test"] } },
          }),
          1,
        );
        const enrollment = await prisma.enrollment.findFirstOrThrow({
          where: { studentProfile: { userId: studentId } },
          include: { payments: true },
        });
        assert.equal(enrollment.classScheduleId, klass.id);
        assert.equal(enrollment.status, "CONFIRMED");
        assert.equal(enrollment.payments[0].status, "PAID");
        assert.equal(enrollment.payments[0].method, "MANUAL");
        await assert.rejects(
          registerStudent(signup("reuse@example.test", token.code)),
          /already used/,
        );
        assert.equal(await prisma.user.count({ where: { email: "reuse@example.test" } }), 0);
      },
    );
    await t.test(
      "Classroom access is restricted to the active, confirmed student's enrollment",
      async () => {
        assert.ok(await studentClass(studentId, klass.id));
        assert.equal(await studentClass(studentId, other.id), null);
        assert.equal(await studentClass(owner.id, klass.id), null);
        const unpaid = await prisma.user.create({
          data: {
            name: "Unpaid",
            email: "unpaid@example.test",
            role: "STUDENT",
            studentProfile: { create: {} },
          },
          include: { studentProfile: true },
        });
        await prisma.enrollment.create({
          data: {
            confirmationNumber: randomUUID(),
            studentProfileId: unpaid.studentProfile!.id,
            classScheduleId: klass.id,
            status: "AWAITING_PAYMENT",
          },
        });
        assert.equal(await studentClass(unpaid.id, klass.id), null);
        await assert.rejects(updateOwnAdminAccount(unpaid.id, ownInput), /administrator/);
        await prisma.user.update({ where: { id: studentId }, data: { isActive: false } });
        assert.equal(await studentClass(studentId, klass.id), null);
        await prisma.user.update({ where: { id: studentId }, data: { isActive: true } });
      },
    );
    await t.test(
      "Another code adds a class to the same account; duplicate email does not consume it",
      async () => {
        const second = await issue(other.id),
          user = await prisma.user.findUniqueOrThrow({ where: { id: studentId } });
        await assert.rejects(
          registerStudent(signup(user.email, second.code)),
          /already registered/,
        );
        assert.equal(
          (await prisma.classAccessCode.findUniqueOrThrow({ where: { id: second.id } })).redeemedAt,
          null,
        );
        await redeemClassCode(studentId, second.code);
        assert.ok(await studentClass(studentId, other.id));
        assert.equal(await prisma.user.count({ where: { email: user.email } }), 1);
        assert.equal(
          await prisma.enrollment.count({ where: { studentProfile: { userId: studentId } } }),
          2,
        );
      },
    );
    await t.test("Expired-code registration rolls back the user and profile", async () => {
      const expired = await issue();
      await prisma.classAccessCode.update({
        where: { id: expired.id },
        data: { expiresAt: new Date(0) },
      });
      await assert.rejects(
        registerStudent(signup("expired@example.test", expired.code)),
        /expired/,
      );
      assert.equal(await prisma.user.count({ where: { email: "expired@example.test" } }), 0);
    });
    await t.test("Video access still filters out drafts and unenrolled courses", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Lesson",
          description: "Lesson",
          audience: "ENROLLED",
          courseId: course.id,
          status: "PUBLISHED",
          fileKey: `${randomUUID()}.mp4`,
        },
      });
      assert.equal(await canWatch(video, studentId), true);
      assert.equal(await canWatch(video), false);
      assert.equal(await prisma.video.count({ where: availableVideos(studentId) }), 1);
      await prisma.video.update({ where: { id: video.id }, data: { status: "DRAFT" } });
      assert.equal(await canWatch({ ...video, status: "DRAFT" }, studentId), false);
    });
  } finally {
    await prisma.$disconnect();
    const cleanup = new PrismaClient({ datasourceUrl: url.toString() });
    assert.match(schema, /^test_[a-f0-9]{32}$/);
    await cleanup.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await cleanup.$disconnect();
  }
});
