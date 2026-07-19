import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/utils";

type ClassCardProps = {
  item: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
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

export function ClassCard({ item }: ClassCardProps) {
  const seats = Math.max(0, item.maxStudents - item.currentEnrolled);
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge label={item.status} tone={seats > 0 ? "green" : "orange"} />
        <span className="text-sm font-bold text-cyan-200">{formatMoney(item.price)}</span>
      </div>
      <h3 className="mt-4 text-xl font-black text-white">{item.title}</h3>
      <p className="mt-2 text-sm text-slate-300">{item.course?.title} • {item.instructor?.fullName}</p>
      <div className="mt-5 grid gap-2 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan-200" /> {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()} • {item.daysOfWeek.join(", ")} • {item.startTime}-{item.endTime}</span>
        <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-200" /> {item.deliveryType.replaceAll("_", " ")} {item.location ? `• ${item.location}` : ""}</span>
        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-cyan-200" /> {seats} seats remaining</span>
      </div>
      <Link href={`/enrollment?classId=${item.id}`} className="mt-5 inline-flex rounded-lg bg-orange-400 px-4 py-2 text-sm font-bold text-slate-950">အတန်းအပ်ရန်</Link>
    </article>
  );
}
