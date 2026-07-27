import type { Metadata } from "next";

import { getCategories } from "@/features/categories/lib/queries";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { ProductCreateFlow } from "@/features/products/components/product-create-flow";
import { UpgradeBanner } from "@/features/subscription/components/upgrade-banner";
import { getBillingOverview } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "New product",
};

export default async function NewProductPage() {
  const business = await getOwnBusiness();
  if (!business) return null;

  const [categories, overview] = await Promise.all([
    getCategories(business.id),
    getBillingOverview(business.id),
  ]);

  const maxProducts = overview?.limits.max_products ?? null;
  const atLimit =
    maxProducts !== null && (overview?.productCount ?? 0) >= maxProducts;
  const isCancelled = overview?.subscription.status === "cancelled";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
        <p className="text-muted-foreground text-sm">
          Add a product to your catalog, photos included.
        </p>
      </div>

      {isCancelled ? (
        <div className="lg:max-w-2xl">
          <UpgradeBanner
            message="Your subscription is cancelled — resubscribe to add new products."
            ctaLabel="View billing"
          />
        </div>
      ) : atLimit ? (
        <div className="lg:max-w-2xl">
          <UpgradeBanner
            message={`You've reached your plan's limit of ${maxProducts} products. Upgrade to add more.`}
          />
        </div>
      ) : (
        <ProductCreateFlow businessId={business.id} categories={categories} />
      )}
    </div>
  );
}
