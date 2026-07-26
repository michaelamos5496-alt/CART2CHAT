import type { Metadata } from "next";
import {
  DollarSign,
  Package,
  ShieldX,
  ShoppingCart,
  Store,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersBarChart } from "@/features/analytics/components/orders-bar-chart-lazy";
import {
  getBusinessGrowthByMonth,
  getPlatformOverview,
} from "@/features/admin/lib/queries";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin overview",
};

export default async function AdminOverviewPage() {
  const [overview, growth] = await Promise.all([
    getPlatformOverview(),
    getBusinessGrowthByMonth(),
  ]);

  const maxPlanCount = Math.max(
    ...overview.planDistribution.map((p) => p.count),
    1,
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Platform overview
        </h1>
        <p className="text-muted-foreground text-sm">
          How Cart-2-Chat is doing across every business.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total businesses"
          value={overview.totalBusinesses.toString()}
          icon={Store}
        />
        <StatCard
          label="Suspended"
          value={overview.suspendedBusinesses.toString()}
          icon={ShieldX}
        />
        <StatCard
          label="Total orders"
          value={overview.totalOrders.toString()}
          icon={ShoppingCart}
        />
        <StatCard
          label="Total products"
          value={overview.totalProducts.toString()}
          icon={Package}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business growth</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersBarChart
              data={growth.map((g) => ({ label: g.label, count: g.count }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by currency</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.revenueByCurrency.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No revenue recorded yet.
              </p>
            ) : (
              <div className="grid gap-3">
                {overview.revenueByCurrency.map((row) => (
                  <div
                    key={row.currency}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-muted-foreground size-4" />
                      <span className="font-medium">{row.currency}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(row.total, row.currency)}
                    </span>
                  </div>
                ))}
                <p className="text-muted-foreground text-xs">
                  Shown per currency — businesses price in different currencies,
                  so totals aren&apos;t combined into one figure.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan distribution</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {overview.planDistribution.map((row) => (
            <div key={row.plan} className="grid gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <Badge variant="secondary">{PLAN_META[row.plan].label}</Badge>
                <span className="text-muted-foreground">
                  {row.count} business{row.count === 1 ? "" : "es"}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${(row.count / maxPlanCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
