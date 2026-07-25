import { createPublicClient } from "@/lib/supabase/public";

// Fire-and-forget: scheduled via next/server's after() so it never adds
// latency to the page response, and isn't at risk of being cut off once the
// response is sent (unlike a bare unawaited promise in a serverless
// function).
export async function trackProductView(productId: string) {
  const supabase = createPublicClient();
  await supabase.rpc("increment_product_view", { p_product_id: productId });
}
