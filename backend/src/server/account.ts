import { hashPassword, verifyPassword } from "./passwords";
import { prisma } from "../lib/prisma";
import { AdminError } from "./admin";
import { allowLogin } from "./login-limit";
import type { AccountInput } from "../validators/account";
export async function updateOwnAdminAccount(userId: string, input: AccountInput) {
  if (!(await allowLogin(`account-update:${userId}`)))
    throw new AdminError("Too many attempts. Try again in 15 minutes.");
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user?.isActive || user.role !== "ADMIN" || !user.passwordHash)
      throw new AdminError("An active administrator account is required.");
    if (!(await verifyPassword(input.currentPassword, user.passwordHash)))
      throw new AdminError("Your current password is incorrect.");
    if (
      await tx.user.findFirst({
        where: {
          id: { not: userId },
          OR: [
            { email: { equals: input.email, mode: "insensitive" } },
            { username: input.username },
          ],
        },
      })
    )
      throw new AdminError("Email or username is already in use.");
    // Role, level and active status are deliberately not writable through self-service.
    return tx.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        email: input.email,
        username: input.username,
        ...(input.newPassword ? { passwordHash: await hashPassword(input.newPassword) } : {}),
        authVersion: { increment: 1 },
      },
      select: { id: true },
    });
  });
}
