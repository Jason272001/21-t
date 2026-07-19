export type UploadResult = {
  url: string;
  key: string;
  provider: "local" | "cloudinary" | "s3";
};

export async function uploadFile(file: File, folder: string): Promise<UploadResult> {
  const key = `${folder}/${Date.now()}-${file.name.replaceAll(" ", "-")}`;
  if (process.env.STORAGE_DRIVER === "cloudinary") {
    return { url: `/uploads/${key}`, key, provider: "cloudinary" };
  }
  return { url: `/uploads/${key}`, key, provider: "local" };
}
