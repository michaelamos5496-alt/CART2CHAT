import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { logError } from "@/lib/logger";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
  ];

  try {
    const supabase = createPublicClient();
    // supabase-js doesn't throw on a query error by default — it returns
    // { data: null, error }. The bare try/catch here never caught that
    // case, so a failed query silently produced a homepage-only sitemap
    // with no indication anything was wrong.
    const { data, error } = await supabase
      .from("businesses")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (error) {
      logError(error, { context: "sitemap" });
    }

    for (const business of data ?? []) {
      entries.push({
        url: `${siteConfig.url}/store/${business.slug}`,
        lastModified: business.updated_at,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch (error) {
    // Build-time DB access issues shouldn't fail the whole build — fall
    // back to just the homepage entry, but log it so it's not invisible.
    logError(error, { context: "sitemap" });
  }

  return entries;
}
