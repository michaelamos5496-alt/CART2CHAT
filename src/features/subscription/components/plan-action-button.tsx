"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { initiateCheckout } from "@/features/subscription/lib/actions";
import type {
  BillingInterval,
  BillingMode,
  SubscriptionPlan,
} from "@/types/subscription";

function CheckoutButton({
  plan,
  interval,
  mode,
  label,
  pendingLabel,
  variant,
}: {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  mode: BillingMode;
  label: string;
  pendingLabel: string;
  variant: "default" | "outline";
}) {
  const [isPending, setIsPending] = React.useState(false);

  async function handleClick() {
    setIsPending(true);
    const result = await initiateCheckout(plan, interval, mode);
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
      variant={variant}
      className="w-full"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? <Loader2 className="animate-spin" /> : null}
      {isPending ? pendingLabel : label}
    </Button>
  );
}

export function PlanActionButton({
  plan,
  interval,
  isCurrent,
  isDowngrade,
  highlighted,
  billingMode,
}: {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  isCurrent: boolean;
  isDowngrade?: boolean;
  highlighted?: boolean;
  // Only meaningful when isCurrent — a manual (Mobile Money) subscription
  // needs a way to pay again before it lapses, so it gets an active
  // "Renew now" button instead of the disabled "Current plan" one.
  billingMode?: BillingMode;
}) {
  if (isCurrent) {
    if (billingMode === "manual") {
      return (
        <CheckoutButton
          plan={plan}
          interval={interval}
          mode="manual"
          label="Renew now"
          pendingLabel="Redirecting..."
          variant="outline"
        />
      );
    }
    return (
      <Button size="lg" variant="outline" disabled className="w-full">
        Current plan
      </Button>
    );
  }

  const actionWord = isDowngrade ? "Downgrade" : "Upgrade";

  return (
    <div className="grid gap-2">
      <CheckoutButton
        plan={plan}
        interval={interval}
        mode="recurring"
        label={`${actionWord} — Pay with Card`}
        pendingLabel="Redirecting..."
        variant={highlighted ? "default" : "outline"}
      />
      <CheckoutButton
        plan={plan}
        interval={interval}
        mode="manual"
        label={`${actionWord} — Pay with Mobile Money`}
        pendingLabel="Redirecting..."
        variant="outline"
      />
    </div>
  );
}
