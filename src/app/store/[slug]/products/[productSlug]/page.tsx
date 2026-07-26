import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { ArrowLeft } from "lucide-react";

import { MotionSection } from "@/components/layout/motion-section";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { AddToCartSection } from "@/features/cart/components/add-to-cart-section";
import { ProductGallery } from "@/features/storefront/components/product-gallery";
import {
  getStorefrontBusiness,
  getStorefrontProduct,
} from "@/features/storefront/lib/queries";
import { trackProductView } from "@/features/storefront/lib/track-view";
import { formatCurrency } from "@/lib/format";
import { toJsonLd } from "@/lib/json-ld";
import { BUCKETS, getPublicImageUrl } from "@/lib/storage";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const business = await getStorefrontBusiness(slug);
  if (!business) return {};

  const product = await getStorefrontProduct(business.id, productSlug);
  if (!product) return {};

  const description =
    product.description ?? `${product.name} at ${business.name}.`;
  const image = product.images[0]
    ? getPublicImageUrl(BUCKETS.productImages, product.images[0].storage_path)
    : undefined;

  return {
    title: `${product.name} | ${business.name}`,
    description,
    alternates: {
      canonical: `/store/${business.slug}/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const business = await getStorefrontBusiness(slug);
  if (!business) {
    notFound();
  }

  const product = await getStorefrontProduct(business.id, productSlug);
  if (!product) {
    notFound();
  }

  after(() => trackProductView(product.id));

  const imageUrls = product.images.map((image) =>
    getPublicImageUrl(BUCKETS.productImages, image.storage_path),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: business.currency,
      availability: product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/store/${business.slug}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <Link
        href={`/store/${business.slug}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to {business.name}
      </Link>

      <MotionSection>
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={imageUrls} productName={product.name} />

          <div className="grid gap-4">
            <div className="grid gap-1">
              {product.category && (
                <Link
                  href={`/store/${business.slug}?category=${product.category.slug}`}
                  className="text-muted-foreground w-fit text-sm hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl font-semibold tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-semibold">
                {formatCurrency(product.price, business.currency)}
              </span>
              {product.is_featured && <Badge>Featured</Badge>}
              <Badge variant={product.is_available ? "secondary" : "outline"}>
                {product.is_available ? "In stock" : "Out of stock"}
              </Badge>
            </div>

            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="pt-2">
              <AddToCartSection
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                imagePath={product.images[0]?.storage_path ?? null}
                isAvailable={product.is_available}
                options={product.options}
              />
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  );
}
