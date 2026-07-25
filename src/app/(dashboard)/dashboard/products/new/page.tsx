import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCategories } from "@/features/categories/lib/queries";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { ProductForm } from "@/features/products/components/product-form";
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

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
        <p className="text-muted-foreground text-sm">
          Add a product to your catalog. You can add photos after saving.
        </p>
      </div>

      {atLimit ? (
        <div className="lg:max-w-2xl">
          <UpgradeBanner
            message={`You've reached your plan's limit of ${maxProducts} products. Upgrade to add more.`}
          />
        </div>
      ) : (
        <Card className="lg:max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Product details</CardTitle>
            <CardDescription>
              Required to list this product on your storefront.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm businessId={business.id} categories={categories} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
