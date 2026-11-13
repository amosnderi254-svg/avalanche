import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Do NOT create any Supabase client at module level.
// Module-level createClient() runs during Next.js build analysis even
// with force-dynamic, and throws when env vars are undefined at build time.
// All client creation must be inside functions so it only runs at request time.

// Named factory for use in Server Components and API routes
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Alias used by admin routes -- service role already bypasses RLS
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Use this instead of importing supabaseAdmin directly
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
