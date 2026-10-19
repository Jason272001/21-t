"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../lib/access";
import { postComment, reactToArticle, removeComment } from "../server/discussion";
import { AdminError } from "../server/admin";
import type { ActionState } from "./public";

async function refresh(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  if (article) revalidatePath(`/articles/${article.slug}`);
  revalidatePath(`/admin/articles/${articleId}/edit`);
}
const failure = (error: unknown): ActionState => ({
  ok: false,
  message: error instanceof AdminError ? error.message : "Could not save. Please try again.",
});

// Intentionally public: no session, identity cookie, IP address or user-agent is read.
export async function commentAction(
  articleId: string,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await postComment(articleId, { body: form.get("body"), website: form.get("website") || "" });
  } catch (error) {
    return failure(error);
  }
  await refresh(articleId);
  return { ok: true, message: "Comment posted. / မှတ်ချက်တင်ပြီးပါပြီ။" };
}
export async function reactionAction(
  articleId: string,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await reactToArticle(articleId, form.get("direction"));
  } catch (error) {
    return failure(error);
  }
  await refresh(articleId);
  return { ok: true, message: "Thank you for your feedback. / အကြံပြုချက်အတွက် ကျေးဇူးတင်ပါသည်။" };
}
export async function removeCommentAction(articleId: string, id: string): Promise<ActionState> {
  const actor = await requireAdmin("articles");
  try {
    await removeComment(actor, articleId, id);
  } catch (error) {
    return failure(error);
  }
  await refresh(articleId);
  return { ok: true, message: "Comment removed. / မှတ်ချက်ဖျက်ပြီးပါပြီ။" };
}
