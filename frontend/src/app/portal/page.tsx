import { redirect } from "next/navigation";
import { portalPath, requireUser } from "@backend/lib/access";

export default async function PortalPage() {
  const user = await requireUser();
  redirect(portalPath(user.role));
}
