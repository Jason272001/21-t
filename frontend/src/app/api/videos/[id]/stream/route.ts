import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { getCurrentUser } from "@backend/lib/access";
import { prisma } from "@backend/lib/prisma";
import { canWatch, parseVideoRange, videoFileInfo } from "@backend/server/videos";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function respond(request: Request, id: string, head = false) {
  const user = await getCurrentUser();
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video?.fileKey || !(await canWatch(video, user?.id)))
    return new Response("Not found", { status: 404 });
  let file;
  try {
    file = await videoFileInfo(video.fileKey);
  } catch {
    return new Response("Video file unavailable", { status: 404 });
  }
  const range = parseVideoRange(request.headers.get("range"), file.size);
  if (!range)
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${file.size}` },
    });
  const headers: Record<string, string> = {
    "Content-Type": video.mimeType || "video/mp4",
    "Content-Length": String(range.end - range.start + 1),
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (range.partial) headers["Content-Range"] = `bytes ${range.start}-${range.end}/${file.size}`;
  const body = head
    ? null
    : (Readable.toWeb(
        createReadStream(/* turbopackIgnore: true */ file.path, { start: range.start, end: range.end }),
      ) as ReadableStream);
  return new Response(body, { status: range.partial ? 206 : 200, headers });
}
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return respond(request, (await params).id);
}
export async function HEAD(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return respond(request, (await params).id, true);
}
