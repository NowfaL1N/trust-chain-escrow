import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for Next.js API routes.
 * Uses SUPABASE_SERVICE_ROLE_KEY when set (bypasses RLS; required for secure server writes).
 * Falls back to SUPABASE_ANON_KEY only if service role is not set (ensure RLS policies allow needed ops).
 */
export function getSupabaseServer(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (recommended for API routes) or SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
