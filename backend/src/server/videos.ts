import { mkdir, unlink, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Video, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AdminError, assertAdmin } from "./admin";
export const MAX_VIDEO_BYTES = 250 * 1024 * 1024;
export function videoDirectory() {
  // Uploaded media is runtime data, never part of the server deployment bundle.
  return resolve(/* turbopackIgnore: true */ process.env.VIDEO_STORAGE_PATH || join(process.cwd(), ".local-uploads", "videos"));
}
export function videoPath(key: string) {
  if (!/^[a-f0-9-]{36}\.(mp4|webm)$/.test(key)) throw new Error("Invalid video key");
  return join(/* turbopackIgnore: true */ videoDirectory(), key);
}
export async function removeVideoFile(key: string | null) {
  if (!key) return;
  await unlink(/* turbopackIgnore: true */ videoPath(key)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") console.warn("A detached video file could not be removed.");
  });
}
export async function uploadVideo(
  actor: { id: string; role: string },
  id: string,
  body: ReadableStream<Uint8Array>,
  mime: string,
  signal?: AbortSignal,
) {
  await assertAdmin(actor);
  if (process.env.RENDER === "true" && !process.env.VIDEO_STORAGE_PATH) {
    throw new AdminError("Video uploads are unavailable until persistent video storage is configured.");
  }
  if (!(await prisma.video.findUnique({ where: { id }, select: { id: true } })))
    throw new AdminError("Video not found.");
  if (!["video/mp4", "video/webm"].includes(mime))
    throw new AdminError("Choose an MP4 or WebM video.");
  const key = `${randomUUID()}.${mime === "video/mp4" ? "mp4" : "webm"}`;
  await mkdir(/* turbopackIgnore: true */ videoDirectory(), { recursive: true });
  let size = 0;
  let prefix = Buffer.alloc(0);
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length;
      if (size > MAX_VIDEO_BYTES)
        return callback(new AdminError("Video must be 250 MB or smaller."));
      if (prefix.length < 16)
        prefix = Buffer.concat([prefix, chunk.subarray(0, 16 - prefix.length)]);
      callback(null, chunk);
    },
  });
  try {
    await pipeline(
      Readable.fromWeb(body as unknown as import("node:stream/web").ReadableStream),
      limiter,
      createWriteStream(/* turbopackIgnore: true */ videoPath(key), { flags: "wx" }),
      { signal },
    );
    const valid =
      mime === "video/mp4"
        ? prefix.subarray(4, 8).toString() === "ftyp"
        : prefix.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if (size < 16 || !valid) throw new AdminError("The file is not a valid MP4 or WebM container.");
    const oldKey = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Video" WHERE "id" = ${id} FOR UPDATE`;
      const old = await tx.video.findUniqueOrThrow({ where: { id } });
      await tx.video.update({ where: { id }, data: { fileKey: key, mimeType: mime, size } });
      return old.fileKey;
    });
    await removeVideoFile(oldKey);
    return { size };
  } catch (error) {
    await removeVideoFile(key);
    throw error;
  }
}
export async function deleteVideo(
  actor: { id: string; role: string },
  id: string,
  confirmation: string,
) {
  await assertAdmin(actor);
  const key = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Video" WHERE "id" = ${id} FOR UPDATE`;
    const video = await tx.video.findUnique({ where: { id } });
    if (!video || confirmation !== video.title)
      throw new AdminError("Type the video title to confirm deletion.");
    await tx.video.delete({ where: { id } });
    return video.fileKey;
  });
  await removeVideoFile(key);
}
export function availableVideos(userId?: string): Prisma.VideoWhereInput {
  return {
    status: "PUBLISHED",
    fileKey: { not: null },
    OR: [
      { audience: "PUBLIC" },
      ...(userId
        ? [
            { audience: "STUDENTS" as const },
            {
              audience: "ENROLLED" as const,
              course: {
                classSchedules: {
                  some: {
                    enrollments: {
                      some: {
                        studentProfile: { userId },
                        status: { in: ["CONFIRMED" as const, "COMPLETED" as const] },
                      },
                    },
                  },
                },
              },
            },
          ]
        : []),
    ],
  };
}
export async function canWatch(video: Video, userId?: string) {
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true },
      })
    : null;
  if (user?.isActive && user.role === "ADMIN") return true;
  return !!(await prisma.video.findFirst({
    where: { AND: [{ id: video.id }, availableVideos(user?.isActive ? user.id : undefined)] },
    select: { id: true },
  }));
}
export function parseVideoRange(header: string | null, size: number) {
  if (!header) return { start: 0, end: size - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  let start: number;
  let end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= size ||
    end < start
  )
    return null;
  return { start, end, partial: true };
}
export async function videoFileInfo(key: string) {
  const path = videoPath(key);
  return { path, size: (await stat(/* turbopackIgnore: true */ path)).size };
}
