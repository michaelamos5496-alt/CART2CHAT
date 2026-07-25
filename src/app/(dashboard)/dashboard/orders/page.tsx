import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchInput } from "@/components/shared/search-input";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { ExportOrdersButton } from "@/features/orders/components/export-orders-button";
import { OrdersStatusFilter } from "@/features/orders/components/orders-status-filter";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { getOrdersPage } from "@/features/orders/lib/queries";
import type { OrderStatus } from "@/types/order";

export const metadata: Metadata = {
  title: "Orders",
};

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;
  const business = await getOwnBusiness();
  if (!business) return null;

  const activeStatus = VALID_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;
  const currentPage = Number(page) > 0 ? Number(page) : 1;

  const { orders, totalCount, pageSize } = await getOrdersPage(business.id, {
    search: q,
    status: activeStatus,
    page: currentPage,
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Orders placed through your storefront.
          </p>
        </div>
        <ExportOrdersButton
          businessId={business.id}
          search={q}
          status={activeStatus}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">
              {totalCount} order{totalCount === 1 ? "" : "s"}
            </CardTitle>
            <SearchInput placeholder="Search by name, phone, or order #..." />
          </div>
          <OrdersStatusFilter activeStatus={activeStatus} searchQuery={q} />
        </CardHeader>
        <CardContent className="grid gap-4">
          <OrdersTable orders={orders} />
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
