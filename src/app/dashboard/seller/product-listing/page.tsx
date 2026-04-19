"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { DashboardShell } from "@/components/dashboard-shell";
import { Package, X, ImagePlus } from "lucide-react";
import { MAX_LISTING_PRODUCT_IMAGES } from "@/lib/listing-images";

function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (/\.(jpe?g|png|gif|webp|bmp|heic|heif|tiff?|svg)$/i.test(file.name)) return true;
  // Windows / mobile sometimes omit MIME — still show preview; server validates
  if (file.size > 0 && (!file.type || file.type === "application/octet-stream")) return true;
  return false;
}

type ListingImageSlot = {
  id: string;
  remoteUrl: string | null;
  blobUrl: string | null;
  /** True if last upload attempt failed (preview kept so user still sees the image) */
  uploadFailed?: boolean;
};

function displaySrc(slot: ListingImageSlot): string {
  return slot.remoteUrl ?? slot.blobUrl ?? "";
}

function isPending(slot: ListingImageSlot): boolean {
  return slot.remoteUrl == null && slot.blobUrl != null;
}

export default function SellerProductListingPage() {
  const [listingName, setListingName] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingDesc, setListingDesc] = useState("");
  const [imageSlots, setImageSlots] = useState<ListingImageSlot[]>([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingSaving, setListingSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [listingMessage, setListingMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const revokeBlob = useCallback((slot: ListingImageSlot) => {
    if (slot.blobUrl) {
      try {
        URL.revokeObjectURL(slot.blobUrl);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("escrow_token") : null;
    if (!token) {
      setListingLoading(false);
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    setListingLoading(true);
    setListingMessage(null);

    fetch("/api/seller/listing", {
      headers: { Authorization: `Bearer ${token}` },
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (typeof d.listingProductName === "string") setListingName(d.listingProductName);
        if (d.listingProductPrice != null) setListingPrice(String(d.listingProductPrice));
        if (typeof d.listingProductDescription === "string") setListingDesc(d.listingProductDescription);
        let urls: string[] = [];
        if (Array.isArray(d.listingProductImageUrls)) {
          urls = d.listingProductImageUrls.filter(
            (u: unknown): u is string => typeof u === "string" && u.trim() !== ""
          );
        } else if (typeof d.listingProductImageUrl === "string" && d.listingProductImageUrl.trim()) {
          urls = [d.listingProductImageUrl.trim()];
        }
        setImageSlots((prev) => {
          const locals = prev.filter((s) => s.blobUrl != null && s.remoteUrl == null);
          const serverSlots = urls.map((url) => ({
            id: crypto.randomUUID(),
            remoteUrl: url,
            blobUrl: null as string | null,
          }));
          return [...serverSlots, ...locals].slice(0, MAX_LISTING_PRODUCT_IMAGES);
        });
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setListingMessage({ type: "err", text: "Could not load listing." });
      })
      .finally(() => {
        if (!cancelled) setListingLoading(false);
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  const uploadOneFile = useCallback(async (file: File, slotId: string): Promise<boolean> => {
    const token = localStorage.getItem("escrow_token");
    if (!token) return false;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/listing-product-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        setListingMessage({
          type: "err",
          text: typeof data.error === "string" ? data.error : "Upload failed.",
        });
        setImageSlots((prev) =>
          prev.map((s) => (s.id === slotId ? { ...s, uploadFailed: true } : s))
        );
        return false;
      }
      const url = data.url;
      if (typeof url !== "string" || !url.trim()) {
        setListingMessage({
          type: "err",
          text: "Upload succeeded but no image URL was returned. Check Supabase Storage configuration.",
        });
        setImageSlots((prev) =>
          prev.map((s) => (s.id === slotId ? { ...s, uploadFailed: true } : s))
        );
        return false;
      }
      setImageSlots((prev) =>
        prev.map((s) => {
          if (s.id !== slotId) return s;
          if (s.blobUrl) URL.revokeObjectURL(s.blobUrl);
          return { id: s.id, remoteUrl: url.trim(), blobUrl: null, uploadFailed: false };
        })
      );
      return true;
    } catch {
      setListingMessage({ type: "err", text: "Upload failed (network error)." });
      setImageSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, uploadFailed: true } : s))
      );
      return false;
    }
  }, []);

  const addFiles = async (files: File[]) => {
    const token = localStorage.getItem("escrow_token");
    if (!token) {
      setListingMessage({ type: "err", text: "Sign in to upload." });
      return;
    }
    const remaining = MAX_LISTING_PRODUCT_IMAGES - imageSlots.length;
    if (remaining <= 0) {
      setListingMessage({
        type: "err",
        text: `You can add at most ${MAX_LISTING_PRODUCT_IMAGES} images. Remove some to add more.`,
      });
      return;
    }
    const slice = files.slice(0, remaining);
    if (slice.length === 0) return;

    setImageUploading(true);
    setListingMessage(null);
    let skipped = 0;

    try {
      for (const file of slice) {
        if (!isLikelyImageFile(file)) {
          skipped++;
          continue;
        }
        const id = crypto.randomUUID();
        const blobUrl = URL.createObjectURL(file);

        flushSync(() => {
          setImageSlots((prev) =>
            [...prev, { id, remoteUrl: null, blobUrl, uploadFailed: false }].slice(0, MAX_LISTING_PRODUCT_IMAGES)
          );
        });

        await uploadOneFile(file, id);
      }

      if (skipped > 0 && slice.length > 0) {
        setListingMessage((prev) =>
          prev?.type === "err"
            ? prev
            : {
                type: "err",
                text: "Some files were skipped. Use .jpg, .png, .webp, or .gif when possible.",
              }
        );
      }
    } catch {
      setListingMessage({ type: "err", text: "Upload failed." });
    } finally {
      setImageUploading(false);
    }
  };

  const replaceImageAt = async (index: number, file: File | undefined) => {
    if (!file || !isLikelyImageFile(file)) {
      setListingMessage({ type: "err", text: "Choose a valid image file to replace this photo." });
      return;
    }
    const token = localStorage.getItem("escrow_token");
    if (!token) {
      setListingMessage({ type: "err", text: "Sign in to upload." });
      return;
    }

    const prevSlot = imageSlots[index];
    if (!prevSlot) return;

    setImageUploading(true);
    setListingMessage(null);

    const id = crypto.randomUUID();
    const blobUrl = URL.createObjectURL(file);

    flushSync(() => {
      setImageSlots((slots) => {
        const next = [...slots];
        const old = next[index];
        if (old) revokeBlob(old);
        next[index] = { id, remoteUrl: null, blobUrl, uploadFailed: false };
        return next;
      });
    });

    try {
      await uploadOneFile(file, id);
    } finally {
      setImageUploading(false);
      replaceIndexRef.current = null;
    }
  };

  const saveListing = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("escrow_token") : null;
    if (!token) {
      setListingMessage({ type: "err", text: "Sign in to save." });
      return;
    }
    if (imageSlots.some((s) => isPending(s) && !s.uploadFailed)) {
      setListingMessage({
        type: "err",
        text: "Wait until uploads finish, or remove photos that failed to upload (red border).",
      });
      return;
    }
    const urls = imageSlots
      .map((s) => s.remoteUrl)
      .filter((u): u is string => typeof u === "string" && u.length > 0);
    if (urls.length === 0 && imageSlots.some((s) => s.blobUrl && !s.remoteUrl)) {
      setListingMessage({
        type: "err",
        text: "Fix or remove images that failed to upload before saving, or wait for a successful upload.",
      });
      return;
    }

    setListingSaving(true);
    setListingMessage(null);
    const price = parseFloat(listingPrice);
    try {
      const res = await fetch("/api/seller/listing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          listingProductName: listingName.trim(),
          listingProductPrice: price,
          listingProductDescription: listingDesc.trim(),
          listingProductImageUrls: urls,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setListingMessage({ type: "err", text: typeof data.error === "string" ? data.error : "Save failed." });
        return;
      }
      if (Array.isArray(data.listingProductImageUrls)) {
        const saved: string[] = data.listingProductImageUrls.filter(
          (u: unknown): u is string => typeof u === "string" && u.trim() !== ""
        );
        setImageSlots(
          saved.map((url: string) => ({
            id: crypto.randomUUID(),
            remoteUrl: url,
            blobUrl: null,
            uploadFailed: false,
          }))
        );
      }
      setListingMessage({
        type: "ok",
        text: "Product listing saved. Buyers will see this on the escrow product step.",
      });
    } catch {
      setListingMessage({ type: "err", text: "Save failed." });
    } finally {
      setListingSaving(false);
    }
  };

  const removeImageAt = (index: number) => {
    setImageSlots((prev) => {
      const slot = prev[index];
      if (slot) revokeBlob(slot);
      return prev.filter((_, i) => i !== index);
    });
  };

  const retryUploadAt = async (index: number) => {
    const slot = imageSlots[index];
    if (!slot?.blobUrl || slot.remoteUrl) return;
    setListingMessage(null);
    setImageUploading(true);
    try {
      const res = await fetch(slot.blobUrl);
      const blob = await res.blob();
      const file = new File([blob], "retry.jpg", { type: blob.type || "image/jpeg" });
      await uploadOneFile(file, slot.id);
    } catch {
      setListingMessage({ type: "err", text: "Retry failed. Use Change to pick the file again." });
    } finally {
      setImageUploading(false);
    }
  };

  const openAddPicker = () => {
    replaceIndexRef.current = null;
    addFileInputRef.current?.click();
  };

  const openReplacePicker = (index: number) => {
    replaceIndexRef.current = index;
    replaceFileInputRef.current?.click();
  };

  return (
    <DashboardShell
      role="seller"
      title="Product listing"
      breadcrumbs={[
        { href: "/dashboard/seller", label: "Seller Home" },
        { label: "Product listing" },
      ]}
    >
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Buyers see this product, photos, and unit price when they start an escrow. They choose quantity and delivery
          details only.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your listed product</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Up to {MAX_LISTING_PRODUCT_IMAGES} images (Supabase Storage); URLs are saved on your company record.
              </p>
            </div>
          </div>

          {listingLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Product photos ({imageSlots.length}/{MAX_LISTING_PRODUCT_IMAGES})
                  {imageSlots.some((s) => isPending(s) && !s.uploadFailed) && (
                    <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">Uploading…</span>
                  )}
                </label>

                <input
                  ref={addFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const list = e.target.files;
                    const filesArray = list ? Array.from(list) : [];
                    e.target.value = "";
                    if (filesArray.length > 0) {
                      void addFiles(filesArray);
                    }
                  }}
                />
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    const idx = replaceIndexRef.current;
                    replaceIndexRef.current = null;
                    if (idx != null && file) void replaceImageAt(idx, file);
                  }}
                />

                {imageSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {imageSlots.map((slot, i) => {
                      const src = displaySrc(slot);
                      const pending = isPending(slot) && !slot.uploadFailed;
                      const failed = slot.uploadFailed === true;
                      return (
                        <div
                          key={slot.id}
                          className={`relative aspect-square rounded-lg overflow-hidden border bg-slate-50 dark:bg-slate-800 ${
                            failed
                              ? "border-red-500 ring-2 ring-red-400/50"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          ) : null}
                          {pending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">
                              …
                            </div>
                          )}
                          {failed && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 p-1">
                              <span className="text-[10px] font-bold text-white text-center leading-tight">
                                Upload failed
                              </span>
                              <button
                                type="button"
                                onClick={() => void retryUploadAt(i)}
                                disabled={imageUploading}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-red-700 disabled:opacity-50"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                            <button
                              type="button"
                              disabled={imageUploading}
                              onClick={() => openReplacePicker(i)}
                              className="flex-1 py-1 px-1 text-[10px] font-bold rounded bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow border border-slate-200 dark:border-slate-600 hover:bg-primary hover:text-white disabled:opacity-50"
                            >
                              Change
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageAt(i)}
                            className="absolute top-1 right-1 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 py-10 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No photos yet. Use &quot;Add images&quot; to choose files — a preview appears immediately, then it
                    uploads to storage.
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={imageUploading || imageSlots.length >= MAX_LISTING_PRODUCT_IMAGES}
                    onClick={openAddPicker}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 w-fit"
                  >
                    <ImagePlus className="w-4 h-4" />
                    {imageUploading
                      ? "Uploading…"
                      : imageSlots.length >= MAX_LISTING_PRODUCT_IMAGES
                        ? "Maximum images reached"
                        : "Add images"}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    JPEG, PNG, WebP, or GIF recommended. Max 5MB each. Previews show right after you pick files.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product name</label>
                <input
                  type="text"
                  value={listingName}
                  onChange={(e) => setListingName(e.target.value)}
                  placeholder="e.g. Industrial sensor module"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Price per unit (USD)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description (optional)</label>
                <textarea
                  value={listingDesc}
                  onChange={(e) => setListingDesc(e.target.value)}
                  rows={3}
                  placeholder="Specs, SKU, packaging…"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>
              {listingMessage && (
                <p
                  className={`text-sm ${listingMessage.type === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {listingMessage.text}
                </p>
              )}
              <button
                type="button"
                onClick={saveListing}
                disabled={
                  listingSaving ||
                  imageSlots.some((s) => isPending(s) && !s.uploadFailed) ||
                  imageSlots.some((s) => s.uploadFailed === true && !s.remoteUrl)
                }
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-sm disabled:opacity-70"
              >
                {listingSaving ? "Saving…" : "Save listing"}
              </button>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
