/** Maximum product photos per seller listing (buyer-visible gallery). */
export const MAX_LISTING_PRODUCT_IMAGES = 15;

type CompanyImageRow = {
  listing_product_image_urls?: unknown;
  listing_product_image_url?: string | null;
};

export function parseListingImageUrlsFromCompany(row: CompanyImageRow): string[] {
  const raw = row.listing_product_image_urls;
  let urls: string[] = [];
  if (Array.isArray(raw)) {
    urls = raw
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim());
  }
  if (urls.length === 0) {
    const legacy = (row.listing_product_image_url ?? "").trim();
    if (legacy) urls = [legacy];
  }
  return urls.slice(0, MAX_LISTING_PRODUCT_IMAGES);
}

export function validateListingProductImageUrlsInput(
  input: unknown
): { ok: true; urls: string[] } | { ok: false; error: string } {
  if (input === null || input === undefined) {
    return { ok: true, urls: [] };
  }
  if (!Array.isArray(input)) {
    return { ok: false, error: "listingProductImageUrls must be an array of URL strings" };
  }
  const urls = input
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    .map((u) => u.trim());
  if (urls.length > MAX_LISTING_PRODUCT_IMAGES) {
    return {
      ok: false,
      error: `At most ${MAX_LISTING_PRODUCT_IMAGES} product images are allowed`,
    };
  }
  return { ok: true, urls };
}
