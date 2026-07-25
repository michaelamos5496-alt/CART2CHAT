import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BusinessDetailActions } from "@/features/admin/components/business-detail-actions";
import { PlanOverrideSelect } from "@/features/admin/components/plan-override-select";
import { getBusinessDetail } from "@/features/admin/lib/queries";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Business details",
};

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getBusinessDetail(id);

  if (!detail) notFound();

  const {
    business,
    ownerEmail,
    plan,
    subscriptionStatus,
    productCount,
    orderCount,
    recentOrders,
  } = detail;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          render={<Link href="/admin/businesses" />}
        >
          <ArrowLeft />
          Back to businesses
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {business.name}
              </h1>
              <Badge
                variant={business.is_suspended ? "destructive" : "secondary"}
              >
                {business.is_suspended ? "Suspended" : "Active"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              /{business.slug} &middot; {ownerEmail}
            </p>
          </div>
          <BusinessDetailActions
            businessId={business.id}
            businessName={business.name}
            isSuspended={business.is_suspended}
          />
        </div>
      </div>

      {business.is_suspended && business.suspended_reason && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base">Suspension reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {business.suspended_reason}
            </p>
            {business.suspended_at && (
              <p className="text-muted-foreground mt-1 text-xs">
                Suspended {formatDate(business.suspended_at)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <PlanOverrideSelect businessId={business.id} plan={plan} />
            <Badge variant="outline" className="capitalize">
              {subscriptionStatus}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{productCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{orderCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Placed
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_number}
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
        </CardContent>
      </Card>
    </div>
  );
}
