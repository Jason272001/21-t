import assert from "node:assert/strict";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import { hashPassword, verifyPassword } from "../src/server/passwords";
import { registerSchema } from "../src/validators/forms";
import { studentSchema } from "../src/validators/management";
import { teamSchema } from "../src/validators/workspace";
import { passwordChangeSchema, profileSchema } from "../src/validators/account";

test("Student/admin creation and password changes accept eight characters without composition rules", async () => {
  const base = {
    name: "Policy Test",
    email: "policy@example.test",
    username: "policy",
    phone: "",
    city: "",
    country: "",
    adminLevel: "STAFF",
    currentPassword: "12345",
  };
  for (const password of [
    "abcdefgh",
    "ABCDEFGH",
    "12345678",
    "########",
    "Abc#1234",
    "ကခဂဃငစဆဇ",
    "  abcdef",
    "x".repeat(200),
  ]) {
    assert.ok(registerSchema.safeParse({ ...base, password }).success, password);
    assert.ok(studentSchema.safeParse({ ...base, password }).success, password);
    assert.ok(teamSchema.safeParse({ ...base, password }).success, password);
    assert.ok(
      passwordChangeSchema.safeParse({ ...base, newPassword: password, confirmPassword: password })
        .success,
      password,
    );
    const hash = await hashPassword(password);
    assert.ok(await verifyPassword(password, hash));
    assert.equal(await verifyPassword(password + "different", hash), false);
  }
  const short = "Ab#1234";
  assert.equal(registerSchema.safeParse({ ...base, password: short }).success, false);
  assert.equal(studentSchema.safeParse({ ...base, password: short }).success, false);
  assert.equal(teamSchema.safeParse({ ...base, password: short }).success, false);
  assert.equal(
    passwordChangeSchema.safeParse({ ...base, newPassword: short, confirmPassword: short }).success,
    false,
  );
  await assert.rejects(hashPassword(short));
});

test("Existing bcrypt accounts still authenticate and a visibility toggle never requires a password reset", async () => {
  const hash = await bcrypt.hash("12345", 12);
  assert.ok(await verifyPassword("12345", hash));
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.equal(await verifyPassword("x".repeat(73), hash), false);
  assert.equal(await verifyPassword("12345678", "scrypt$v1$32768$8$3$malformed"), false);
});

test("Mixed-case and symbol usernames never block valid password changes", () => {
  for (const username of ["Admin", "Jason#21CT", "Jason Moy", "မြန်မာအမည်"]) {
    const input = {
      name: "Account Test",
      email: "account@example.test",
      username,
      currentPassword: "12345",
      newPassword: "ABCD#123",
      confirmPassword: "ABCD#123",
    };
    const account = profileSchema.parse(input);
    assert.equal(account.username, username.toLowerCase());
    assert.equal(passwordChangeSchema.parse(input).newPassword, "ABCD#123");
    assert.ok(
      teamSchema.safeParse({ ...input, password: "ABCD#123", adminLevel: "STAFF" }).success,
    );
  }
});
