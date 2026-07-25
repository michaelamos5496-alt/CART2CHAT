import { createPublicClient } from "@/lib/supabase/public";
import { logError } from "@/lib/logger";

// Public, cookie-free reads (anon role) so callers on the storefront and
// signup page stay eligible for static generation / ISR — the same
// reasoning as features/storefront/lib/queries.ts. feature_flags has a
// "select to anon, authenticated using (true)" policy specifically so this
// works.
export async function isFeatureFlagEnabled(key: string): Promise<boolean> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("is_enabled")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    // Previously swallowed silently, which made a fetch failure here
    // indistinguishable from a real "flag is off" — surfacing it is the
    // only way to tell the two apart in production logs.
    logError(error, { context: "isFeatureFlagEnabled", key });
  }

  return data?.is_enabled ?? false;
}
