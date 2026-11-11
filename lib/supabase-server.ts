import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase instance (bypasses RLS -- admin only)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Named factory for use in Server Components and API routes
// Returns a fresh client each call (safe for concurrent requests)
export function createServerClient() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

// Alias used by some routes -- identical to createServerClient
// (service role already bypasses RLS, no separate "admin" auth needed)
export function createAdminClient() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
