import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  if (username && !/^[a-z0-9_-]{3,32}$/.test(username))
    throw new Error(
      "ADMIN_USERNAME must use 3–32 lowercase letters, numbers, underscores or hyphens.",
    );
  const name = process.env.ADMIN_NAME?.trim() || "21CT Admin";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Set a valid ADMIN_EMAIL.");
  if (!password || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Set ADMIN_PASSWORD to at least 12 characters and at most 72 UTF-8 bytes.");
  }
  const existing = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    if (existing.role !== "ADMIN")
      throw new Error("That email belongs to a non-admin account. Choose a different admin email.");
    console.log("Admin already exists. No account or password was changed.");
    return;
  }
  await db.user.create({
    data: {
      email,
      username,
      name,
      role: "ADMIN",
      adminLevel: "OWNER",
      passwordHash: await bcrypt.hash(password, 12),
      instructorProfile: {
        create: {
          fullName: name,
          slug: `instructor-${randomUUID()}`,
          jobTitle: "Instructor",
          biography: "",
          expertise: [],
          certifications: [],
          experience: "",
        },
      },
    },
  });
  console.log("Admin account created. Sign in at /admin57/log-in to open /admin.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Admin setup failed.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
