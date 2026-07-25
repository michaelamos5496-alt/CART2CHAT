import { createPublicClient } from "@/lib/supabase/public";

// Public, cookie-free reads (anon role) so callers on the storefront and
// signup page stay eligible for static generation / ISR — the same
// reasoning as features/storefront/lib/queries.ts. feature_flags has a
// "select to anon, authenticated using (true)" policy specifically so this
// works.
export async function isFeatureFlagEnabled(key: string): Promise<boolean> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("is_enabled")
    .eq("key", key)
    .maybeSingle();

  return data?.is_enabled ?? false;
}
