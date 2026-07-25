import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

// A plain, cookie-free Supabase client for fully public, unauthenticated
// reads (the storefront). Unlike lib/supabase/server.ts, this never calls
// next/headers' cookies(), so pages that only use this client stay eligible
// for static generation / ISR instead of being forced fully dynamic.
// It authenticates as the `anon` role, same as a real visitor, so it's
// bound by the exact same RLS policies (active businesses, available +
// active products only).
export function createPublicClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );
}
