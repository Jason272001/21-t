import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
if (!["build", "start"].includes(mode)) {
  throw new Error("Use render.mjs build or render.mjs start.");
}

// Render assigns this URL before the build. Explicit values support custom domains.
const siteUrl = process.env.AUTH_URL || process.env.RENDER_EXTERNAL_URL;
if (!siteUrl || new URL(siteUrl).protocol !== "https:") {
  throw new Error("Set AUTH_URL or RENDER_EXTERNAL_URL to the live HTTPS URL.");
}
for (const key of ["DATABASE_URL", "AUTH_SECRET"]) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
const env = {
  ...process.env,
  NODE_ENV: "production",
  AUTH_URL: new URL(siteUrl).origin,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || new URL(siteUrl).origin,
};
const root = fileURLToPath(new URL("../../", import.meta.url));
const next = fileURLToPath(new URL("../../node_modules/next/dist/bin/next", import.meta.url));
const args = [next, mode, "frontend"];
if (mode === "start") args.push("--hostname", "0.0.0.0", "--port", process.env.PORT || "10000");
const child = spawn(process.execPath, args, { cwd: root, env, stdio: "inherit" });
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", () => {
  console.error("Unable to launch Next.js.");
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
