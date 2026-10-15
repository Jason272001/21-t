"use server";

import { signOut } from "../lib/auth";

export async function logoutAction(admin = false) {
  await signOut({ redirectTo: admin ? "/admin57/log-in" : "/login" });
}
