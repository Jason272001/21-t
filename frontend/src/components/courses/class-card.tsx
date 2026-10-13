import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";
import { getLanguage } from "@/lib/i18n-server";

type ClassCardProps = {
  item: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    enrollmentDeadline?: Date;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    deliveryType: string;
    location?: string | null;
    maxStudents: number;
    currentEnrolled: number;
    price: number;
    status: string;
    course?: { title: string; slug: string };
    instructor?: { fullName: string };
  };
};

export async function ClassCard({ item }: ClassCardProps) {
  const {
    locale,
    messages: { common, nav },
  } = await getLanguage();
  const seats = Math.max(0, item.maxStudents - item.currentEnrolled);
  return (
    <article className="rounded-lg border border-line/10 bg-surface p-5 shadow-xl shadow-card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge label={item.status} tone={seats > 0 ? "green" : "orange"} />
        <span className="text-sm font-bold text-accent">
          {item.price === 0 ? common.free : formatMoney(item.price)}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-black text-foreground">{item.title}</h3>
      <p className="mt-2 text-sm text-muted">
        {item.course?.title} â€¢ {item.instructor?.fullName}
      </p>
      <div className="mt-5 grid gap-2 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-accent" />{" "}
          {item.startDate.toLocaleDateString(locale, { timeZone: "Asia/Yangon" })} -{" "}
          {item.endDate.toLocaleDateString(locale, { timeZone: "Asia/Yangon" })} â€¢{" "}
          {item.daysOfWeek.join(", ")} â€¢ {item.startTime}-{item.endTime}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" /> {item.deliveryType.replaceAll("_", " ")}{" "}
          {item.location ? `â€¢ ${item.location}` : ""}
        </span>
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" /> {seats} {common.seats}
        </span>
      </div>
      {item.status === "OPEN_FOR_ENROLLMENT" &&
      seats > 0 &&
      item.startDate > new Date() &&
      (!item.enrollmentDeadline || item.enrollmentDeadline > new Date()) ? (
        <Link
          href={`/enrollment?classId=${item.id}`}
          className="mt-5 inline-flex rounded-lg bg-orange-400 px-4 py-2 text-sm font-bold text-slate-950"
        >
          {nav.enroll}
        </Link>
      ) : null}
    </article>
  );
}
