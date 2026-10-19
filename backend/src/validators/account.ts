import { z } from "zod";
import { registerSchema } from "./forms";
export const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    username: z
      .string()
      .trim()
      .max(32)
      .toLowerCase()
      .refine(
        (v) => !v || v.length >= 3,
        "Use at least 3 characters for a username, or leave it blank.",
      )
      .nullable()
      .transform((v) => v || null)
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Choose a profile detail to update.");
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Use at least 8 characters for a new password."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export const classCodeSchema = z
  .string()
  .trim()
  .max(40)
  .transform((v) => v.toUpperCase().replaceAll("-", ""))
  .refine(
    (v) => /^[A-F0-9]{24}$/.test(v),
    "Enter the complete class code provided by your administrator.",
  );
export const studentRegistrationSchema = registerSchema.extend({ classCode: classCodeSchema });
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
