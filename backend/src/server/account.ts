import { hashPassword, verifyPassword } from "./passwords";
import { prisma } from "../lib/prisma";
import { AdminError } from "./admin";
import { allowLogin } from "./login-limit";
import {
  profileSchema,
  passwordChangeSchema,
  type ProfileInput,
  type PasswordChangeInput,
} from "../validators/account";

export async function updateOwnProfile(userId: string, input: ProfileInput) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) throw new AdminError(parsed.error.issues[0].message);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(210018)`;
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user?.isActive || !["ADMIN", "STUDENT"].includes(user.role))
      throw new AdminError("An active account is required.");
    const data = parsed.data;
    const email = data.email ?? user.email,
      username = data.username === undefined ? user.username : data.username;
    if (
      await tx.user.findFirst({
        where: {
          id: { not: userId },
          OR: [
            { email: { equals: email, mode: "insensitive" } },
            { username: email },
            ...(username
              ? [{ username }, { email: { equals: username, mode: "insensitive" as const } }]
              : []),
          ],
        },
        select: { id: true },
      })
    )
      throw new AdminError("Email or username is already in use.");
    // Profile saves never change passwords, privileges or session versions.
    return tx.user.update({
      where: { id: userId },
      data: { name: data.name, email: data.email, username: data.username },
      select: { id: true },
    });
  });
}

export async function changeOwnPassword(userId: string, input: PasswordChangeInput) {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) throw new AdminError(parsed.error.issues[0].message);
  if (!(await allowLogin(`account-password:${userId}`)))
    throw new AdminError("Too many attempts. Try again in 15 minutes.");
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user?.isActive || !["ADMIN", "STUDENT"].includes(user.role) || !user.passwordHash)
      throw new AdminError("An active account is required.");
    if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash)))
      throw new AdminError("Your current password is incorrect.");
    return tx.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        authVersion: { increment: 1 },
      },
      select: { id: true },
    });
  });
}
