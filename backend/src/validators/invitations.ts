import { z } from "zod";
import { registerSchema } from "./forms";
export const invitationSchema = z.object({
  adminLevel: z.enum(["MANAGER", "STAFF"]),
  note: z.string().trim().max(100).default(""),
  expiresHours: z.coerce.number().int().min(1).max(168).default(24),
});
export const invitationRegistrationSchema = registerSchema
  .extend({
    username: z.string().trim().min(3).max(32).toLowerCase(),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type InvitationInput = z.infer<typeof invitationSchema>;
export type InvitationRegistrationInput = z.infer<typeof invitationRegistrationSchema>;
