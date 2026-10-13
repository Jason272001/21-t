"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../lib/access";
import { AdminError, saveClass, saveCourse } from "../server/admin";
import { classSchema, courseSchema } from "../validators/admin";
import type { ActionState } from "./public";

function refreshCatalog() {
  for (const path of ["/", "/admin", "/courses", "/schedule", "/enrollment", "/student"])
    revalidatePath(path);
  revalidatePath("/courses/[slug]", "page");
}

export async function saveCourseAction(
  id: string | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message || "Check the course fields." };
  let courseId: string;
  try {
    courseId = (await saveCourse(actor, parsed.data, id || undefined)).id;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AdminError
          ? error.message
          : "Could not save the course. Please try again.",
    };
  }
  refreshCatalog();
  redirect(`/admin/courses/${courseId}/edit?saved=1`);
}

export async function saveClassAction(
  id: string | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  const parsed = classSchema.safeParse({
    ...Object.fromEntries(formData),
    daysOfWeek: formData.getAll("daysOfWeek"),
  });
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message || "Check the class fields." };
  let classId: string;
  try {
    classId = (await saveClass(actor, parsed.data, id || undefined)).id;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AdminError ? error.message : "Could not save the class. Please try again.",
    };
  }
  refreshCatalog();
  redirect(`/admin/classes/${classId}/edit?saved=1`);
}
