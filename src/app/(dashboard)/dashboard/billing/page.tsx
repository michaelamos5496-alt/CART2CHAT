import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import { PlanComparisonGrid } from "@/features/subscription/components/plan-comparison-grid";
import { UsageMeter } from "@/features/subscription/components/usage-meter";
import { getBillingOverview } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const business = await getOwnBusiness();
  if (!business) return null;

  const overview = await getBillingOverview(business.id);
  if (!overview) return null;

  const { subscription, limits, allPlans, productCount, categoryCount } =
    overview;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage your plan and see what&apos;s included.
        </p>
      </div>

      <Card className="lg:max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            You&apos;re on the {PLAN_META[subscription.plan].label} plan
          </CardTitle>
          <CardDescription>
            Current usage against your plan&apos;s limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <UsageMeter
            label="Products"
            used={productCount}
            limit={limits.max_products}
          />
          <UsageMeter
            label="Categories"
            used={categoryCount}
            limit={limits.max_categories}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Plans</h2>
        <PlanComparisonGrid plans={allPlans} currentPlan={subscription.plan} />
      </div>
    </div>
  );
}
