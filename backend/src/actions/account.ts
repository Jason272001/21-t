"use server";

import { signOut } from "../lib/auth";
import { requireAdmin } from "../lib/access";
import { accountSchema } from "../validators/account";
import { updateOwnAdminAccount } from "../server/account";
import { AdminError } from "../server/admin";
import type { ActionState } from "./public";

export async function logoutAction(admin = false) {
  await signOut({ redirectTo: admin ? "/admin57/log-in" : "/login" });
}

export async function updateOwnAccountAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = accountSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const fields: Record<string, string> = {
      name: "Name",
      email: "Email",
      username: "Username",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
    };
    return {
      ok: false,
      message: `${fields[String(issue.path[0])] || "Account"}: ${issue.message}`,
    };
  }
  try {
    await updateOwnAdminAccount(user.id, parsed.data);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AdminError
          ? error.message
          : "Could not update your account. Please try again.",
    };
  }
  await signOut({ redirectTo: "/admin57/log-in?updated=1" });
  return { ok: true, message: "Account updated. Sign in again." };
}
