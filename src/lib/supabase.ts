import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Public (anon) Supabase client.
 *
 * Use this for all normal application data access so that RLS is enforced.
 */
export function createPublicSupabaseClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey);
}

/**
 * Service-role Supabase client.
 *
 * SECURITY: This must only be used during the NextAuth credentials login
 * handshake to read the `users` row for the authenticated user (bypassing RLS).
 * Never use this for general data access.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey);
}

