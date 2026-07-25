import type { Metadata } from "next";
import { DollarSign, Package, ShoppingCart, Timer } from "lucide-react";

import { MotionSection } from "@/components/layout/motion-section";
import { getDashboardStats } from "@/features/dashboard/lib/queries";
import { PopularProductsCard } from "@/features/dashboard/components/popular-products-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentOrdersCard } from "@/features/dashboard/components/recent-orders-card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { getRecentOrders } from "@/features/orders/lib/queries";
import { getPopularProducts } from "@/features/products/lib/queries";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const business = await getOwnBusiness();

  if (!business) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-lg font-semibold">Setting up your storefront…</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          This usually takes a few seconds. Refresh the page if it doesn&apos;t
          appear shortly.
        </p>
      </div>
    );
  }

  const [stats, recentOrders, popularProducts] = await Promise.all([
    getDashboardStats(business.id),
    getRecentOrders(business.id, 5),
    getPopularProducts(business.id, 5),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {business.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      <MotionSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total revenue"
            value={formatCurrency(stats.totalRevenue, business.currency)}
            icon={DollarSign}
          />
          <StatCard
            label="Total orders"
            value={stats.totalOrders.toString()}
            icon={ShoppingCart}
          />
          <StatCard
            label="Pending orders"
            value={stats.pendingOrders.toString()}
            icon={Timer}
          />
          <StatCard
            label="Products"
            value={stats.totalProducts.toString()}
            icon={Package}
          />
        </div>
      </MotionSection>

      <div className="grid gap-4 lg:grid-cols-3">
        <MotionSection delay={0.05} className="lg:col-span-2">
          <RecentOrdersCard orders={recentOrders} />
        </MotionSection>
        <MotionSection delay={0.1} className="grid gap-4">
          <PopularProductsCard products={popularProducts} />
          <QuickActions />
        </MotionSection>
      </div>
    </div>
  );
}
