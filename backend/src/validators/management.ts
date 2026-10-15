import { z } from "zod";
const password = z
  .string()
  .refine(
    (value) => !value || (value.length >= 12 && Buffer.byteLength(value, "utf8") <= 72),
    "Use a password of at least 12 characters and at most 72 UTF-8 bytes.",
  );
export const studentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password,
  phone: z.string().trim().max(40),
  city: z.string().trim().max(100),
  country: z.string().trim().max(100),
  isActive: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});
export const articleSchema = z.object({
  title: z.string().trim().min(3).max(180),
  category: z.string().trim().min(2).max(100),
  excerpt: z.string().trim().min(10).max(1000),
  content: z.string().trim().min(20).max(100000),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});
export const videoSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().max(10000),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    audience: z.enum(["PUBLIC", "STUDENTS", "ENROLLED"]),
    courseId: z.string().max(100),
  })
  .refine(
    (value) => value.audience !== "ENROLLED" || !!value.courseId,
    "Choose a course for enrolled-student videos.",
  );
export type StudentInput = z.infer<typeof studentSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
