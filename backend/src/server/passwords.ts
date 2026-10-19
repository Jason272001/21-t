import bcrypt from "bcryptjs";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// OWASP's 32 MiB scrypt profile. Versioned so parameters can evolve safely.
const prefix = "scrypt$v1$32768$8$3$";
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });

export async function hashPassword(password: string) {
  if (password.length < 8) throw new Error("Use at least 8 characters for a new password.");
  const salt = randomBytes(16).toString("hex");
  return `${prefix}${salt}$${(await derive(password, salt)).toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string) {
  if (!password) return false;
  if (hash.startsWith(prefix)) {
    const parts = hash.slice(prefix.length).split("$");
    if (parts.length !== 2 || !/^[a-f0-9]{32}$/.test(parts[0]) || !/^[a-f0-9]{128}$/.test(parts[1]))
      return false;
    return timingSafeEqual(await derive(password, parts[0]), Buffer.from(parts[1], "hex"));
  }
  // Preserve existing bcrypt accounts; never truncate their login input.
  if (Buffer.byteLength(password, "utf8") > 72 || !/^\$2[aby]\$\d{2}\$/.test(hash)) return false;
  return bcrypt.compare(password, hash);
}
