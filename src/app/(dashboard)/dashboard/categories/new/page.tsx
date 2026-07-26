import type { Metadata } from "next";

import { getOwnBusiness } from "@/features/business/lib/queries";
import { CategoryCreateFlow } from "@/features/categories/components/category-create-flow";
import { UpgradeBanner } from "@/features/subscription/components/upgrade-banner";
import { getBillingOverview } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "New category",
};

export default async function NewCategoryPage() {
  const business = await getOwnBusiness();
  if (!business) return null;

  const overview = await getBillingOverview(business.id);
  const maxCategories = overview?.limits.max_categories ?? null;
  const atLimit =
    maxCategories !== null && (overview?.categoryCount ?? 0) >= maxCategories;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New category</h1>
        <p className="text-muted-foreground text-sm">
          Add a category to organize your products, image included.
        </p>
      </div>

      {atLimit ? (
        <div className="lg:max-w-xl">
          <UpgradeBanner
            message={`You've reached your plan's limit of ${maxCategories} categories. Upgrade to add more.`}
          />
        </div>
      ) : (
        <CategoryCreateFlow businessId={business.id} />
      )}
    </div>
  );
}
