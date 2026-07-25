import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { ProductsTable } from "@/features/products/components/products-table";
import { getProductsPage } from "@/features/products/lib/queries";
import { UpgradeBanner } from "@/features/subscription/components/upgrade-banner";
import { getBillingOverview } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const business = await getOwnBusiness();
  if (!business) return null;

  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const [{ products, totalCount, pageSize }, overview] = await Promise.all([
    getProductsPage(business.id, { search: q, page: currentPage }),
    getBillingOverview(business.id),
  ]);

  const maxProducts = overview?.limits.max_products ?? null;
  const atLimit =
    maxProducts !== null && (overview?.productCount ?? 0) >= maxProducts;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">
            Everything in your catalog.
          </p>
        </div>
        <Button
          disabled={atLimit}
          render={
            !atLimit ? <Link href="/dashboard/products/new" /> : undefined
          }
        >
          <Plus />
          New product
        </Button>
      </div>

      {atLimit && (
        <UpgradeBanner
          message={`You've reached your plan's limit of ${maxProducts} products. Upgrade to add more.`}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            {totalCount} product{totalCount === 1 ? "" : "s"}
          </CardTitle>
          <SearchInput placeholder="Search products..." />
        </CardHeader>
        <CardContent className="grid gap-4">
          <ProductsTable
            businessId={business.id}
            currency={business.currency}
            products={products}
          />
          <PaginationControls
            page={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
