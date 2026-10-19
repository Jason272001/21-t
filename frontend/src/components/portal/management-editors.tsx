import Image from "next/image";
import type { Article, Video, StudentProfile } from "@prisma/client";
import { ActionForm } from "@/components/forms/action-form";
import {
  saveStudentAction,
  saveArticleAction,
  saveVideoAction,
  deleteRecordAction,
} from "@backend/actions/management";
import { managementCopy } from "@/lib/management-copy";
import { enumLabel } from "@/lib/portal-copy";
import type { Locale } from "@/lib/i18n";
import { PasswordField } from "@/components/forms/password-field";
const inputClass = "min-h-11 w-full rounded-lg border border-line/20 bg-page p-3 text-foreground";
export function Input({
  label,
  name,
  value,
  type = "text",
  required = false,
  hint,
  locale,
}: {
  label: string;
  name: string;
  value?: string | null;
  type?: string;
  required?: boolean;
  hint?: string;
  locale?: Locale;
}) {
  if (type === "password")
    return (
      <PasswordField
        name={name}
        label={label}
        defaultValue={value || ""}
        required={required}
        hint={hint}
        locale={locale}
      />
    );
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        className={inputClass}
        name={name}
        type={type}
        defaultValue={value || ""}
        required={required}
        autoComplete={type === "password" ? "new-password" : undefined}
      />
      {hint && <span className="text-sm font-normal text-subtle">{hint}</span>}
    </label>
  );
}
function Area({
  label,
  name,
  value,
  required = false,
  rows = 4,
}: {
  label: string;
  name: string;
  value?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <textarea
        name={name}
        defaultValue={value}
        rows={rows}
        required={required}
        className={inputClass}
      />
    </label>
  );
}
function Status({ value, locale }: { value?: string; locale: Locale }) {
  const t = managementCopy(locale);
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {t.status}
      <select className={inputClass} name="status" defaultValue={value || "DRAFT"}>
        {["DRAFT", "PUBLISHED"].map((status) => (
          <option key={status} value={status}>
            {enumLabel(status, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
export function DeleteEditor({
  kind,
  id,
  confirmation,
  locale,
}: {
  kind: "student" | "article" | "video";
  id: string;
  confirmation: string;
  locale: Locale;
}) {
  const t = managementCopy(locale);
  return (
    <details className="mt-8 max-w-4xl rounded-xl border border-red-400/40 bg-surface p-6">
      <summary className="cursor-pointer font-semibold text-warning">{t.delete}</summary>
      <p className="my-4 text-sm text-muted">{t.deleteHint}</p>
      {kind === "student" && <p className="mb-4 text-sm text-muted">{t.studentDelete}</p>}
      <ActionForm action={deleteRecordAction.bind(null, kind, id)} submitLabel={t.delete}>
        <Input label={confirmation} name="confirmation" required />
      </ActionForm>
    </details>
  );
}
export function StudentEditor({
  student,
  locale,
}: {
  student?: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
    studentProfile: StudentProfile | null;
  };
  locale: Locale;
}) {
  const t = managementCopy(locale);
  return (
    <div className="max-w-4xl rounded-xl border border-line/10 bg-surface p-6">
      <ActionForm action={saveStudentAction.bind(null, student?.id || null)} submitLabel={t.save}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="name" label={t.name} value={student?.name} required />
          <Input name="email" type="email" label={t.email} value={student?.email} required />
        </div>
        <Input
          name="password"
          locale={locale}
          type="password"
          label={t.password}
          required={!student}
          hint={t.passwordHint}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Input name="phone" label={t.phone} value={student?.studentProfile?.phone} />
          <Input name="city" label={t.city} value={student?.studentProfile?.city} />
          <Input
            name="country"
            label={t.country}
            value={student?.studentProfile?.country || "Myanmar"}
          />
        </div>
        <label className="flex gap-3 text-sm">
          <input name="isActive" type="checkbox" defaultChecked={student?.isActive ?? true} />
          {t.active}
        </label>
      </ActionForm>
    </div>
  );
}
export function ArticleEditor({
  article,
  locale,
}: {
  article?: Article & { category: { name: string }; tags: { name: string }[] };
  locale: Locale;
}) {
  const t = managementCopy(locale);
  return (
    <div className="max-w-4xl rounded-xl border border-line/10 bg-surface p-6">
      <ActionForm
        key={article?.updatedAt.toISOString()}
        action={saveArticleAction.bind(null, article?.id || null)}
        submitLabel={t.save}
      >
        <Input name="title" label={t.title} value={article?.title} required />
        <Input
          name="tags"
          label={locale === "en" ? "Tags" : "တဂ်များ"}
          value={article?.tags.map((tag) => tag.name).join(", ")}
          hint={
            locale === "en"
              ? "Separate with commas. Up to 10 tags, 40 characters each."
              : "ကော်မာဖြင့် ခွဲပါ။ တဂ် ၁၀ ခုအထိ၊ တစ်ခုလျှင် စာလုံး ၄၀ အထိ။"
          }
        />
        <label className="grid gap-2 text-sm font-semibold">
          {locale === "en" ? "Cover picture" : "မျက်နှာဖုံးပုံ"}
          <input
            name="picture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
          />
          <span className="text-xs font-normal text-subtle">
            {locale === "en"
              ? "JPEG, PNG or WebP, up to 2 MB. Leave empty to keep the current image."
              : "JPEG၊ PNG သို့မဟုတ် WebP၊ ၂ MB အထိ။ လက်ရှိပုံကို ဆက်သုံးရန် အလွတ်ထားပါ။"}
          </span>
        </label>
        {article?.featuredImage && (
          <div className="grid gap-3">
            <Image
              unoptimized
              width={1200}
              height={675}
              src={article.featuredImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="max-h-64 rounded-xl object-contain"
            />

            <label className="flex gap-3 text-sm">
              <input type="checkbox" name="removeImage" />
              {locale === "en" ? "Remove current picture" : "လက်ရှိပုံကို ဖယ်ရှားရန်"}
            </label>
          </div>
        )}
        <Input name="category" label={t.category} value={article?.category.name} required />
        <Area name="excerpt" label={t.excerpt} value={article?.excerpt} required />
        <Area name="content" label={t.content} value={article?.content} required rows={14} />
        <Status value={article?.status} locale={locale} />
        <label className="flex gap-3 text-sm">
          <input name="featured" type="checkbox" defaultChecked={article?.featured} />
          {t.featured}
        </label>
      </ActionForm>
    </div>
  );
}
export function VideoEditor({
  video,
  courses,
  locale,
}: {
  video?: Video;
  courses: { id: string; title: string }[];
  locale: Locale;
}) {
  const t = managementCopy(locale);
  return (
    <div className="max-w-4xl rounded-xl border border-line/10 bg-surface p-6">
      <p className="mb-6 text-muted">{t.videoHint}</p>
      <ActionForm
        key={video?.updatedAt.toISOString()}
        action={saveVideoAction.bind(null, video?.id || null)}
        submitLabel={t.save}
      >
        <Input name="title" label={t.title} value={video?.title} required />
        <Area name="description" label={t.description} value={video?.description} />
        <label className="grid gap-2 text-sm font-semibold">
          {t.audience}
          <select
            className={inputClass}
            name="audience"
            defaultValue={video?.audience || "STUDENTS"}
          >
            <option value="PUBLIC">{t.public}</option>
            <option value="STUDENTS">{t.signedIn}</option>
            <option value="ENROLLED">{t.enrolled}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          {t.course}
          <select className={inputClass} name="courseId" defaultValue={video?.courseId || ""}>
            <option value="">{t.noCourse}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <Status value={video?.status} locale={locale} />
      </ActionForm>
    </div>
  );
}
