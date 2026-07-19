import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  dateOfBirth: z.string().optional(),
  educationLevel: z.string().min(1),
  occupation: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  preferredContact: z.string().min(1),
  emergencyName: z.string().min(2),
  emergencyPhone: z.string().min(6),
  priorExperience: z.string().optional(),
  learningGoal: z.string().min(10),
  heardFrom: z.string().optional(),
  agreement: z.literal("on"),
  terms: z.literal("on"),
  privacy: z.literal("on"),
});
