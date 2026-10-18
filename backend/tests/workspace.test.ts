import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { teamSchema, instructorSchema, codeSchema } from "../src/validators/workspace";
import { courseSchema, classSchema } from "../src/validators/admin";
import { studentSchema, articleSchema } from "../src/validators/management";

test("admin levels, catalog CRUD and single-use class codes (isolated schema)", async (t) => {
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
  const { prisma } = await import("../src/lib/prisma");
  const {
    saveTeamMember,
    saveInstructor,
    deleteWorkspaceRecord,
    issueClassCode,
    revokeClassCode,
    redeemClassCode,
  } = await import("../src/server/workspace");
  const { saveCourse, saveClass, assertAdmin } = await import("../src/server/admin");
  const { enrollStudent } = await import("../src/server/enrollment");
  const { enrollmentSchema } = await import("../src/validators/forms");
  const { saveStudent, deleteStudent, saveArticle, deleteArticle, saveVideo } =
    await import("../src/server/management");
  const { deleteVideo } = await import("../src/server/videos");
  try {
    const owner = await prisma.user.create({
      data: { email: "owner@example.test", username: "admin", role: "ADMIN", adminLevel: "OWNER" },
    });
    const member = (level: "STAFF" | "MANAGER", name = level.toLowerCase()) =>
      teamSchema.parse({
        name: `${name} account`,
        email: `${name}@example.test`,
        username: name,
        password: "Long-Test-Password-123!",
        adminLevel: level,
        isActive: "on",
      });
    const staffId = (await saveTeamMember(owner, member("STAFF"))).id;
    const managerId = (await saveTeamMember(owner, member("MANAGER"))).id;
    const staff = { id: staffId, role: "ADMIN" },
      manager = { id: managerId, role: "ADMIN" };
    const instructorInput = instructorSchema.parse({
      fullName: "Test Instructor",
      email: "instructor@example.test",
      jobTitle: "Teacher",
      biography: "A practical computer teacher.",
      expertise: "Computers\nTyping",
      experience: "Five years",
    });
    const instructor = await saveInstructor(owner, instructorInput);
    const courseInput = courseSchema.parse({
      title: "Computer basics",
      category: "Computing",
      instructorId: instructor.id,
      shortDescription: "Introduction to computers",
      fullDescription: "A practical introduction to computers and daily computer use.",
      level: "BEGINNER",
      duration: "4 weeks",
      deliveryType: "ONLINE_LIVE",
      price: 50000,
      status: "PUBLISHED",
      outcomes: "Use computers",
      requirements: "None",
      targetAudience: "Beginners",
    });
    const course = await saveCourse(owner, courseInput);
    const classInput = classSchema.parse({
      title: "Computer basics batch A",
      courseId: course.id,
      startDate: "2099-01-10",
      endDate: "2099-02-10",
      startTime: "19:00",
      endTime: "20:00",
      deadlineDate: "2099-01-09",
      deadlineTime: "19:00",
      daysOfWeek: ["Mon"],
      maxStudents: 3,
      price: 50000,
      deliveryType: "ONLINE_LIVE",
      location: "",
      status: "OPEN_FOR_ENROLLMENT",
      notes: "",
    });
    const klass = await saveClass(owner, classInput);
    const studentInput = (name: string) =>
      studentSchema.parse({
        name,
        email: `${name}@example.test`,
        password: "Long-Test-Password-123!",
        phone: "",
        city: "Yangon",
        country: "Myanmar",
        isActive: "on",
      });
    const a = await saveStudent(owner, studentInput("student-a")),
      b = await saveStudent(owner, studentInput("student-b"));
    const issueInput = (id = klass.id) =>
      codeSchema.parse({
        classScheduleId: id,
        recipient: "Student paid via Messenger",
        paymentReference: "KBZ-REF-1",
        expiresDays: 30,
      });

    await t.test(
      "Staff can manage all learning content but cannot manage admin accounts",
      async () => {
        const record = await saveStudent(staff, studentInput("staff-created"));
        await saveStudent(
          staff,
          { ...studentInput("staff-created"), name: "Edited student", password: "" },
          record.id,
        );
        await deleteStudent(staff, record.id, "staff-created@example.test");
        const post = await saveArticle(
          staff,
          articleSchema.parse({
            title: "Staff article",
            category: "Updates",
            excerpt: "A practical update for students",
            content: "A useful practical update for all students on the website.",
            status: "DRAFT",
          }),
        );
        await deleteArticle(staff, post.id, "Staff article");
        for (const area of ["courses", "classes", "instructors", "codes", "videos"] as const)
          await assertAdmin(staff, area);
        await assert.rejects(assertAdmin(staff, "team"), /permission/);
        const c = await saveCourse(staff, { ...courseInput, title: "Staff course" });
        await deleteWorkspaceRecord(staff, "course", c.id, "Staff course");
        const k = await saveClass(staff, { ...classInput, title: "Staff class" });
        await deleteWorkspaceRecord(staff, "class", k.id, "Staff class");
        const i = await saveInstructor(staff, {
          ...instructorInput,
          email: "staff-instructor@example.test",
        });
        await deleteWorkspaceRecord(staff, "instructor", i.id, instructorInput.fullName);
        const token = await issueClassCode(staff, issueInput());
        await revokeClassCode(staff, token.id);
        const v = await saveVideo(staff, {
          title: "Staff video",
          description: "",
          status: "DRAFT",
          audience: "STUDENTS",
          courseId: "",
        });
        await deleteVideo(staff, v.id, "Staff video");
      },
    );
    await t.test(
      "Managers can create Staff but cannot create Managers or promote Staff",
      async () => {
        const before = await prisma.user.findUniqueOrThrow({ where: { id: staffId } });
        await saveTeamMember(
          manager,
          { ...member("STAFF"), name: "Updated by manager", password: "" },
          staffId,
        );
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: staffId } })).authVersion,
          before.authVersion + 1,
        );
        const created = await saveTeamMember(manager, member("STAFF", "anotherstaff"));
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: created.id } })).adminLevel,
          "STAFF",
        );
        await assert.rejects(saveTeamMember(manager, member("MANAGER", "anothermanager")), /Staff/);
        await assert.rejects(
          saveTeamMember(manager, { ...member("STAFF"), adminLevel: "OWNER" }, staffId),
          /Staff/,
        );
        await assert.rejects(
          saveTeamMember(manager, { ...member("MANAGER"), name: "Attempt" }, owner.id),
          /Staff/,
        );
        await assert.rejects(
          deleteWorkspaceRecord(manager, "team", staffId, "staff@example.test"),
          /Only Owners/,
        );
        await assert.rejects(saveTeamMember(staff, member("STAFF"), managerId), /permission/);
      },
    );
    await t.test(
      "Owner protections prevent self-removal and access follows current DB level",
      async () => {
        const self = teamSchema.parse({
          name: "Owner",
          email: owner.email,
          username: "admin",
          password: "",
          adminLevel: "STAFF",
          isActive: "on",
        });
        await assert.rejects(saveTeamMember(owner, self, owner.id), /own admin level/);
        await assert.rejects(
          deleteWorkspaceRecord(owner, "team", owner.id, owner.email),
          /own account/,
        );
        await saveTeamMember(
          owner,
          { ...member("MANAGER"), adminLevel: "STAFF", password: "" },
          managerId,
        );
        await assert.rejects(assertAdmin(manager, "team"), /permission/);
        await saveTeamMember(owner, { ...member("MANAGER"), password: "" }, managerId);
        await prisma.user.update({ where: { id: staffId }, data: { isActive: false } });
        await assert.rejects(assertAdmin(staff, "students"), /Administrator/);
        await prisma.user.update({ where: { id: staffId }, data: { isActive: true } });
      },
    );
    await t.test(
      "Owner can create, update and delete unlinked catalog and admin records",
      async () => {
        const c = await saveCourse(owner, { ...courseInput, title: "Disposable course" });
        await saveCourse(owner, { ...courseInput, title: "Updated course" }, c.id);
        await deleteWorkspaceRecord(owner, "course", c.id, "Updated course");
        const k = await saveClass(owner, { ...classInput, title: "Disposable class" });
        await saveClass(owner, { ...classInput, title: "Updated class" }, k.id);
        await deleteWorkspaceRecord(owner, "class", k.id, "Updated class");
        const i = await saveInstructor(owner, {
          ...instructorInput,
          email: "disposable@example.test",
          fullName: "Disposable teacher",
        });
        await saveInstructor(
          owner,
          { ...instructorInput, email: "disposable@example.test", fullName: "Updated teacher" },
          i.id,
        );
        await deleteWorkspaceRecord(owner, "instructor", i.id, "Updated teacher");
        const m = await saveTeamMember(owner, member("STAFF", "disposable"));
        await deleteWorkspaceRecord(owner, "team", m.id, "disposable@example.test");
        await assert.rejects(
          deleteWorkspaceRecord(owner, "course", course.id, course.title),
          /linked/,
        );
        await assert.rejects(
          deleteWorkspaceRecord(owner, "instructor", instructor.id, instructor.fullName),
          /Reassign/,
        );
      },
    );
    const first = await issueClassCode(owner, issueInput());
    await t.test(
      "Codes are stored as hashes, reserve seats and cannot change class/course",
      async () => {
        const saved = await prisma.classAccessCode.findUniqueOrThrow({ where: { id: first.id } });
        assert.notEqual(saved.digest, first.code);
        assert.equal(saved.digest.length, 64);
        const other = await saveCourse(owner, { ...courseInput, title: "Other course" });
        await assert.rejects(
          saveClass(owner, { ...classInput, courseId: other.id }, klass.id),
          /cannot change/,
        );
        await assert.rejects(
          deleteWorkspaceRecord(owner, "class", klass.id, klass.title),
          /issued codes/,
        );
      },
    );
    await t.test(
      "Concurrent redemption admits one student exactly once with manual paid enrollment",
      async () => {
        const results = await Promise.allSettled([
          redeemClassCode(a.id, first.code),
          redeemClassCode(b.id, first.code),
        ]);
        assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
        const code = await prisma.classAccessCode.findUniqueOrThrow({ where: { id: first.id } });
        assert.ok(code.redeemedAt);
        const enrollment = await prisma.enrollment.findFirstOrThrow({
          where: { classScheduleId: klass.id },
          include: { payments: true },
        });
        assert.equal(enrollment.status, "CONFIRMED");
        assert.equal(enrollment.payments[0].method, "MANUAL");
        assert.equal(enrollment.payments[0].status, "PAID");
        assert.equal(
          (await prisma.classSchedule.findUniqueOrThrow({ where: { id: klass.id } }))
            .currentEnrolled,
          1,
        );
        await assert.rejects(redeemClassCode(a.id, first.code), /already used/);
        await assert.rejects(revokeClassCode(owner, first.id), /already used/);
      },
    );
    await t.test(
      "Revoked and expired codes cannot be used; revocation releases a reservation",
      async () => {
        const revoked = await issueClassCode(owner, issueInput());
        await revokeClassCode(owner, revoked.id);
        await assert.rejects(redeemClassCode(b.id, revoked.code), /revoked/);
        const expired = await issueClassCode(owner, issueInput());
        await prisma.classAccessCode.update({
          where: { id: expired.id },
          data: { expiresAt: new Date(0) },
        });
        await assert.rejects(redeemClassCode(b.id, expired.code), /expired/);
        await assert.rejects(redeemClassCode(b.id, "wrong code"), /Invalid/);
      },
    );
    await t.test("Concurrent code issuance cannot overbook the last seat", async () => {
      const small = await saveClass(owner, {
        ...classInput,
        title: "One seat batch",
        maxStudents: 1,
      });
      const results = await Promise.allSettled([
        issueClassCode(owner, issueInput(small.id)),
        issueClassCode(owner, issueInput(small.id)),
      ]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      const publicEnrollment = enrollmentSchema.parse({
        classScheduleId: small.id,
        fullName: "student-b",
        email: "student-b@example.test",
        phone: "0912345678",
        educationLevel: "College",
        occupation: "Student",
        city: "Yangon",
        country: "Myanmar",
        preferredContact: "EMAIL",
        emergencyName: "Parent",
        emergencyPhone: "0912345678",
        learningGoal: "Learn computer skills",
        agreement: "on",
        terms: "on",
        privacy: "on",
      });
      await assert.rejects(enrollStudent(b.id, publicEnrollment), /full/);
    });
    await t.test(
      "Capacity edits account for reserved codes and duplicate enrollment preserves a fresh code",
      async () => {
        const tokenA = await issueClassCode(owner, issueInput());
        const tokenB = await issueClassCode(owner, issueInput());
        await assert.rejects(
          saveClass(owner, { ...classInput, maxStudents: 2 }, klass.id),
          /reserved class codes/,
        );
        const used = await prisma.classAccessCode.findUniqueOrThrow({ where: { id: first.id } });
        await assert.rejects(
          redeemClassCode(used.redeemedById!, tokenA.code),
          /already have an enrollment/,
        );
        assert.equal(
          (await prisma.classAccessCode.findUniqueOrThrow({ where: { id: tokenA.id } })).redeemedAt,
          null,
        );
        await revokeClassCode(owner, tokenA.id);
        await revokeClassCode(owner, tokenB.id);
      },
    );
    await t.test(
      "Existing students can use another code for another course without another account",
      async () => {
        const otherCourse = await saveCourse(owner, { ...courseInput, title: "Next course" });
        const otherClass = await saveClass(owner, {
          ...classInput,
          courseId: otherCourse.id,
          title: "Next course batch",
        });
        const token = await issueClassCode(owner, issueInput(otherClass.id));
        await redeemClassCode(a.id, token.code);
        assert.equal(await prisma.user.count({ where: { email: "student-a@example.test" } }), 1);
        assert.equal(
          await prisma.enrollment.count({
            where: { studentProfile: { userId: a.id }, classScheduleId: otherClass.id },
          }),
          1,
        );
        assert.equal(
          await prisma.enrollment.count({
            where: {
              studentProfile: { userId: a.id },
              classSchedule: { courseId: course.id },
              classScheduleId: otherClass.id,
            },
          }),
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
  }
});
