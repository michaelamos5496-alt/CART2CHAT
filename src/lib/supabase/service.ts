import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

// Service-role client: bypasses RLS entirely and can call the Admin Auth
// API (auth.admin.*). Only ever import this from server actions/route
// handlers that need privileged access the user's own session can't grant
// (e.g. deleting the auth.users row itself) — never expose this key to the
// client. `server-only` makes accidentally importing it from a Client
// Component a build error instead of a leaked secret.
export function createServiceClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured — this action requires it.",
    );
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
