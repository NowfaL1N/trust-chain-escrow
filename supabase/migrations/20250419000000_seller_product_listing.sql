-- Seller-published product listing (buyers see this; price is not buyer-editable)

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS listing_product_name TEXT,
  ADD COLUMN IF NOT EXISTS listing_product_price NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS listing_product_description TEXT;

NOTIFY pgrst, 'reload schema';
