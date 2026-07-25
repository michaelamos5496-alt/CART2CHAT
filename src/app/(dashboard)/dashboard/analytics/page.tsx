import type { Metadata } from "next";
import {
  BarChart3,
  DollarSign,
  Eye,
  Flame,
  Repeat,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getOwnBusiness } from "@/features/business/lib/queries";
import {
  getAnalyticsOverview,
  getMostViewedProducts,
  getOrdersByDay,
  getOrdersByMonth,
} from "@/features/analytics/lib/queries";
import { OrdersBarChart } from "@/features/analytics/components/orders-bar-chart-lazy";
import { ProductRankChart } from "@/features/analytics/components/product-rank-chart-lazy";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getOrderStatusBreakdown } from "@/features/orders/lib/queries";
import { getPopularProducts } from "@/features/products/lib/queries";
import { LockedOverlay } from "@/features/subscription/components/locked-overlay";
import { planHasFeature } from "@/features/subscription/lib/flags";
import { getBillingOverview } from "@/features/subscription/lib/queries";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus } from "@/types/order";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const business = await getOwnBusiness();
  if (!business) return null;

  const [
    overview,
    ordersByDay,
    ordersByMonth,
    mostOrdered,
    mostViewed,
    breakdown,
    billing,
  ] = await Promise.all([
    getAnalyticsOverview(business.id),
    getOrdersByDay(business.id),
    getOrdersByMonth(business.id),
    getPopularProducts(business.id),
    getMostViewedProducts(business.id),
    getOrderStatusBreakdown(business.id),
    getBillingOverview(business.id),
  ]);

  const hasFullAnalytics = billing
    ? planHasFeature(billing.limits, "full_analytics")
    : false;

  const mostOrderedRanked = mostOrdered.map((product) => ({
    productId: product.productId,
    name: product.name,
    value: product.quantitySold,
  }));

  const maxStatusCount = Math.max(...breakdown.map((b) => b.count), 1);

  const customerStats = (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Total customers"
        value={overview.totalCustomers.toString()}
        icon={Users}
      />
      <StatCard
        label="Returning customers"
        value={overview.returningCustomers.toString()}
        icon={Repeat}
      />
    </div>
  );

  const chartsAndBreakdown = (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by day</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersBarChart
              data={ordersByDay.map((d) => ({
                label: d.label,
                count: d.count,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by month</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersBarChart
              data={ordersByMonth.map((d) => ({
                label: d.label,
                count: d.count,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most ordered products</CardTitle>
          </CardHeader>
          <CardContent>
            {mostOrderedRanked.length === 0 ? (
              <EmptyState
                icon={Flame}
                title="No sales yet"
                description="Your best-selling products will be ranked here once orders come in."
              />
            ) : (
              <ProductRankChart data={mostOrderedRanked} valueLabel="Sold" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most viewed products</CardTitle>
          </CardHeader>
          <CardContent>
            {mostViewed.length === 0 ? (
              <EmptyState
                icon={Eye}
                title="No views yet"
                description="Your most-viewed products will be ranked here once customers browse your storefront."
              />
            ) : (
              <ProductRankChart data={mostViewed} valueLabel="Views" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders by status</CardTitle>
        </CardHeader>
        <CardContent>
          {breakdown.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No orders yet"
              description="A breakdown of your orders by status will appear here."
            />
          ) : (
            <div className="grid gap-4">
              {breakdown.map((row) => (
                <div key={row.status} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <OrderStatusBadge status={row.status as OrderStatus} />
                    <span className="text-muted-foreground">
                      {row.count} order{row.count === 1 ? "" : "s"} ·{" "}
                      {formatCurrency(row.revenue, business.currency)}
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${(row.count / maxStatusCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          How your storefront is performing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total orders"
          value={overview.totalOrders.toString()}
          icon={ShoppingCart}
        />
        <StatCard
          label="Estimated revenue"
          value={formatCurrency(overview.estimatedRevenue, business.currency)}
          icon={DollarSign}
        />
        <div className="sm:col-span-2 lg:col-span-2">
          {hasFullAnalytics ? (
            customerStats
          ) : (
            <LockedOverlay message="Upgrade your plan to see customer analytics">
              {customerStats}
            </LockedOverlay>
          )}
        </div>
      </div>

      {hasFullAnalytics ? (
        chartsAndBreakdown
      ) : (
        <LockedOverlay message="Upgrade your plan to unlock full analytics — trends, top products, and order breakdowns">
          {chartsAndBreakdown}
        </LockedOverlay>
      )}
    </div>
  );
}
