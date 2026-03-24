/** Database-aligned types (PostgreSQL / Supabase). API responses still use Mongoose-like field names where applicable. */

export type UserRole = "buyer" | "seller";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCompany {
  id: string;
  company_legal_name: string;
  cin: string;
  gstin: string;
  pan: string;
  business_address: string;
  country: string;
  company_email: string | null;
  website: string | null;
  email_domain: string | null;
  representative_name: string;
  representative_role: string | null;
  phone: string;
  documents: Record<string, unknown> | null;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}
