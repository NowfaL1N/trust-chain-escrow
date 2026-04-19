-- ============================================================================
-- FIX: "Could not find the table 'public.companies' in the schema cache"
-- ============================================================================
-- In Supabase: Dashboard → SQL → New query → paste this ENTIRE file → Run
-- Then try Register again. Ensure .env.local has correct SUPABASE_* and JWT_SECRET.
-- ============================================================================

-- TrustChain B2B Escrow — PostgreSQL schema for Supabase

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_legal_name TEXT NOT NULL,
  cin TEXT,
  gstin TEXT, 
  pan TEXT,
  business_address TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  company_email TEXT,
  website TEXT,
  email_domain TEXT,
  representative_name TEXT NOT NULL,
  representative_role TEXT,
  phone TEXT NOT NULL,
  -- New country-based identifier fields
  lei TEXT,
  lei_verified BOOLEAN DEFAULT FALSE,
  identifier_type TEXT,
  primary_identifier TEXT,
  secondary_identifier TEXT,
  documents JSONB DEFAULT '{}'::jsonb,
  listing_product_name TEXT,
  listing_product_price NUMERIC(14, 2),
  listing_product_description TEXT,
  listing_product_image_url TEXT,
  listing_product_image_urls JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listing columns for existing databases (CREATE TABLE IF NOT EXISTS does not add new columns)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS listing_product_name TEXT,
  ADD COLUMN IF NOT EXISTS listing_product_price NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS listing_product_description TEXT,
  ADD COLUMN IF NOT EXISTS listing_product_image_url TEXT,
  ADD COLUMN IF NOT EXISTS listing_product_image_urls JSONB DEFAULT '[]'::jsonb;

-- Storage bucket for listing + dispute images (run once per project)
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

DROP POLICY IF EXISTS "Public read escrow-uploads" ON storage.objects;
CREATE POLICY "Public read escrow-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escrow-uploads');

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_companies_lei ON public.companies (lei) WHERE lei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_primary_identifier ON public.companies (primary_identifier);

-- Update existing companies for backward compatibility
UPDATE public.companies 
SET identifier_type = country,
    primary_identifier = COALESCE(gstin, primary_identifier)
WHERE identifier_type IS NULL;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users (company_id);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  buyer_company TEXT NOT NULL,
  seller_company TEXT NOT NULL,
  buyer_token TEXT,
  seller_token TEXT,
  product JSONB,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  funded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dispute_deadline TIMESTAMPTZ,
  auto_release_deadline TIMESTAMPTZ,
  dispute JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions (buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.transactions (seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions (created_at DESC);

CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email_created
  ON public.password_reset_otps (email, created_at DESC);

NOTIFY pgrst, 'reload schema';
