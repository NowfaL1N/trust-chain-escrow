# 🔧 Database Migration Required

The error "Server error. Check that the database is running" occurs because the database schema needs to be updated with the new country identifier fields.

## ⚡ Quick Fix

### Option 1: Supabase SQL Editor (Recommended)
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**  
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Add country-based business identifier fields to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS lei TEXT,
ADD COLUMN IF NOT EXISTS lei_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identifier_type TEXT,
ADD COLUMN IF NOT EXISTS primary_identifier TEXT,
ADD COLUMN IF NOT EXISTS secondary_identifier TEXT;

-- Make legacy fields optional (remove UNIQUE constraints temporarily)
ALTER TABLE public.companies 
ALTER COLUMN cin DROP NOT NULL,
ALTER COLUMN gstin DROP NOT NULL, 
ALTER COLUMN pan DROP NOT NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_companies_lei ON public.companies (lei) WHERE lei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_primary_identifier ON public.companies (primary_identifier);

-- Update existing companies for backward compatibility
UPDATE public.companies 
SET identifier_type = country,
    primary_identifier = COALESCE(gstin, primary_identifier)
WHERE identifier_type IS NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
```

5. Click **Run** to execute
6. Try logging in again

### Option 2: Complete Schema Reset (If needed)
If the above doesn't work, run the complete schema from `supabase/RUN_IN_SQL_EDITOR.sql` which includes all tables with the updated structure.

## ✅ Verification
After running the migration:
1. The login error should disappear
2. Registration will work with the new country identifier fields
3. Existing users and companies will continue to work normally

## 🚨 Note
This migration is backward compatible and won't break existing data or functionality.