import { getCurrentUser } from "@backend/lib/access";
import { uploadVideo, MAX_VIDEO_BYTES } from "@backend/server/videos";
import { AdminError } from "@backend/server/admin";
export const runtime = "nodejs";
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = new URL(process.env.AUTH_URL || request.url).origin;
  if (request.headers.get("origin") !== origin)
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN")
    return Response.json({ error: "Administrator access required." }, { status: 403 });
  if (!request.body) return Response.json({ error: "A video file is required." }, { status: 400 });
  if (Number(request.headers.get("content-length")) > MAX_VIDEO_BYTES)
    return Response.json({ error: "Video must be 250 MB or smaller." }, { status: 413 });
  try {
    return Response.json(
      await uploadVideo(
        user,
        (await params).id,
        request.body,
        request.headers.get("content-type")?.split(";")[0] || "",
        request.signal,
      ),
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof AdminError ? error.message : "Upload failed. Please retry." },
      { status: 400 },
    );
  }
}
