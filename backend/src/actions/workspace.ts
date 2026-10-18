"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../lib/access";
import { AdminError } from "../server/admin";
import {
  saveInstructor,
  saveTeamMember,
  deleteWorkspaceRecord,
  issueClassCode,
  revokeClassCode,
} from "../server/workspace";
import { instructorSchema, teamSchema, codeSchema } from "../validators/workspace";
import type { ActionState } from "./public";
const failure = (error: unknown): ActionState => ({
  ok: false,
  message:
    error instanceof AdminError
      ? error.message
      : "Could not save changes. Check for duplicate or linked records and try again.",
});
function refresh() {
  for (const path of [
    "/admin",
    "/admin/courses",
    "/admin/classes",
    "/admin/instructors",
    "/admin/team",
    "/admin/codes",
    "/courses",
    "/schedule",
    "/instructors",
    "/",
  ])
    revalidatePath(path);
  revalidatePath("/courses/[slug]", "page");
}
export async function saveWorkspaceAction(
  kind: "team" | "instructor",
  id: string | null,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin(kind === "team" ? "team" : "instructors");
  let saved: { id: string };
  try {
    const data = Object.fromEntries(form);
    if (kind === "team") {
      const parsed = teamSchema.safeParse(data);
      if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
      saved = await saveTeamMember(actor, parsed.data, id || undefined);
    } else {
      const parsed = instructorSchema.safeParse(data);
      if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
      saved = await saveInstructor(actor, parsed.data, id || undefined);
    }
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/admin/${kind === "team" ? "team" : "instructors"}/${saved.id}/edit?saved=1`);
}
export async function deleteWorkspaceAction(
  kind: "course" | "class" | "instructor" | "team",
  id: string,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  try {
    await deleteWorkspaceRecord(actor, kind, id, String(form.get("confirmation") || ""));
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(
    `/admin/${{ course: "courses", class: "classes", instructor: "instructors", team: "team" }[kind]}?deleted=1`,
  );
}
export type CodeState = ActionState & { code?: string };
export async function issueCodeAction(_: CodeState, form: FormData): Promise<CodeState> {
  const actor = await requireAdmin("codes");
  const parsed = codeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    const result = await issueClassCode(actor, parsed.data);
    refresh();
    return { ok: true, message: "", code: result.code };
  } catch (error) {
    return failure(error);
  }
}
export async function revokeCodeAction(
  id: string,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin("codes");
  if (form.get("confirmation") !== "revoke")
    return { ok: false, message: "Confirm revocation first." };
  try {
    await revokeClassCode(actor, id);
    refresh();
    return { ok: true, message: "Code revoked." };
  } catch (error) {
    return failure(error);
  }
}
