import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public (anon) Supabase client.
 *
 * Use this for all normal application data access so that RLS is enforced.
 */
export function createPublicSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing required client-side environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey);
}

/**
 * Service-role Supabase client.
 *
 * SECURITY: This must only be used during the NextAuth credentials login handshake
 * to read the `users` row for the authenticated user (bypassing RLS).
 *
 * This MUST NOT be used for general data access.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing required server-side environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey);
}

