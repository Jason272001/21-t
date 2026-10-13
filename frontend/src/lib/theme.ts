export const themeCookie = "21ct-theme";
export type Theme = "light" | "dark";

export function resolveTheme(value?: string): Theme {
  return value === "light" ? "light" : "dark";
}
