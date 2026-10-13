import { z } from "zod";

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const amount = z.coerce.number().int().min(0).max(100000000);
const lines = z
  .string()
  .max(10000)
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  );

export const courseSchema = z.object({
  title: text(3, 180),
  category: text(2, 100),
  instructorId: text(1, 100),
  shortDescription: text(10, 500),
  fullDescription: text(20, 20000),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: text(2, 100),
  deliveryType: z.enum(["ONLINE_LIVE", "IN_PERSON", "HYBRID", "SELF_PACED"]),
  price: amount,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  outcomes: lines,
  requirements: lines,
  targetAudience: lines,
  featured: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  certificate: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Enter a valid calendar date.");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export function myanmarDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+06:30`);
}

export const classSchema = z
  .object({
    title: text(3, 180),
    courseId: text(1, 100),
    startDate: calendarDate,
    endDate: calendarDate,
    startTime: time,
    endTime: time,
    deadlineDate: calendarDate,
    deadlineTime: time,
    daysOfWeek: z
      .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
      .min(1)
      .max(7),
    maxStudents: z.coerce.number().int().min(1).max(10000),
    price: amount,
    deliveryType: z.enum(["ONLINE_LIVE", "IN_PERSON", "HYBRID", "SELF_PACED"]),
    location: z.string().trim().max(300),
    status: z.enum([
      "DRAFT",
      "UPCOMING",
      "OPEN_FOR_ENROLLMENT",
      "ENROLLMENT_CLOSED",
      "FULL",
      "IN_PROGRESS",
      "CANCELLED",
      "COMPLETED",
    ]),
    notes: z.string().trim().max(5000),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate)
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after start date.",
      });
    if (data.endTime <= data.startTime)
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "The daily end time must be after the start time.",
      });
    if (
      myanmarDateTime(data.deadlineDate, data.deadlineTime) >
      myanmarDateTime(data.startDate, data.startTime)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["deadlineDate"],
        message: "Enrollment must close before class starts.",
      });
    }
    if (["IN_PERSON", "HYBRID"].includes(data.deliveryType) && !data.location) {
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "A location is required for in-person classes.",
      });
    }
  });

export type CourseInput = z.infer<typeof courseSchema>;
export type ClassInput = z.infer<typeof classSchema>;
