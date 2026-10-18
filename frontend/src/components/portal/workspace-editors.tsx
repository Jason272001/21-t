import type { User, InstructorProfile } from "@prisma/client";
import { ActionForm } from "@/components/forms/action-form";
import { Input } from "./management-editors";
import { saveWorkspaceAction, deleteWorkspaceAction } from "@backend/actions/workspace";
import { workspaceCopy } from "@/lib/workspace-copy";
import type { Locale } from "@/lib/i18n";
const field = "min-h-11 w-full rounded-xl border border-line/20 bg-page p-3 text-foreground";
export function WorkspaceDelete({
  kind,
  id,
  confirmation,
  locale,
}: {
  kind: "course" | "class" | "instructor" | "team";
  id: string;
  confirmation: string;
  locale: Locale;
}) {
  const t = workspaceCopy(locale);
  return (
    <details className="mt-8 rounded-2xl border border-red-400/30 bg-surface p-6">
      <summary className="cursor-pointer text-sm font-semibold text-warning">{t.remove}</summary>
      <p className="my-4 max-w-2xl text-sm leading-7 text-muted">{t.deleteHint}</p>
      <ActionForm action={deleteWorkspaceAction.bind(null, kind, id)} submitLabel={t.remove}>
        <Input name="confirmation" label={confirmation} required />
      </ActionForm>
    </details>
  );
}
export function TeamEditor({
  record,
  locale,
  owner,
}: {
  record?: Pick<User, "id" | "name" | "email" | "username" | "adminLevel" | "isActive">;
  locale: Locale;
  owner: boolean;
}) {
  const t = workspaceCopy(locale);
  return (
    <div className="max-w-3xl rounded-2xl border border-line/10 bg-surface p-5 sm:p-8">
      <ActionForm
        action={saveWorkspaceAction.bind(null, "team", record?.id || null)}
        submitLabel={t.save}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label={t.name} name="name" value={record?.name} required />
          <Input label={t.email} name="email" type="email" value={record?.email} required />
          <Input label={t.username} name="username" value={record?.username} required />
          <label className="grid gap-2 text-sm font-semibold">
            {t.level}
            <select
              name="adminLevel"
              defaultValue={record?.adminLevel || "STAFF"}
              className={field}
            >
              {(owner ? ["STAFF", "MANAGER", "OWNER"] : ["STAFF"]).map((level) => (
                <option key={level} value={level}>
                  {level === "OWNER" ? t.owner : level === "MANAGER" ? t.manager : t.staff}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Input
          label={t.password}
          name="password"
          type="password"
          required={!record}
          hint={t.passwordHint}
        />
        <label className="flex gap-3 py-2 text-sm">
          <input name="isActive" type="checkbox" defaultChecked={record?.isActive ?? true} />
          {t.active}
        </label>
        {!owner && <p className="text-sm text-muted">{t.managerHint}</p>}
      </ActionForm>
    </div>
  );
}
export function InstructorEditor({
  record,
  locale,
}: {
  record?: InstructorProfile & { user: Pick<User, "email"> };
  locale: Locale;
}) {
  const t = workspaceCopy(locale);
  return (
    <div className="max-w-3xl rounded-2xl border border-line/10 bg-surface p-5 sm:p-8">
      <ActionForm
        action={saveWorkspaceAction.bind(null, "instructor", record?.id || null)}
        submitLabel={t.save}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input name="fullName" label={t.name} value={record?.fullName} required />
          <Input name="email" label={t.email} type="email" value={record?.user.email} required />
        </div>
        <Input name="jobTitle" label={t.job} value={record?.jobTitle} required />
        {[
          ["biography", t.bio, record?.biography],
          ["expertise", t.expertise, record?.expertise.join("\n")],
          ["experience", t.experience, record?.experience],
        ].map(([name, label, value]) => (
          <label key={name} className="grid gap-2 text-sm font-semibold">
            {label}
            <textarea
              name={name}
              defaultValue={value}
              rows={5}
              required={name === "biography"}
              className={field}
            />
          </label>
        ))}
      </ActionForm>
    </div>
  );
}
