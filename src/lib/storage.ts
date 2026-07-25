import { createPublicClient } from "@/lib/supabase/public";

export const BUCKETS = {
  logos: "logos",
  productImages: "product-images",
  categoryImages: "category-images",
} as const;

// getPublicUrl builds a URL string locally — no network call — so this is
// safe to use directly in Server Components without needing a "use client"
// boundary just to resolve an image path.
export function getPublicImageUrl(
  bucket: (typeof BUCKETS)[keyof typeof BUCKETS],
  path: string,
) {
  return createPublicClient().storage.from(bucket).getPublicUrl(path).data
    .publicUrl;
}
