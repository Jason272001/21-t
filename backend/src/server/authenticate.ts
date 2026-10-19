import { verifyPassword } from "./passwords";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { allowLogin } from "./login-limit";

export function localAccountAllowed() {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(process.env.AUTH_URL || "").hostname,
    );
  } catch {
    return false;
  }
}
export async function authenticate(credentials: unknown, role: "ADMIN" | "STUDENT") {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().min(1).max(254),
      password: z.string().min(1).max(128),
    })
    .safeParse(credentials);
  if (!parsed.success) return null;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: parsed.data.email, mode: "insensitive" } },
        { username: parsed.data.email },
      ],
    },
  });
  if (!(await allowLogin(user ? `user:${user.id}` : parsed.data.email))) return null;
  if (
    !user?.isActive ||
    user.role !== role ||
    !user.passwordHash ||
    (user.localOnly && !localAccountAllowed())
  )
    return null;
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    authVersion: user.authVersion,
  };
}
