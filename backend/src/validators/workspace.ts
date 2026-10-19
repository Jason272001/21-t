import { z } from "zod";
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const teamSchema = z.object({
  name: text(2, 100),
  email: text(3, 254).email().toLowerCase(),
  username: text(3, 32).regex(/^[a-z0-9_-]+$/),
  password: z
    .string()
    .refine((v) => !v || v.length >= 8, "Use at least 8 characters for a new password."),
  adminLevel: z.enum(["OWNER", "MANAGER", "STAFF"]),
  isActive: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});
export const instructorSchema = z.object({
  fullName: text(2, 100),
  email: text(3, 254).email().toLowerCase(),
  jobTitle: text(2, 100),
  biography: text(10, 20000),
  expertise: text(0, 5000).transform((v) =>
    v
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  ),
  experience: text(0, 10000),
});
export const codeSchema = z.object({
  classScheduleId: text(1, 100),
  recipient: text(0, 254),
  paymentReference: text(0, 200),
  expiresDays: z.coerce.number().int().min(1).max(365),
});
export type TeamInput = z.infer<typeof teamSchema>;
export type InstructorInput = z.infer<typeof instructorSchema>;
export type CodeInput = z.infer<typeof codeSchema>;
