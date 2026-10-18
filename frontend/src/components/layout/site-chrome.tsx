"use client";
import { usePathname } from "next/navigation";
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const admin = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin57/");
  return (
    <>
      {!admin && header}
      {children}
      {!admin && footer}
    </>
  );
}
