import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  profileSchema,
  passwordChangeSchema,
  studentRegistrationSchema,
} from "../src/validators/account";
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
    { updateOwnProfile, changeOwnPassword } = await import("../src/server/account"),
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
    const profileInput = profileSchema.parse({
      name: "Updated Owner",
      email: "owner-new@example.test",
      username: "Owner #NEW",
    });
    const passwordInput = passwordChangeSchema.parse({
      currentPassword: "12345",
      newPassword: "ABC#1234",
      confirmPassword: "ABC#1234",
    });
    await t.test(
      "Admin profile saves require no password and preserve sessions and password hashes",
      async () => {
        const before = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
        await updateOwnProfile(owner.id, profileInput);
        const after = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
        assert.equal(after.passwordHash, before.passwordHash);
        assert.equal(after.authVersion, 0);
        assert.equal(after.adminLevel, "OWNER");
        assert.equal(after.username, "owner #new");
        assert.ok(await authenticate({ email: "OWNER #NEW", password: "12345" }, "ADMIN"));
      },
    );
    await t.test(
      "Password changes validate current password and confirmation without changing profile details",
      async () => {
        assert.equal(
          passwordChangeSchema.safeParse({ ...passwordInput, confirmPassword: "different" })
            .success,
          false,
        );
        await assert.rejects(
          changeOwnPassword(owner.id, { ...passwordInput, currentPassword: "wrong" }),
          /current password/,
        );
        await assert.rejects(
          changeOwnPassword(owner.id, {
            ...passwordInput,
            newPassword: "short",
            confirmPassword: "short",
          }),
          /8 characters/,
        );
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).authVersion,
          0,
        );
        await changeOwnPassword(owner.id, {
          ...passwordInput,
          username: "!",
          email: "not-an-email",
          name: "Do not change",
        } as typeof passwordInput);
        const after = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
        assert.equal(after.username, "owner #new");
        assert.equal(after.name, profileInput.name);
        assert.equal(after.email, profileInput.email);
        assert.equal(after.authVersion, 1);
        assert.equal(after.adminLevel, "OWNER");
        assert.ok(
          await authenticate({ email: "OWNER #NEW", password: passwordInput.newPassword }, "ADMIN"),
        );
        assert.equal(await authenticate({ email: "OWNER #NEW", password: "12345" }, "ADMIN"), null);
      },
    );
    await t.test(
      "Staff profile saves cannot alter privileges or overwrite another account",
      async () => {
        const staff = await prisma.user.create({
          data: {
            email: "staff@example.test",
            username: "staff",
            role: "ADMIN",
            adminLevel: "STAFF",
            passwordHash: await bcrypt.hash("Staff-Password-123!", 12),
          },
        });
        const input = profileSchema.parse({
          name: "Staff updated",
          adminLevel: "OWNER",
          id: owner.id,
          passwordHash: "forged",
          authVersion: 500,
          newPassword: "Do not change",
        });
        const before = await prisma.user.findUniqueOrThrow({ where: { id: staff.id } });
        await updateOwnProfile(staff.id, input);
        const after = await prisma.user.findUniqueOrThrow({ where: { id: staff.id } });
        assert.equal(after.adminLevel, "STAFF");
        assert.equal(after.passwordHash, before.passwordHash);
        assert.equal(after.authVersion, 0);
        await assert.rejects(
          updateOwnProfile(staff.id, { email: profileInput.email }),
          /already in use/,
        );
        await assert.rejects(
          updateOwnProfile(staff.id, { username: profileInput.email }),
          /already in use/,
        );
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).email,
          profileInput.email,
        );
      },
    );
    const settingsStudent = await prisma.user.create({
      data: {
        name: "Settings Student",
        email: "settings@example.test",
        role: "STUDENT",
        passwordHash: await bcrypt.hash("Student-Password-123!", 12),
        studentProfile: { create: {} },
      },
    });
    await t.test(
      "Students can edit only name, only email or only username without supplying any password",
      async () => {
        const before = await prisma.user.findUniqueOrThrow({ where: { id: settingsStudent.id } });
        await updateOwnProfile(settingsStudent.id, { name: "New Student Name" });
        const nameOnly = await prisma.user.findUniqueOrThrow({ where: { id: settingsStudent.id } });
        assert.equal(nameOnly.name, "New Student Name");
        assert.equal(nameOnly.email, before.email);
        assert.equal(nameOnly.username, null);
        await updateOwnProfile(settingsStudent.id, { email: "new-settings@example.test" });
        await updateOwnProfile(settingsStudent.id, { username: "Student #ONE" });
        const after = await prisma.user.findUniqueOrThrow({ where: { id: settingsStudent.id } });
        assert.equal(after.username, "student #one");
        assert.equal(after.email, "new-settings@example.test");
        assert.equal(after.name, "New Student Name");
        assert.equal(after.passwordHash, before.passwordHash);
        assert.equal(after.authVersion, 0);
        assert.equal(after.role, "STUDENT");
        assert.ok(
          await authenticate(
            { email: "STUDENT #ONE", password: "Student-Password-123!" },
            "STUDENT",
          ),
        );
      },
    );
    await t.test(
      "Student password changes are independent; empty usernames are optional and disabled accounts cannot save",
      async () => {
        await updateOwnProfile(settingsStudent.id, profileSchema.parse({ username: "" }));
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: settingsStudent.id } })).username,
          null,
        );
        await changeOwnPassword(settingsStudent.id, {
          currentPassword: "Student-Password-123!",
          newPassword: "########",
          confirmPassword: "########",
        });
        const after = await prisma.user.findUniqueOrThrow({ where: { id: settingsStudent.id } });
        assert.equal(after.email, "new-settings@example.test");
        assert.equal(after.authVersion, 1);
        assert.ok(await authenticate({ email: after.email, password: "########" }, "STUDENT"));
        assert.equal(
          profileSchema.safeParse({ role: "ADMIN", passwordHash: "bad" }).success,
          false,
        );
        await prisma.user.update({ where: { id: settingsStudent.id }, data: { isActive: false } });
        await assert.rejects(
          updateOwnProfile(settingsStudent.id, { name: "Disabled" }),
          /active account/,
        );
        await assert.rejects(
          changeOwnPassword(settingsStudent.id, {
            currentPassword: "########",
            newPassword: "ABCDEFGH",
            confirmPassword: "ABCDEFGH",
          }),
          /active account/,
        );
      },
    );
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
        await assert.rejects(changeOwnPassword(unpaid.id, passwordInput), /active account/);
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
