import Link from "next/link";
import { Award, Clock, MonitorPlay } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { getLanguage } from "@/lib/i18n-server";

type CourseCardProps = {
  course: {
    title: string;
    slug: string;
    shortDescription: string;
    level: string;
    duration: string;
    deliveryType: string;
    price: number;
    discountPrice?: number | null;
    category?: { name: string };
    instructor?: { fullName: string };
  };
};

export async function CourseCard({ course }: CourseCardProps) {
  const {
    messages: { common },
  } = await getLanguage();
  const price = course.discountPrice ?? course.price;
  return (
    <article className="overflow-hidden rounded-lg border border-line/10 bg-surface shadow-xl shadow-card-shadow transition hover:-translate-y-1 hover:border-cyan-300/40">
      <div className="tech-grid flex h-36 items-end justify-between bg-page p-5">
        <Logo className="scale-90 origin-left" />
        <StatusBadge label={course.level} tone="orange" />
      </div>
      <div className="p-5">
        <StatusBadge label={course.category?.name || common.course} />
        <Link href={`/courses/${course.slug}`}>
          <h3 className="mt-4 text-xl font-black leading-8 text-foreground hover:text-accent">
            {course.title}
          </h3>
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">
          {course.shortDescription}
        </p>
        <div className="mt-5 grid gap-2 text-xs text-subtle">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-2">
            <MonitorPlay className="h-3.5 w-3.5" /> {course.deliveryType.replaceAll("_", " ")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Award className="h-3.5 w-3.5" /> {course.instructor?.fullName}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-accent">
              {price === 0 ? common.free : formatMoney(price)}
            </p>
            {course.discountPrice ? (
              <p className="text-xs text-faint line-through">{formatMoney(course.price)}</p>
            ) : null}
          </div>
          <Link
            href={`/courses/${course.slug}`}
            className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          >
            {common.view}
          </Link>
        </div>
      </div>
    </article>
  );
}
