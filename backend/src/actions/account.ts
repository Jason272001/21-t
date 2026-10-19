"use server";
import { signOut } from "../lib/auth";
import { requireUser } from "../lib/access";
import { profileSchema, passwordChangeSchema } from "../validators/account";
import { updateOwnProfile, changeOwnPassword } from "../server/account";
import { AdminError } from "../server/admin";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./public";

export async function logoutAction(admin = false) {
  await signOut({ redirectTo: admin ? "/admin57/log-in" : "/login" });
}
function invalid(issue: { path: PropertyKey[]; message: string }): ActionState {
  const fields: Record<string, string> = {
    name: "Name",
    email: "Email",
    username: "Username",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
  };
  return { ok: false, message: `${fields[String(issue.path[0])] || "Account"}: ${issue.message}` };
}
const failed = (error: unknown): ActionState => ({
  ok: false,
  message:
    error instanceof AdminError ? error.message : "Could not save changes. Please try again.",
});

export async function updateOwnProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return invalid(parsed.error.issues[0]);
  try {
    await updateOwnProfile(user.id, parsed.data);
  } catch (error) {
    return failed(error);
  }
  revalidatePath(user.role === "ADMIN" ? "/admin" : "/student", "layout");
  return { ok: true, message: "Profile updated. / ကိုယ်ရေးအချက်အလက် ပြင်ပြီးပါပြီ။" };
}
export async function changeOwnPasswordAction(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return invalid(parsed.error.issues[0]);
  try {
    await changeOwnPassword(user.id, parsed.data);
  } catch (error) {
    return failed(error);
  }
  await signOut({
    redirectTo: user.role === "ADMIN" ? "/admin57/log-in?updated=1" : "/login?updated=1",
  });
  return { ok: true, message: "Password changed. Sign in again." };
}
