import { z } from "zod";
import { registerSchema } from "./forms";
export const accountSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    username: z.string().trim().min(3).max(32).toLowerCase(),
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .refine((v) => !v || v.length >= 8, "Use at least 8 characters for a new password."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });
export type AccountInput = z.infer<typeof accountSchema>;
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
