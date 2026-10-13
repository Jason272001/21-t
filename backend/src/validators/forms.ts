import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Valid email is required").max(254),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Password must be at most 72 UTF-8 bytes.",
    ),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10),
  inquiryType: z.string().min(1),
  courseInterest: z.string().optional(),
  contactPreference: z.string().min(1),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export const enrollmentSchema = z.object({
  classScheduleId: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
          !Number.isNaN(Date.parse(value)) &&
          new Date(value).toISOString().slice(0, 10) === value &&
          new Date(value) <= new Date()),
      "Enter a valid past date of birth.",
    ),
  educationLevel: z.string().min(1),
  occupation: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  preferredContact: z.enum(["EMAIL", "PHONE", "MESSENGER", "VIBER"]),
  emergencyName: z.string().min(2),
  emergencyPhone: z.string().min(6),
  priorExperience: z.string().optional(),
  learningGoal: z.string().min(10),
  heardFrom: z.string().optional(),
  agreement: z.literal("on"),
  terms: z.literal("on"),
  privacy: z.literal("on"),
});
