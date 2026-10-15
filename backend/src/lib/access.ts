import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { localAccountAllowed } from "../server/authenticate";
import { prisma } from "./prisma";

export const backendConfigured = () => Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET);

export const getCurrentUser = cache(async () => {
  if (!backendConfigured()) return null;
  const session = await auth();
  if (!session?.user.id) return null;
  // Read the current role from the database; never trust a stale JWT for admin access.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      authVersion: true,
      localOnly: true,
    },
  });
  if (
    !user?.isActive ||
    user.authVersion !== session.user.authVersion ||
    (user.localOnly && !localAccountAllowed())
  )
    return null;
  return user;
});

export function portalPath(role: string) {
  return role === "ADMIN" ? "/admin" : "/student";
}

export async function requireUser() {
  if (!backendConfigured()) redirect("/login?unavailable=1");
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin57/log-in");
  if (user.role !== "ADMIN") redirect("/student?denied=1");
  return user;
}
