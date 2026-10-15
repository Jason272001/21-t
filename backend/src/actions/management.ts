"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../lib/access";
import { AdminError } from "../server/admin";
import {
  saveStudent,
  deleteStudent,
  saveArticle,
  deleteArticle,
  saveVideo,
} from "../server/management";
import { deleteVideo } from "../server/videos";
import { studentSchema, articleSchema, videoSchema } from "../validators/management";
import type { ActionState } from "./public";
function errorState(error: unknown): ActionState {
  return {
    ok: false,
    message:
      error instanceof AdminError
        ? error.message
        : error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
          ? "That email or username is already in use."
          : "Could not save changes. Please try again.",
  };
}
function refresh() {
  for (const path of [
    "/admin",
    "/admin/students",
    "/admin/articles",
    "/admin/videos",
    "/articles",
    "/videos",
    "/student",
    "/student/videos",
    "/schedule",
    "/",
  ])
    revalidatePath(path);
  revalidatePath("/articles/[slug]", "page");
  revalidatePath("/videos/[id]", "page");
}
export async function saveStudentAction(
  id: string | null,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  const parsed = studentSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  let saved;
  try {
    saved = await saveStudent(actor, parsed.data, id || undefined);
  } catch (error) {
    return errorState(error);
  }
  refresh();
  redirect(`/admin/students/${saved.id}/edit?saved=1`);
}
export async function saveArticleAction(
  id: string | null,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  const parsed = articleSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  let saved;
  try {
    saved = await saveArticle(actor, parsed.data, id || undefined);
  } catch (error) {
    return errorState(error);
  }
  refresh();
  redirect(`/admin/articles/${saved.id}/edit?saved=1`);
}
export async function saveVideoAction(
  id: string | null,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  const parsed = videoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  let saved;
  try {
    saved = await saveVideo(actor, parsed.data, id || undefined);
  } catch (error) {
    return errorState(error);
  }
  refresh();
  redirect(`/admin/videos/${saved.id}/edit?saved=1`);
}
export async function deleteRecordAction(
  kind: "student" | "article" | "video",
  id: string,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin();
  const confirmation = String(form.get("confirmation") || "");
  try {
    if (kind === "student") await deleteStudent(actor, id, confirmation);
    else if (kind === "article") await deleteArticle(actor, id, confirmation);
    else await deleteVideo(actor, id, confirmation);
  } catch (error) {
    return errorState(error);
  }
  refresh();
  redirect(
    `/admin/${kind === "student" ? "students" : kind === "article" ? "articles" : "videos"}?deleted=1`,
  );
}
