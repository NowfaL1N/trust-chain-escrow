-- Product listing image URL (file bytes live in Supabase Storage; URL stored on company row)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS listing_product_image_url TEXT;

-- Public bucket for listing photos and dispute evidence (5MB max, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'escrow-uploads',
  'escrow-uploads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read of objects in this bucket (uploads use service role on server)
DROP POLICY IF EXISTS "Public read escrow-uploads" ON storage.objects;
CREATE POLICY "Public read escrow-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escrow-uploads');

NOTIFY pgrst, 'reload schema';
