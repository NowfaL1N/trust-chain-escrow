import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ESCROW_UPLOAD_BUCKET = "escrow-uploads";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

/** Browsers sometimes send non-canonical MIME strings. */
function normalizeContentType(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === "image/jpg" || t === "image/pjpeg") return "image/jpeg";
  return t;
}

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function mimeFromFileName(fileName: string): string | null {
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = m?.[1];
  if (!ext) return null;
  return EXT_TO_MIME[ext] ?? null;
}

/** Resolve a trusted image MIME: from blob.type, else from filename (Windows often sends empty type). */
export function resolveImageContentType(blob: Blob, fileName: string): string | null {
  const t = normalizeContentType(blob.type ?? "");
  if (ALLOWED.has(t)) return t;
  const fromName = mimeFromFileName(fileName);
  return fromName && ALLOWED.has(fromName) ? fromName : null;
}

export function assertImageBlob(blob: Blob, fileName: string): { ok: true; contentType: string } | { ok: false; error: string } {
  if (blob.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller." };
  }
  const contentType = resolveImageContentType(blob, fileName);
  if (!contentType) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, or GIF images are allowed. If the type looks correct, ensure the file has a proper extension (.jpg, .png, etc.).",
    };
  }
  return { ok: true, contentType };
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function uploadListingProductImage(
  supabase: SupabaseClient,
  companyId: string,
  blob: Blob,
  fileName: string
): Promise<{ publicUrl: string; path: string } | { error: string }> {
  const check = assertImageBlob(blob, fileName);
  if (!check.ok) return { error: check.error };
  const path = `listings/${companyId}/${randomUUID()}.${extFromMime(check.contentType)}`;
  const buf = Buffer.from(await blob.arrayBuffer());
  const { data, error } = await supabase.storage.from(ESCROW_UPLOAD_BUCKET).upload(path, buf, {
    contentType: check.contentType,
    upsert: true,
  });
  if (error || !data?.path) {
    console.error("Storage upload listing:", error);
    const hint = error?.message ? ` (${error.message.slice(0, 120)})` : "";
    return {
      error: `Failed to upload image. Ensure the "escrow-uploads" bucket exists in Supabase Storage and the service role key is set.${hint}`,
    };
  }
  const { data: pub } = supabase.storage.from(ESCROW_UPLOAD_BUCKET).getPublicUrl(data.path);
  return { publicUrl: pub.publicUrl, path: data.path };
}

export async function uploadDisputeEvidenceImage(
  supabase: SupabaseClient,
  transactionId: string,
  userId: string,
  blob: Blob,
  fileName: string
): Promise<{ publicUrl: string; path: string } | { error: string }> {
  const check = assertImageBlob(blob, fileName);
  if (!check.ok) return { error: check.error };
  const path = `disputes/${transactionId}/${userId}-${randomUUID()}.${extFromMime(check.contentType)}`;
  const buf = Buffer.from(await blob.arrayBuffer());
  const { data, error } = await supabase.storage.from(ESCROW_UPLOAD_BUCKET).upload(path, buf, {
    contentType: check.contentType,
    upsert: false,
  });
  if (error || !data?.path) {
    console.error("Storage upload dispute:", error);
    const hint = error?.message ? ` (${error.message.slice(0, 120)})` : "";
    return { error: `Failed to upload evidence image.${hint}` };
  }
  const { data: pub } = supabase.storage.from(ESCROW_UPLOAD_BUCKET).getPublicUrl(data.path);
  return { publicUrl: pub.publicUrl, path: data.path };
}
