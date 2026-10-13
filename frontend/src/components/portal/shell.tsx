import Link from "next/link";
import { logoutAction } from "@backend/actions/account";
import { portalCopy } from "@/lib/portal-copy";
import type { Locale } from "@/lib/i18n";

export function PortalShell({
  title,
  description,
  name,
  locale,
  admin = false,
  children,
}: {
  title: string;
  description?: string;
  name: string;
  locale: Locale;
  admin?: boolean;
  children: React.ReactNode;
}) {
  const t = portalCopy(locale);
  return (
    <main className="flex-1 bg-page px-4 py-10 text-foreground lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b border-line/10 pb-6">
          <div>
            <p className="text-sm font-semibold text-accent">{name}</p>
            <h1 className="mt-3 text-3xl font-black leading-relaxed">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-lg border border-line/20 px-4 py-2.5 text-sm font-semibold"
              href={admin ? "/admin" : "/student"}
            >
              {admin ? t.admin : t.student}
            </Link>
            <form action={logoutAction}>
              <button className="min-h-11 rounded-lg bg-overlay/10 px-4 py-2.5 text-sm font-semibold">
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
