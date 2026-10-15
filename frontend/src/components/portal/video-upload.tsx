"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { managementCopy } from "@/lib/management-copy";
import type { Locale } from "@/lib/i18n";
export function VideoUpload({ id, locale }: { id: string; locale: Locale }) {
  const t = managementCopy(locale);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="my-8 max-w-4xl rounded-xl border border-line/10 bg-surface p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const file = new FormData(event.currentTarget).get("video");
        if (!(file instanceof File) || !file.size) {
          setMessage("Choose a video file.");
          return;
        }
        if (file.size > 250 * 1024 * 1024) {
          setMessage(t.uploadHint);
          return;
        }
        setPending(true);
        setMessage("");
        try {
          const response = await fetch(`/api/admin/videos/${id}/file`, {
            method: "PUT",
            headers: {
              "Content-Type":
                file.type ||
                (file.name.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"),
            },
            body: file,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          setMessage(t.uploaded);
          router.refresh();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Upload failed. Please retry.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="grid gap-3 font-semibold">
        {t.upload}
        <input
          name="video"
          type="file"
          accept="video/mp4,video/webm,.mp4,.webm"
          required
          disabled={pending}
          className="max-w-full rounded-lg border border-line/20 p-3 text-sm"
        />
      </label>
      <p className="mt-3 text-sm text-muted">{t.uploadHint}</p>
      <button
        disabled={pending}
        className="mt-5 rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
      >
        {pending ? t.uploading : t.upload}
      </button>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
