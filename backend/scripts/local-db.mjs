import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
process.chdir(root);
const data = resolve(root, "backend/.postgres-data");
const log = resolve(root, "backend/.postgres.log");
const marker = resolve(root, "backend/.local-setup.json");
const mode = process.argv[2] || "setup";
const executable = (name) =>
  process.env.PG_BIN
    ? resolve(process.env.PG_BIN, name + (process.platform === "win32" ? ".exe" : ""))
    : name;
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, stdio: "inherit", ...options });

if (!["setup", "start", "stop"].includes(mode)) throw new Error("Use setup, start, or stop.");
if (mode === "stop") {
  if (!existsSync(marker)) throw new Error("No managed local database found.");
  run(executable("pg_ctl"), ["-D", data, "-w", "stop"]);
} else {
  if (!existsSync(marker)) {
    if (mode !== "setup") throw new Error("Run npm run db:setup first.");
    if (existsSync(".env") || existsSync("frontend/.env.local") || existsSync(data)) {
      throw new Error(
        "Local config or database already exists. It was left untouched. Use your existing DATABASE_URL or move the config before fresh setup.",
      );
    }
    run(executable("initdb"), ["--version"]);
    mkdirSync(dirname(marker), { recursive: true });
    const config = {
      password: randomBytes(24).toString("hex"),
      adminPassword: randomBytes(18).toString("base64url"),
      secret: randomBytes(32).toString("base64url"),
    };
    writeFileSync(marker, JSON.stringify(config), { mode: 0o600, flag: "wx" });
  }
  const config = JSON.parse(readFileSync(marker, "utf8"));
  const dbUrl = `postgresql://postgres:${config.password}@127.0.0.1:55432/21ct_local?schema=public`;
  if (!existsSync(resolve(data, "PG_VERSION"))) {
    const passwordFile = resolve(root, "backend/.local-postgres-password");
    writeFileSync(passwordFile, config.password, { mode: 0o600 });
    try {
      run(executable("initdb"), [
        "-D",
        data,
        "-U",
        "postgres",
        "--encoding=UTF8",
        "--locale=C",
        "--auth=scram-sha-256",
        `--pwfile=${passwordFile}`,
      ]);
    } finally {
      unlinkSync(passwordFile);
    }
  }
  const status = spawnSync(executable("pg_ctl"), ["-D", data, "status"], { stdio: "ignore" });
  if (status.status !== 0)
    run(executable("pg_ctl"), [
      "-D",
      data,
      "-l",
      log,
      "-o",
      "-p 55432 -h 127.0.0.1",
      "-w",
      "start",
    ]);
  if (mode === "setup") {
    const pgEnv = { ...process.env, PGPASSWORD: config.password };
    const connection = ["-h", "127.0.0.1", "-p", "55432", "-U", "postgres"];
    const found = execFileSync(
      executable("psql"),
      [
        ...connection,
        "-d",
        "postgres",
        "-tAc",
        "SELECT 1 FROM pg_database WHERE datname='21ct_local'",
      ],
      { env: pgEnv, encoding: "utf8" },
    ).trim();
    if (found !== "1") run(executable("createdb"), [...connection, "21ct_local"], { env: pgEnv });
    const env = `DATABASE_URL="${dbUrl}"\nAUTH_SECRET="${config.secret}"\nAUTH_URL="http://localhost:3000"\nAUTH_TRUST_HOST="true"\nNEXT_PUBLIC_SITE_URL="http://localhost:3000"\n`;
    for (const path of [".env", "frontend/.env.local"]) {
      if (!existsSync(path)) writeFileSync(path, env, { mode: 0o600, flag: "wx" });
    }
    const childEnv = {
      ...process.env,
      DATABASE_URL: dbUrl,
      ADMIN_EMAIL: "admin@21ct.local",
      ADMIN_PASSWORD: config.adminPassword,
    };
    run(
      process.execPath,
      [
        "node_modules/prisma/build/index.js",
        "migrate",
        "deploy",
        "--schema",
        "backend/prisma/schema.prisma",
      ],
      { env: childEnv },
    );
    run(
      process.execPath,
      [
        "node_modules/prisma/build/index.js",
        "generate",
        "--schema",
        "backend/prisma/schema.prisma",
      ],
      { env: childEnv },
    );
    run(process.execPath, ["--import", "tsx", "backend/scripts/create-admin.ts"], {
      env: childEnv,
    });
    const credentials =
      "LOCAL DEVELOPMENT ONLY\nLogin: http://localhost:3000/login\nEmail: admin@21ct.local\nPassword: " +
      config.adminPassword +
      "\n";
    if (!existsSync(".local-admin.txt"))
      writeFileSync(".local-admin.txt", credentials, { mode: 0o600, flag: "wx" });
    console.log(
      "Local database is ready. Admin credentials: .local-admin.txt (ignored by Git). Run npm run dev.",
    );
  } else {
    console.log("Local database is running on 127.0.0.1:55432.");
  }
}
