import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma";

export async function allowLogin(email: string) {
  const key = createHash("sha256").update(email).digest("hex");
  const now = new Date();
  const resetAt = new Date(now.getTime() + 15 * 60 * 1000);
  // One atomic upsert prevents parallel requests from bypassing the attempt limit.
  const [attempt] = await prisma.$queryRaw<{ attempts: number }[]>`
    INSERT INTO "LoginAttempt" ("key", "attempts", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE WHEN "LoginAttempt"."resetAt" <= ${now}
        THEN 1 ELSE "LoginAttempt"."attempts" + 1 END,
      "resetAt" = CASE WHEN "LoginAttempt"."resetAt" <= ${now}
        THEN ${resetAt} ELSE "LoginAttempt"."resetAt" END
    RETURNING "attempts"
  `;
  return attempt.attempts <= 10;
}
