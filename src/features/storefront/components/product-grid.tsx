import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedItem } from "@/features/storefront/components/animated-item";
import { ProductCard } from "@/features/storefront/components/product-card";
import type { StorefrontProduct } from "@/types/catalog";

export function ProductGrid({
  products,
  storeSlug,
  currency,
  emptyTitle = "No products found",
  emptyDescription = "Try a different search or category.",
}: {
  products: StorefrontProduct[];
  storeSlug: string;
  currency: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product, index) => (
        <AnimatedItem key={product.id} index={index}>
          <ProductCard
            product={product}
            storeSlug={storeSlug}
            currency={currency}
          />
        </AnimatedItem>
      ))}
    </div>
  );
}
