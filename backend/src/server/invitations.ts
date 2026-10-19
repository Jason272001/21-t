import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import { AdminError } from "./admin";
import { hashPassword } from "./passwords";
import { localAccountAllowed } from "./authenticate";
import { allowLogin } from "./login-limit";
import {
  invitationSchema,
  invitationRegistrationSchema,
  type InvitationInput,
  type InvitationRegistrationInput,
} from "../validators/invitations";

type Issuer = { role: string; adminLevel: string | null; isActive: boolean; localOnly: boolean };
export function canInvite(issuer: Issuer, level: string) {
  return (
    issuer.role === "ADMIN" &&
    issuer.isActive &&
    (!issuer.localOnly || localAccountAllowed()) &&
    ((issuer.adminLevel === "OWNER" && ["MANAGER", "STAFF"].includes(level)) ||
      (issuer.adminLevel === "MANAGER" && level === "STAFF"))
  );
}
const tokenDigest = (token: string) =>
  createHash("sha256").update(token.toLowerCase()).digest("hex");
const validToken = (token: string) => /^[a-f0-9]{64}$/i.test(token);
const unavailable = () =>
  new AdminError(
    "This invitation is invalid, expired, revoked or already used. Ask for a new link.",
  );

export async function issueInvitation(actor: { id: string; role: string }, input: InvitationInput) {
  const parsed = invitationSchema.safeParse(input);
  if (!parsed.success)
    throw new AdminError("Choose a Manager or Staff invitation and an expiry of 1–168 hours.");
  const token = randomBytes(32).toString("hex");
  const record = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(210018)`;
    const issuer = await tx.user.findUnique({ where: { id: actor.id } });
    if (!issuer || !canInvite(issuer, parsed.data.adminLevel))
      throw new AdminError("Owners can invite Managers or Staff. Managers can invite Staff only.");
    return tx.adminInvitation.create({
      data: {
        digest: tokenDigest(token),
        label: token.slice(-8),
        note: parsed.data.note || null,
        adminLevel: parsed.data.adminLevel,
        issuedById: issuer.id,
        expiresAt: new Date(Date.now() + parsed.data.expiresHours * 3600000),
      },
      select: { id: true, expiresAt: true },
    });
  });
  return { ...record, token };
}

export async function inspectInvitation(token: string) {
  if (!validToken(token)) return null;
  const invite = await prisma.adminInvitation.findUnique({
    where: { digest: tokenDigest(token) },
    include: {
      issuedBy: { select: { role: true, adminLevel: true, isActive: true, localOnly: true } },
    },
  });
  if (
    !invite ||
    invite.acceptedAt ||
    invite.revokedAt ||
    invite.expiresAt <= new Date() ||
    !canInvite(invite.issuedBy, invite.adminLevel)
  )
    return null;
  return { adminLevel: invite.adminLevel, expiresAt: invite.expiresAt };
}

export async function acceptInvitation(token: string, input: InvitationRegistrationInput) {
  const parsed = invitationRegistrationSchema.safeParse(input);
  if (!parsed.success) throw new AdminError(parsed.error.issues[0].message);
  if (!(await inspectInvitation(token))) throw unavailable();
  if (!(await allowLogin(`invite-accept:${tokenDigest(token)}`)))
    throw new AdminError("Too many attempts. Try again in 15 minutes or ask for a new invitation.");
  const passwordHash = await hashPassword(parsed.data.password);
  return prisma.$transaction(async (tx) => {
    // The same lock serializes acceptance, revocation and changes to issuer privileges.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(210018)`;
    const invite = await tx.adminInvitation.findUnique({
      where: { digest: tokenDigest(token) },
      include: { issuedBy: true },
    });
    if (
      !invite ||
      invite.acceptedAt ||
      invite.revokedAt ||
      invite.expiresAt <= new Date() ||
      !canInvite(invite.issuedBy, invite.adminLevel)
    )
      throw unavailable();
    const { name, email, username } = parsed.data;
    if (
      await tx.user.findFirst({
        where: {
          OR: [
            { email: { equals: email, mode: "insensitive" } },
            { username },
            { email: { equals: username, mode: "insensitive" } },
            { username: email },
          ],
        },
        select: { id: true },
      })
    )
      throw new AdminError(
        "Email or username is already in use. Invitations create new accounts only.",
      );
    const user = await tx.user.create({
      data: {
        name,
        email,
        username,
        passwordHash,
        role: "ADMIN",
        adminLevel: invite.adminLevel,
        localOnly: invite.issuedBy.localOnly,
      },
      select: { id: true },
    });
    const claimed = await tx.adminInvitation.updateMany({
      where: { id: invite.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { acceptedAt: new Date(), acceptedById: user.id },
    });
    if (!claimed.count) throw unavailable();
    return user;
  });
}

export async function revokeInvitation(actor: { id: string; role: string }, id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(210018)`;
    const issuer = await tx.user.findUnique({ where: { id: actor.id } });
    const invite = await tx.adminInvitation.findUnique({ where: { id } });
    if (
      !issuer?.isActive ||
      issuer.role !== "ADMIN" ||
      !["OWNER", "MANAGER"].includes(issuer.adminLevel || "") ||
      !invite ||
      (issuer.adminLevel !== "OWNER" && invite.issuedById !== issuer.id)
    )
      throw new AdminError("You cannot revoke this invitation.");
    const result = await tx.adminInvitation.updateMany({
      where: { id, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (!result.count) throw new AdminError("This invitation was already used or revoked.");
  });
}
