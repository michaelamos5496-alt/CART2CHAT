import type { Metadata } from "next";

import { PlanLimitsForm } from "@/features/admin/components/plan-limits-form";
import { getAllPlanLimits } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "Plans",
};

export default async function AdminPlansPage() {
  const planLimits = await getAllPlanLimits();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-muted-foreground text-sm">
          Pricing and limits for each subscription tier.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {planLimits.map((plan) => (
          <PlanLimitsForm key={plan.plan} planLimits={plan} />
        ))}
      </div>
    </div>
  );
}
