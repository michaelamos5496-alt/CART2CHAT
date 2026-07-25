"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBusinessPlan } from "@/features/admin/lib/mutations";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "@/types/subscription";

export function PlanOverrideSelect({
  businessId,
  plan,
}: {
  businessId: string;
  plan: SubscriptionPlan;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(plan);
  const [isUpdating, setIsUpdating] = React.useState(false);

  async function handleChange(next: string | null) {
    if (!next) return;
    const nextPlan = next as SubscriptionPlan;
    const previous = value;
    setValue(nextPlan);
    setIsUpdating(true);

    try {
      await updateBusinessPlan(businessId, nextPlan);
      toast.success(`Plan changed to ${PLAN_META[nextPlan].label}`);
      router.refresh();
    } catch (error) {
      setValue(previous);
      toast.error(
        error instanceof Error ? error.message : "Failed to update plan",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger size="sm">
        {isUpdating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {SUBSCRIPTION_PLANS.map((option) => (
          <SelectItem key={option} value={option}>
            {PLAN_META[option].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
