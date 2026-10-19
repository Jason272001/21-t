import { z } from "zod";

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a comment first.")
    .max(2000, "Use at most 2,000 characters."),
  website: z.string().max(0, "Could not submit this comment.").optional(),
});
export const reactionSchema = z.enum(["UP", "DOWN"]);
