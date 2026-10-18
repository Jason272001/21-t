"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStudent } from "../lib/access";
import { classCodeSchema } from "../validators/account";
import { redeemClassCode } from "../server/workspace";
import { AdminError } from "../server/admin";
import { allowLogin } from "../server/login-limit";
import type { ActionState } from "./public";
export async function joinClassAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStudent();
  if (!(await allowLogin(`class-code:${user.id}`)))
    return { ok: false, message: "Too many attempts. Try again in 15 minutes." };
  const parsed = classCodeSchema.safeParse(form.get("classCode"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  let classId: string;
  try {
    classId = (await redeemClassCode(user.id, parsed.data)).classScheduleId;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AdminError
          ? error.message
          : "Could not join this class. Please try again.",
    };
  }
  for (const path of ["/student", "/student/classes", "/student/videos", "/admin", "/admin/codes"])
    revalidatePath(path);
  redirect(`/student/classes/${classId}?joined=1`);
}
