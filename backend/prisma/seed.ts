import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  articleCategories,
  articles,
  courseCategories,
  courses,
  instructors,
  testimonials,
} from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.classAnnouncement.deleteMany();
  await prisma.courseMaterial.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.curriculumLesson.deleteMany();
  await prisma.curriculumSection.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.course.deleteMany();
  await prisma.courseCategory.deleteMany();
  await prisma.article.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.articleCategory.deleteMany();
  await prisma.instructorProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin@21CT", 12);
  const admin = await prisma.user.create({
    data: {
      name: "21CT Admin",
      email: "admin@21ct.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const categoryMap = new Map<string, string>();
  for (const category of articleCategories) {
    const created = await prisma.articleCategory.create({ data: category });
    categoryMap.set(category.slug, created.id);
  }

  const tagMap = new Map<string, string>();
  for (const tag of ["မြန်မာလို IT", "21CT", "Beginner", "Security"]) {
    const created = await prisma.articleTag.create({
      data: { name: tag, slug: tag.toLowerCase().replaceAll(" ", "-") },
    });
    tagMap.set(tag, created.id);
  }

  for (const article of articles) {
    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        categoryId: categoryMap.get(article.categorySlug)!,
        authorId: admin.id,
        publishedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
        readingTime: article.readingTime,
        status: "PUBLISHED",
        featured: article.featured,
        views: article.views,
        seoTitle: `${article.title} | 21CT`,
        seoDescription: article.excerpt,
        tags: { connect: article.tags.map((tag) => ({ id: tagMap.get(tag)! })) },
      },
    });
  }

  const courseCategoryMap = new Map<string, string>();
  for (const category of courseCategories) {
    const created = await prisma.courseCategory.create({ data: category });
    courseCategoryMap.set(category.name, created.id);
  }

  const instructorMap = new Map<string, string>();
  for (const instructor of instructors) {
    const user = await prisma.user.create({
      data: {
        name: instructor.fullName,
        email: `${instructor.slug}@21ct.local`,
        passwordHash: await bcrypt.hash("Instructor@21CT", 12),
        role: "INSTRUCTOR",
      },
    });
    const profile = await prisma.instructorProfile.create({
      data: {
        userId: user.id,
        fullName: instructor.fullName,
        slug: instructor.slug,
        jobTitle: instructor.jobTitle,
        biography:
          "လက်တွေ့သင်ကြားမှုကို ဦးစားပေးပြီး မြန်မာလိုရှင်းလင်းပြတ်သားစွာ သင်ကြားပေးသော 21CT instructor ဖြစ်ပါသည်။",
        expertise: instructor.expertise,
        certifications: instructor.certifications,
        experience: instructor.experience,
        featured: true,
      },
    });
    instructorMap.set(instructor.fullName, profile.id);
  }

  const createdCourses = [];
  for (const course of courses) {
    const created = await prisma.course.create({
      data: {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription,
        categoryId: courseCategoryMap.get(course.category)!,
        level: course.level as never,
        duration: course.duration,
        deliveryType: course.deliveryType as never,
        instructorId: instructorMap.get(course.instructor)!,
        price: course.price,
        discountPrice: course.discountPrice,
        status: "PUBLISHED",
        certificate: true,
        outcomes: course.outcomes,
        requirements: course.requirements,
        targetAudience: course.targetAudience,
        featured: course.featured,
        curriculumSections: {
          create: [
            {
              title: "Foundation",
              sortOrder: 1,
              lessons: {
                create: [
                  { title: "Course orientation", sortOrder: 1, duration: "45 min", isPreview: true },
                  { title: "Core concepts", sortOrder: 2, duration: "90 min" },
                ],
              },
            },
            {
              title: "Practical Labs",
              sortOrder: 2,
              lessons: {
                create: [
                  { title: "Guided practice", sortOrder: 1, duration: "120 min" },
                  { title: "Final project and review", sortOrder: 2, duration: "120 min" },
                ],
              },
            },
          ],
        },
      },
    });
    createdCourses.push(created);
  }

  for (let i = 0; i < 10; i += 1) {
    const course = createdCourses[i % createdCourses.length];
    await prisma.classSchedule.create({
      data: {
        title: `${course.title} - Batch ${i + 1}`,
        courseId: course.id,
        instructorId: course.instructorId,
        startDate: new Date(Date.now() + (i + 3) * 1000 * 60 * 60 * 24),
        endDate: new Date(Date.now() + (i + 45) * 1000 * 60 * 60 * 24),
        daysOfWeek: i % 2 === 0 ? ["Sat", "Sun"] : ["Mon", "Wed", "Fri"],
        startTime: i % 2 === 0 ? "09:00" : "19:00",
        endTime: i % 2 === 0 ? "11:00" : "21:00",
        deliveryType: course.deliveryType,
        location: course.deliveryType === "ONLINE_LIVE" ? null : "Yangon Training Center",
        meetingLink: course.deliveryType === "IN_PERSON" ? null : "https://meet.example.com/21ct",
        maxStudents: 25,
        currentEnrolled: i,
        enrollmentDeadline: new Date(Date.now() + (i + 1) * 1000 * 60 * 60 * 24),
        price: course.discountPrice ?? course.price,
        status: "OPEN_FOR_ENROLLMENT",
        notes: "Seats are confirmed after admin review and payment check.",
      },
    });
  }

  const classes = await prisma.classSchedule.findMany({ take: 4, include: { course: true } });
  for (let i = 0; i < 6; i += 1) {
    const user = await prisma.user.create({
      data: {
        name: `Student ${i + 1}`,
        email: `student${i + 1}@21ct.local`,
        passwordHash: await bcrypt.hash("Student@21CT", 12),
        role: "STUDENT",
        studentProfile: {
          create: {
            phone: `09${i + 1}2345678`,
            educationLevel: "University",
            occupation: "Student",
            city: "Yangon",
            country: "Myanmar",
            learningGoal: "IT career စတင်ရန် လက်တွေ့ skill များလေ့လာချင်သည်။",
          },
        },
      },
      include: { studentProfile: true },
    });
    const klass = classes[i % classes.length];
    await prisma.enrollment.create({
      data: {
        confirmationNumber: `21CT-SAMPLE-${i + 1}`,
        studentProfileId: user.studentProfile!.id,
        classScheduleId: klass.id,
        status: i % 2 === 0 ? "CONFIRMED" : "AWAITING_PAYMENT",
        learningGoal: "Better job readiness",
        payments: {
          create: {
            amount: klass.price,
            method: klass.price === 0 ? "FREE" : "MANUAL",
            status: i % 2 === 0 ? "PAID" : "UNPAID",
            paidDate: i % 2 === 0 ? new Date() : null,
          },
        },
      },
    });
  }

  for (let i = 0; i < testimonials.length; i += 1) {
    await prisma.testimonial.create({
      data: {
        ...testimonials[i],
        approved: true,
        courseId: createdCourses[i % createdCourses.length].id,
      },
    });
  }

  await prisma.siteSetting.createMany({
    data: [
      { key: "homepage", value: { heroEnabled: true, facebookCta: true } },
      { key: "seo", value: { title: "21CT", description: "Burmese technology education" } },
    ],
  });

  console.log("Seed complete. Admin: admin@21ct.local / Admin@21CT");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
