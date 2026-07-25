import { AnimatedItem } from "@/features/storefront/components/animated-item";
import { ProductCard } from "@/features/storefront/components/product-card";
import type { StorefrontProduct } from "@/types/catalog";

export function FeaturedProducts({
  products,
  storeSlug,
  currency,
}: {
  products: StorefrontProduct[];
  storeSlug: string;
  currency: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold tracking-tight">Featured</h2>
      <div className="-mx-4 flex snap-x [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {products.map((product, index) => (
          <AnimatedItem
            key={product.id}
            index={index}
            className="w-40 shrink-0 snap-start sm:w-auto"
          >
            <ProductCard
              product={product}
              storeSlug={storeSlug}
              currency={currency}
            />
          </AnimatedItem>
        ))}
      </div>
    </section>
  );
}
