import type { Metadata } from "next";

import { MotionSection } from "@/components/layout/motion-section";
import { siteConfig } from "@/config/site";
import { CategoryFilterPills } from "@/features/storefront/components/category-filter-pills";
import { FeaturedProducts } from "@/features/storefront/components/featured-products";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { StoreHero } from "@/features/storefront/components/store-hero";
import {
  getFeaturedProducts,
  getStorefrontBusiness,
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/features/storefront/lib/queries";
import { toJsonLd } from "@/lib/json-ld";
import { BUCKETS, getPublicImageUrl } from "@/lib/storage";
import { createPublicClient } from "@/lib/supabase/public";

// New slugs (created after the last build/revalidation) still render fine
// on-demand — they just aren't part of the pre-rendered set.
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("businesses")
      .select("slug")
      .eq("is_active", true);

    return (data ?? []).map((business) => ({ slug: business.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getStorefrontBusiness(slug);
  if (!business) return {};

  const description =
    business.description ?? `Shop ${business.name} on ${siteConfig.name}.`;
  const ogImagePath = business.banner_path ?? business.logo_path;
  const ogImage = ogImagePath
    ? getPublicImageUrl(BUCKETS.logos, ogImagePath)
    : undefined;

  return {
    title: business.name,
    description,
    alternates: { canonical: `/store/${business.slug}` },
    openGraph: {
      title: business.name,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: business.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { slug } = await params;
  const { q, category } = await searchParams;

  const business = await getStorefrontBusiness(slug);
  if (!business) return null;

  const categories = await getStorefrontCategories(business.id);
  const activeCategory = category
    ? categories.find((c) => c.slug === category)
    : undefined;
  const isFiltering = Boolean(q || activeCategory);

  const [featured, products] = await Promise.all([
    isFiltering ? Promise.resolve([]) : getFeaturedProducts(business.id),
    getStorefrontProducts(business.id, {
      search: q,
      categoryId: activeCategory?.id,
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: business.name,
    description: business.description ?? undefined,
    url: `${siteConfig.url}/store/${business.slug}`,
    image: business.logo_path
      ? getPublicImageUrl(BUCKETS.logos, business.logo_path)
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <MotionSection>
        <StoreHero business={business} />
      </MotionSection>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <CategoryFilterPills
          categories={categories}
          basePath={`/store/${business.slug}`}
          activeCategorySlug={activeCategory?.slug}
          searchQuery={q}
          themeColor={business.theme_color}
        />

        {!isFiltering && (
          <FeaturedProducts
            products={featured}
            storeSlug={business.slug}
            currency={business.currency}
          />
        )}

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {activeCategory ? activeCategory.name : "All products"}
          </h2>
          <ProductGrid
            products={products}
            storeSlug={business.slug}
            currency={business.currency}
            emptyTitle={q ? "No matches" : "No products yet"}
            emptyDescription={
              q
                ? `No products match "${q}".`
                : "This store hasn't added any products yet."
            }
          />
        </section>
      </div>
    </>
  );
}
