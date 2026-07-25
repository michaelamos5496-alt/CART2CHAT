import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { getAllOrdersPage } from "@/features/admin/lib/queries";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) > 0 ? Number(page) : 1;

  const { orders, totalCount, pageSize } = await getAllOrdersPage({
    page: currentPage,
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Every order placed across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {totalCount} order{totalCount === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Orders placed on any storefront will show up here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Placed
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_number}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/store/${order.business_slug}`}
                          className="hover:underline"
                        >
                          {order.business_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.total_amount, order.currency)}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
