import { getSupabase } from "@/shared/api/supabase";
import { toJpegBlob } from "@/shared/lib/image";

const BUCKET = "report-photos";

export async function uploadReportPhotos(
  files: File[],
  prefix: string,
): Promise<string[] | null> {
  const client = getSupabase();
  if (!client) return null;
  const paths: string[] = [];
  for (const file of files) {
    try {
      const blob = await toJpegBlob(file);
      const path = `${prefix}/${crypto.randomUUID()}.jpg`;
      const { error } = await client.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) return null;
      paths.push(path);
    } catch {
      return null;
    }
  }
  return paths;
}
