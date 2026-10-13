import type { ClassSchedule, Course } from "@prisma/client";
import { saveClassAction, saveCourseAction } from "@backend/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { enumLabel, portalCopy } from "@/lib/portal-copy";
import type { Locale } from "@/lib/i18n";

const inputClass =
  "min-h-11 w-full rounded-lg border border-line/20 bg-page px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent";
type FieldProps = {
  label: string;
  name: string;
  value?: string | number;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
  hint?: string;
};
function Field({ label, name, value, type = "text", min, max, required = true, hint }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        className={inputClass}
        name={name}
        type={type}
        defaultValue={value}
        min={min}
        max={max}
        required={required}
      />
      {hint && <span className="font-normal text-subtle">{hint}</span>}
    </label>
  );
}
function Area({ label, name, value, hint, required = false }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <textarea
        className={inputClass}
        name={name}
        defaultValue={value}
        rows={4}
        required={required}
      />
      {hint && <span className="font-normal text-subtle">{hint}</span>}
    </label>
  );
}
function Choice({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: [string, string][];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select className={inputClass} name={name} defaultValue={value} required>
        {options.map(([value, label]) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
const deliveryTypes = ["ONLINE_LIVE", "IN_PERSON", "HYBRID", "SELF_PACED"];

export function CourseEditor({
  course,
  instructors,
  locale,
}: {
  course?: Course & { category: { name: string } };
  instructors: { id: string; fullName: string }[];
  locale: Locale;
}) {
  const t = portalCopy(locale);
  const options = (values: string[]): [string, string][] =>
    values.map((value) => [value, enumLabel(value, locale)]);
  return (
    <div className="max-w-4xl rounded-xl border border-line/10 bg-surface p-5 sm:p-8">
      <p className="mb-6 text-sm leading-7 text-muted">{t.courseHint}</p>
      <ActionForm
        key={course?.updatedAt.toISOString() || "new"}
        action={saveCourseAction.bind(null, course?.id || null)}
        submitLabel={t.save}
      >
        <Field label={t.courseTitle} name="title" value={course?.title} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.category} name="category" value={course?.category.name} />
          <Choice
            label={t.instructor}
            name="instructorId"
            value={course?.instructorId || instructors[0]?.id}
            options={instructors.map((item) => [item.id, item.fullName])}
          />
          <Choice
            label={t.level}
            name="level"
            value={course?.level || "BEGINNER"}
            options={options(["BEGINNER", "INTERMEDIATE", "ADVANCED"])}
          />
          <Field label={t.duration} name="duration" value={course?.duration} />
          <Choice
            label={t.delivery}
            name="deliveryType"
            value={course?.deliveryType || "ONLINE_LIVE"}
            options={options(deliveryTypes)}
          />
          <Field
            label={t.price}
            name="price"
            type="number"
            min={0}
            max={100000000}
            value={course?.price ?? 0}
          />
        </div>
        <Area label={t.summary} name="shortDescription" value={course?.shortDescription} required />
        <Area
          label={t.description}
          name="fullDescription"
          value={course?.fullDescription}
          required
        />
        <Area
          label={t.outcomes}
          name="outcomes"
          value={course?.outcomes.join("\n")}
          hint={t.lines}
        />
        <Area
          label={t.requirements}
          name="requirements"
          value={course?.requirements.join("\n")}
          hint={t.lines}
        />
        <Area
          label={t.audience}
          name="targetAudience"
          value={course?.targetAudience.join("\n")}
          hint={t.lines}
        />
        <Choice
          label={t.status}
          name="status"
          value={course?.status || "DRAFT"}
          options={options(["DRAFT", "PUBLISHED", "ARCHIVED"])}
        />
        <label className="flex items-center gap-3 text-sm">
          <input name="featured" type="checkbox" defaultChecked={course?.featured} />
          {t.featured}
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input name="certificate" type="checkbox" defaultChecked={course?.certificate ?? false} />
          {t.certificate}
        </label>
      </ActionForm>
    </div>
  );
}

export function ClassEditor({
  klass,
  courses,
  locale,
  selectedCourse,
}: {
  klass?: ClassSchedule;
  courses: { id: string; title: string; status: string }[];
  locale: Locale;
  selectedCourse?: string;
}) {
  const t = portalCopy(locale);
  const options = (values: string[]): [string, string][] =>
    values.map((value) => [value, enumLabel(value, locale)]);
  // Format in the same explicit timezone used when parsing submitted dates.
  const date = (value?: Date) =>
    value
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Yangon",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(value)
      : undefined;
  const time = (value?: Date) =>
    value
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Yangon",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(value)
      : "18:00";
  return (
    <div className="max-w-4xl rounded-xl border border-line/10 bg-surface p-5 sm:p-8">
      <p className="mb-2 text-sm leading-7 text-muted">{t.classHint}</p>
      <p className="mb-6 text-sm font-semibold text-accent">{t.timezone}</p>
      <ActionForm
        key={klass?.updatedAt.toISOString() || "new"}
        action={saveClassAction.bind(null, klass?.id || null)}
        submitLabel={t.save}
      >
        <Field label={t.classTitle} name="title" value={klass?.title} />
        <Choice
          label={t.course}
          name="courseId"
          value={klass?.courseId || selectedCourse || ""}
          options={[
            ["", t.choose],
            ...courses.map((course): [string, string] => [
              course.id,
              `${course.title} (${enumLabel(course.status, locale)})`,
            ]),
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.startDate} name="startDate" type="date" value={date(klass?.startDate)} />
          <Field label={t.endDate} name="endDate" type="date" value={date(klass?.endDate)} />
          <Field
            label={t.startTime}
            name="startTime"
            type="time"
            value={klass?.startTime || "19:00"}
          />
          <Field label={t.endTime} name="endTime" type="time" value={klass?.endTime || "21:00"} />
          <Field
            label={t.deadlineDate}
            name="deadlineDate"
            type="date"
            value={date(klass?.enrollmentDeadline)}
          />
          <Field
            label={t.deadlineTime}
            name="deadlineTime"
            type="time"
            value={time(klass?.enrollmentDeadline)}
          />
          <Field
            label={t.capacity}
            name="maxStudents"
            type="number"
            min={Math.max(1, klass?.currentEnrolled || 0)}
            max={10000}
            value={klass?.maxStudents ?? 25}
          />
          <Field
            label={t.price}
            name="price"
            type="number"
            min={0}
            max={100000000}
            value={klass?.price ?? 0}
          />
          <Choice
            label={t.delivery}
            name="deliveryType"
            value={klass?.deliveryType || "ONLINE_LIVE"}
            options={options(deliveryTypes)}
          />
          <Field
            label={t.location}
            name="location"
            required={false}
            value={klass?.location || ""}
          />
        </div>
        <fieldset className="rounded-lg border border-line/20 p-4">
          <legend className="px-2 text-sm font-semibold">{t.days}</legend>
          <div className="flex flex-wrap gap-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <label key={day} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="daysOfWeek"
                  value={day}
                  defaultChecked={klass?.daysOfWeek.includes(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </fieldset>
        <Area label={t.notes} name="notes" value={klass?.notes || ""} />
        <Choice
          label={t.status}
          name="status"
          value={klass?.status || "DRAFT"}
          options={options([
            "DRAFT",
            "UPCOMING",
            "OPEN_FOR_ENROLLMENT",
            "ENROLLMENT_CLOSED",
            "FULL",
            "IN_PROGRESS",
            "CANCELLED",
            "COMPLETED",
          ])}
        />
      </ActionForm>
    </div>
  );
}
