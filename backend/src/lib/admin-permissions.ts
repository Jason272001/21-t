export type AdminLevel = "OWNER" | "MANAGER" | "STAFF";
export type AdminArea =
  "students" | "articles" | "courses" | "classes" | "instructors" | "codes" | "team" | "videos";
export function canManage(level: string | null | undefined, area: AdminArea) {
  if (level === "OWNER") return true;
  if (level === "MANAGER") return ["students", "articles", "team"].includes(area);
  if (level === "STAFF") return ["students", "articles"].includes(area);
  return false;
}
