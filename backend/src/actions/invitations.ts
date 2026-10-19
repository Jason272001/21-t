"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireAdmin } from "../lib/access";
import { signOut } from "../lib/auth";
import { invitationSchema, invitationRegistrationSchema } from "../validators/invitations";
import { issueInvitation, revokeInvitation, acceptInvitation } from "../server/invitations";
import { AdminError } from "../server/admin";
import type { ActionState } from "./public";
export type InvitationState = ActionState & { url?: string };
const failed = (error: unknown): ActionState => ({
  ok: false,
  message: error instanceof AdminError ? error.message : "Could not save. Please try again.",
});

export async function issueInvitationAction(
  _: InvitationState,
  form: FormData,
): Promise<InvitationState> {
  const actor = await requireAdmin("team");
  const parsed = invitationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    const origin = new URL(
      process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ).origin;
    const invite = await issueInvitation(actor, parsed.data);
    revalidatePath("/admin/team/invitations");
    return { ok: true, message: "", url: `${origin}/admin57/join/${invite.token}` };
  } catch (error) {
    return failed(error);
  }
}
export async function revokeInvitationAction(id: string): Promise<ActionState> {
  const actor = await requireAdmin("team");
  try {
    await revokeInvitation(actor, id);
  } catch (error) {
    return failed(error);
  }
  revalidatePath("/admin/team/invitations");
  return { ok: true, message: "Invitation revoked. / ဖိတ်ကြားချက် ပယ်ဖျက်ပြီးပါပြီ။" };
}
export async function acceptInvitationAction(
  token: string,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (await getCurrentUser())
    return { ok: false, message: "Sign out before creating an invited account." };
  const parsed = invitationRegistrationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    await acceptInvitation(token, parsed.data);
  } catch (error) {
    return failed(error);
  }
  revalidatePath("/admin/team");
  revalidatePath("/admin/team/invitations");
  redirect("/admin57/log-in?invited=1");
}
export async function signOutForInvitationAction(token: string): Promise<void> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return;
  await signOut({ redirectTo: `/admin57/join/${token}` });
}
