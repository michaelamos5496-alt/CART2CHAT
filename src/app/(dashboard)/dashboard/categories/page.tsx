import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/shared/search-input";
import { CategoriesList } from "@/features/categories/components/categories-list";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { getCategoriesWithProductCount } from "@/features/categories/lib/queries";
import { UpgradeBanner } from "@/features/subscription/components/upgrade-banner";
import { getBillingOverview } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const business = await getOwnBusiness();
  if (!business) return null;

  const [categories, overview] = await Promise.all([
    getCategoriesWithProductCount(business.id, q),
    getBillingOverview(business.id),
  ]);

  const maxCategories = overview?.limits.max_categories ?? null;
  const atLimit =
    maxCategories !== null && (overview?.categoryCount ?? 0) >= maxCategories;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Groups products in your storefront.
          </p>
        </div>
        <Button
          disabled={atLimit}
          render={
            !atLimit ? <Link href="/dashboard/categories/new" /> : undefined
          }
        >
          <Plus />
          New category
        </Button>
      </div>

      {atLimit && (
        <UpgradeBanner
          message={`You've reached your plan's limit of ${maxCategories} categories. Upgrade to add more.`}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </CardTitle>
          <SearchInput placeholder="Search categories..." />
        </CardHeader>
        <CardContent className="grid gap-3">
          <CategoriesList categories={categories} draggable={!q} />
          {!q && categories.length > 1 && (
            <p className="text-muted-foreground text-xs">
              Drag categories by the handle to change their order on your
              storefront.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
