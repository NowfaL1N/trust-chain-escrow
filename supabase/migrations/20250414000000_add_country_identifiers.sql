-- Add country-based business identifier fields to companies table
-- This extends the existing structure without breaking current functionality

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS lei TEXT,
ADD COLUMN IF NOT EXISTS lei_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identifier_type TEXT,
ADD COLUMN IF NOT EXISTS primary_identifier TEXT,
ADD COLUMN IF NOT EXISTS secondary_identifier TEXT;

-- Create index for LEI lookups
CREATE INDEX IF NOT EXISTS idx_companies_lei ON public.companies (lei) WHERE lei IS NOT NULL;

-- Create index for primary identifier lookups  
CREATE INDEX IF NOT EXISTS idx_companies_primary_identifier ON public.companies (primary_identifier);

-- Update the existing companies to have identifier_type for backward compatibility
UPDATE public.companies 
SET identifier_type = 'India',
    primary_identifier = gstin
WHERE identifier_type IS NULL AND gstin IS NOT NULL;

-- Tell PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';