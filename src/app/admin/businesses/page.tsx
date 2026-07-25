import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { BusinessesTable } from "@/features/admin/components/businesses-table";
import { getBusinessesPage } from "@/features/admin/lib/queries";

export const metadata: Metadata = {
  title: "Businesses",
};

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Number(page) > 0 ? Number(page) : 1;

  const { businesses, totalCount, pageSize } = await getBusinessesPage({
    search: q,
    page: currentPage,
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Businesses</h1>
        <p className="text-muted-foreground text-sm">
          Every business on the platform.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            {totalCount} business{totalCount === 1 ? "" : "es"}
          </CardTitle>
          <SearchInput placeholder="Search by name or slug..." />
        </CardHeader>
        <CardContent className="grid gap-4">
          <BusinessesTable businesses={businesses} />
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
