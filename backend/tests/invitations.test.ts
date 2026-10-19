import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { invitationSchema, invitationRegistrationSchema } from "../src/validators/invitations";

test("Admin invitation permissions, expiry and atomic account creation (isolated local schema)", async (t) => {
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
  const { issueInvitation, inspectInvitation, acceptInvitation, revokeInvitation } =
    await import("../src/server/invitations");
  const { authenticate } = await import("../src/server/authenticate");
  const { deleteWorkspaceRecord } = await import("../src/server/workspace");
  const owner = await prisma.user.create({
    data: { name: "Owner", email: "owner@example.test", role: "ADMIN", adminLevel: "OWNER" },
  });
  const manager = await prisma.user.create({
    data: { name: "Manager", email: "manager@example.test", role: "ADMIN", adminLevel: "MANAGER" },
  });
  const staff = await prisma.user.create({
    data: { email: "staff@example.test", role: "ADMIN", adminLevel: "STAFF" },
  });
  const student = await prisma.user.create({
    data: { email: "student@example.test", role: "STUDENT" },
  });
  const input = (adminLevel: "MANAGER" | "STAFF") =>
    invitationSchema.parse({ adminLevel, note: "A private test invitation", expiresHours: 24 });
  const signup = (email: string) =>
    invitationRegistrationSchema.parse({
      name: "Invited Colleague",
      email,
      username: email.split("@")[0],
      password: "ABCD#123",
      confirmPassword: "ABCD#123",
      adminLevel: "OWNER",
      role: "ADMIN",
      isActive: false,
    });
  try {
    await t.test(
      "Only Owners invite Managers; Managers can invite Staff; Staff and students cannot issue links",
      async () => {
        assert.equal(invitationSchema.safeParse({ adminLevel: "OWNER" }).success, false);
        assert.equal(
          invitationSchema.safeParse({ adminLevel: "STAFF", expiresHours: 169 }).success,
          false,
        );
        assert.equal(
          invitationRegistrationSchema.safeParse({
            ...signup("short@example.test"),
            password: "short",
            confirmPassword: "short",
          }).success,
          false,
        );
        await assert.rejects(issueInvitation(manager, input("MANAGER")), /Staff only/);
        await assert.rejects(issueInvitation(staff, input("STAFF")), /Staff only/);
        await assert.rejects(
          issueInvitation({ ...student, role: "ADMIN" }, input("STAFF")),
          /Staff only/,
        );
      },
    );
    const invite = await issueInvitation(owner, input("MANAGER"));
    await t.test(
      "Database stores only token hashes; viewing a link never consumes it",
      async () => {
        assert.match(invite.token, /^[a-f0-9]{64}$/);
        const stored = await prisma.adminInvitation.findUniqueOrThrow({ where: { id: invite.id } });
        assert.equal(stored.digest, createHash("sha256").update(invite.token).digest("hex"));
        assert.equal(JSON.stringify(stored).includes(invite.token), false);
        assert.equal(stored.label, invite.token.slice(-8));
        assert.equal((await inspectInvitation(invite.token))?.adminLevel, "MANAGER");
        assert.ok(await inspectInvitation(invite.token));
        assert.equal(
          (await prisma.adminInvitation.findUniqueOrThrow({ where: { id: invite.id } })).acceptedAt,
          null,
        );
        assert.equal(await inspectInvitation("broken"), null);
      },
    );
    let invitedManagerId = "";
    await t.test(
      "Recipient chooses their own credentials while the invitation fixes the role",
      async () => {
        const created = await acceptInvitation(invite.token, signup("newmanager@example.test"));
        invitedManagerId = created.id;
        const user = await prisma.user.findUniqueOrThrow({ where: { id: created.id } });
        assert.equal(user.role, "ADMIN");
        assert.equal(user.adminLevel, "MANAGER");
        assert.equal(user.isActive, true);
        assert.ok(user.passwordHash?.startsWith("scrypt$"));
        assert.notEqual(user.passwordHash, "ABCD#123");
        assert.ok(await authenticate({ email: "NEWMANAGER", password: "ABCD#123" }, "ADMIN"));
        assert.equal(await inspectInvitation(invite.token), null);
        await assert.rejects(
          acceptInvitation(invite.token, signup("reused@example.test")),
          /already used/,
        );
        assert.equal(await prisma.user.count({ where: { email: "reused@example.test" } }), 0);
      },
    );
    await t.test(
      "Manager invitations create only Staff and concurrent acceptance creates exactly one account",
      async () => {
        const token = await issueInvitation(manager, input("STAFF"));
        const attempts = await Promise.allSettled([
          acceptInvitation(token.token, signup("first@example.test")),
          acceptInvitation(token.token, signup("second@example.test")),
        ]);
        assert.equal(attempts.filter((r) => r.status === "fulfilled").length, 1);
        assert.equal(
          await prisma.user.count({
            where: { email: { in: ["first@example.test", "second@example.test"] } },
          }),
          1,
        );
        const stored = await prisma.adminInvitation.findUniqueOrThrow({
          where: { id: token.id },
          include: { acceptedBy: true },
        });
        assert.equal(stored.acceptedBy?.adminLevel, "STAFF");
        assert.ok(stored.acceptedAt);
      },
    );
    await t.test(
      "Duplicate accounts cannot be promoted, and a failed signup does not consume the link",
      async () => {
        const token = await issueInvitation(owner, input("STAFF"));
        await assert.rejects(
          acceptInvitation(token.token, signup(student.email)),
          /already in use/,
        );
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: student.id } })).role,
          "STUDENT",
        );
        assert.ok(await inspectInvitation(token.token));
        await acceptInvitation(token.token, signup("retry@example.test"));
      },
    );
    await t.test(
      "Owners can revoke any link; Managers only their own; revoked and expired links cannot create accounts",
      async () => {
        const owned = await issueInvitation(owner, input("STAFF"));
        await assert.rejects(revokeInvitation(manager, owned.id), /cannot revoke/);
        const managed = await issueInvitation(manager, input("STAFF"));
        await assert.rejects(revokeInvitation(staff, managed.id), /cannot revoke/);
        await revokeInvitation(manager, managed.id);
        assert.equal(await inspectInvitation(managed.token), null);
        await assert.rejects(
          acceptInvitation(managed.token, signup("revoked@example.test")),
          /revoked/,
        );
        await revokeInvitation(owner, owned.id);
        const expires = await issueInvitation(owner, input("STAFF"));
        await prisma.adminInvitation.update({
          where: { id: expires.id },
          data: { expiresAt: new Date(Date.now() - 1000) },
        });
        assert.equal(await inspectInvitation(expires.token), null);
        await assert.rejects(
          acceptInvitation(expires.token, signup("expired@example.test")),
          /expired/,
        );
        assert.equal(
          await prisma.user.count({
            where: { email: { in: ["expired@example.test", "revoked@example.test"] } },
          }),
          0,
        );
      },
    );
    await t.test(
      "Disabling or demoting an issuer invalidates pending links immediately",
      async () => {
        const invitedManager = await prisma.user.findUniqueOrThrow({
          where: { id: invitedManagerId },
        });
        const token = await issueInvitation(invitedManager, input("STAFF"));
        await prisma.user.update({ where: { id: invitedManager.id }, data: { isActive: false } });
        assert.equal(await inspectInvitation(token.token), null);
        await assert.rejects(
          acceptInvitation(token.token, signup("disabled@example.test")),
          /invalid/,
        );
        await prisma.user.update({
          where: { id: invitedManager.id },
          data: { isActive: true, adminLevel: "STAFF" },
        });
        assert.equal(await inspectInvitation(token.token), null);
        await assert.rejects(
          acceptInvitation(token.token, signup("demoted@example.test")),
          /invalid/,
        );
        const ownerManagerLink = await issueInvitation(owner, input("MANAGER"));
        await prisma.user.update({ where: { id: owner.id }, data: { adminLevel: "MANAGER" } });
        assert.equal(await inspectInvitation(ownerManagerLink.token), null);
        await prisma.user.update({ where: { id: owner.id }, data: { adminLevel: "OWNER" } });
      },
    );
    await t.test(
      "Local-only invitations cannot provision hosted access, and linked issuers retain history",
      async () => {
        const local = await prisma.user.create({
          data: {
            email: "local@example.test",
            role: "ADMIN",
            adminLevel: "OWNER",
            localOnly: true,
          },
        });
        const token = await issueInvitation(local, input("STAFF"));
        const old = process.env.AUTH_URL;
        try {
          process.env.AUTH_URL = "https://example.test";
          assert.equal(await inspectInvitation(token.token), null);
          await assert.rejects(
            acceptInvitation(token.token, signup("hosted@example.test")),
            /invalid/,
          );
        } finally {
          process.env.AUTH_URL = old;
        }
        const accepted = await acceptInvitation(token.token, signup("localstaff@example.test"));
        assert.equal(
          (await prisma.user.findUniqueOrThrow({ where: { id: accepted.id } })).localOnly,
          true,
        );
        await assert.rejects(
          deleteWorkspaceRecord(owner, "team", manager.id, manager.email),
          /linked records/,
        );
      },
    );
  } finally {
    await prisma.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await prisma.$disconnect();
  }
});
