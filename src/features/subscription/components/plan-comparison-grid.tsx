"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanActionButton } from "@/features/subscription/components/plan-action-button";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import { cn } from "@/lib/utils";
import type {
  BillingInterval,
  PlanLimits,
  SubscriptionPlan,
} from "@/types/subscription";

function planFeatureList(limits: PlanLimits): string[] {
  return [
    limits.max_products
      ? `Up to ${limits.max_products} products`
      : "Unlimited products",
    limits.max_categories
      ? `Up to ${limits.max_categories} categories`
      : "Unlimited categories",
    limits.has_full_analytics
      ? "Full analytics dashboard"
      : "Basic analytics only",
    limits.has_custom_branding ? "Custom logo & banner" : "No custom branding",
  ];
}

export function PlanComparisonGrid({
  plans,
  currentPlan,
}: {
  plans: PlanLimits[];
  currentPlan: SubscriptionPlan;
}) {
  const [interval, setBillingInterval] =
    React.useState<BillingInterval>("monthly");
  // plans is ordered by max_products ascending (see getAllPlanLimits), so
  // an index below the current plan's is strictly a lower tier.
  const currentIndex = plans.findIndex((plan) => plan.plan === currentPlan);

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={interval === "monthly" ? "default" : "outline"}
          onClick={() => setBillingInterval("monthly")}
        >
          Monthly
        </Button>
        <Button
          size="sm"
          variant={interval === "yearly" ? "default" : "outline"}
          onClick={() => setBillingInterval("yearly")}
        >
          Yearly
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const meta = PLAN_META[plan.plan];
          const isCurrent = plan.plan === currentPlan;
          const isDowngrade = currentIndex >= 0 && index < currentIndex;
          const highlighted = plan.plan === "growth";
          // Each plan's entitlements are a strict superset of the one
          // before it (see the ordering note on currentIndex above) — this
          // just makes that inheritance explicit.
          const previousLabel =
            index > 0 ? PLAN_META[plans[index - 1].plan].label : null;
          const price =
            interval === "yearly" ? plan.yearly_price : plan.monthly_price;

          return (
            <div
              key={plan.plan}
              className={cn(
                "grid gap-6 rounded-2xl border p-6",
                highlighted && "border-primary shadow-lg",
                isCurrent && "ring-primary ring-2 ring-offset-2",
              )}
            >
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{meta.label}</h3>
                  {isCurrent && <Badge variant="secondary">Current</Badge>}
                  {!isCurrent && highlighted && <Badge>Most popular</Badge>}
                </div>
                <p className="text-muted-foreground text-sm">
                  {meta.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  ₵{price}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{interval === "yearly" ? "year" : "month"}
                </span>
              </div>

              <PlanActionButton
                plan={plan.plan}
                interval={interval}
                isCurrent={isCurrent}
                isDowngrade={isDowngrade}
                highlighted={highlighted}
              />

              <ul className="grid gap-2.5 text-sm">
                {previousLabel && (
                  <li className="text-foreground font-medium">
                    Everything in {previousLabel}, plus:
                  </li>
                )}
                {planFeatureList(plan).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
