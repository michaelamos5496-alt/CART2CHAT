"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { initiateCheckout } from "@/features/subscription/lib/actions";
import type { BillingInterval, SubscriptionPlan } from "@/types/subscription";

export function PlanActionButton({
  plan,
  interval,
  isCurrent,
  isDowngrade,
  highlighted,
}: {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  isCurrent: boolean;
  isDowngrade?: boolean;
  highlighted?: boolean;
}) {
  const [isPending, setIsPending] = React.useState(false);

  if (isCurrent) {
    return (
      <Button size="lg" variant="outline" disabled className="w-full">
        Current plan
      </Button>
    );
  }

  async function handleClick() {
    setIsPending(true);
    const result = await initiateCheckout(plan, interval);
    if ("error" in result) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <Button
      size="lg"
      variant={highlighted ? "default" : "outline"}
      className="w-full"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? <Loader2 className="animate-spin" /> : null}
      {isPending ? "Redirecting..." : isDowngrade ? "Downgrade" : "Upgrade"}
    </Button>
  );
}
