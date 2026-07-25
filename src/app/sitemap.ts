import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
  ];

  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("businesses")
      .select("slug, updated_at")
      .eq("is_active", true);

    for (const business of data ?? []) {
      entries.push({
        url: `${siteConfig.url}/store/${business.slug}`,
        lastModified: business.updated_at,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch {
    // Build-time DB access issues shouldn't fail the whole build — fall
    // back to just the homepage entry.
  }

  return entries;
}
