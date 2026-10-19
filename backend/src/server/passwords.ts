import bcrypt from "bcryptjs";

export const PASSWORD_COST = 12;

export async function hashPassword(password: string) {
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72)
    throw new Error("Use at least 12 characters and at most 72 UTF-8 bytes for a new password.");
  // bcrypt generates a fresh random salt for every hash.
  return bcrypt.hash(password, PASSWORD_COST);
}

export async function verifyPassword(password: string, hash: string) {
  // Do not silently accept bcrypt's truncation of long UTF-8 passwords.
  if (!password || Buffer.byteLength(password, "utf8") > 72 || !/^\$2[aby]\$\d{2}\$/.test(hash))
    return false;
  return bcrypt.compare(password, hash);
}
