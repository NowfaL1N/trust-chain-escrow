-- Multiple product listing images (URLs in JSONB; legacy single URL column still synced)

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS listing_product_image_urls JSONB DEFAULT '[]'::jsonb;

UPDATE public.companies
SET listing_product_image_urls = to_jsonb(ARRAY[listing_product_image_url]::text[])
WHERE listing_product_image_url IS NOT NULL
  AND btrim(listing_product_image_url) <> ''
  AND (
    listing_product_image_urls IS NULL
    OR listing_product_image_urls = '[]'::jsonb
    OR jsonb_array_length(COALESCE(listing_product_image_urls, '[]'::jsonb)) = 0
  );

NOTIFY pgrst, 'reload schema';
