import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function createPublicSupabaseClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey);
}

/**
 * Service role client MUST only be used during credentials login handshake
 * to read the `users` table for role/shop_id. Never use for general queries.
 */
export function createServiceRoleSupabaseClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey);
}

import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Public Supabase client.
 *
 * Uses the anon key and is subject to Row Level Security (RLS).
 * This client is safe to use for regular application queries.
 */
export function createPublicSupabaseClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey);
}

/**
 * Service role Supabase client.
 *
 * Uses the service role key and bypasses RLS.
 * CRITICAL: This must ONLY be used during the NextAuth credentials login handshake
 * to look up the app user record for a verified Supabase Auth user.
 */
export function createServiceRoleSupabaseClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey);
}

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

