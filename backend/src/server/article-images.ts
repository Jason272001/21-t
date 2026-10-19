import { AdminError } from "./admin";

export type ArticlePicture = { data: Uint8Array<ArrayBuffer>; mediaType: string };
export async function readArticlePicture(file: File): Promise<ArticlePicture | undefined> {
  if (!file.size) return undefined;
  if (file.size > 2 * 1024 * 1024) throw new AdminError("Choose an image smaller than 2 MB.");
  const data = new Uint8Array(await file.arrayBuffer());
  const hex = Buffer.from(data.subarray(0, 12)).toString("hex");
  const mediaType = hex.startsWith("89504e470d0a1a0a")
    ? "image/png"
    : hex.startsWith("ffd8ff")
      ? "image/jpeg"
      : hex.startsWith("52494646") && Buffer.from(data.subarray(8, 12)).toString() === "WEBP"
        ? "image/webp"
        : null;
  if (!mediaType || file.type !== mediaType)
    throw new AdminError("Choose a JPEG, PNG or WebP image.");
  return { data, mediaType };
}
