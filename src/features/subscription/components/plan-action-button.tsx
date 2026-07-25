"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// There is no payment integration yet (see business_subscriptions'
// provider column), so this intentionally cannot change your plan — it's
// the one honest thing it can do until a Stripe/local-payment checkout
// exists to wire up here.
export function PlanActionButton({
  isCurrent,
  highlighted,
}: {
  isCurrent: boolean;
  highlighted?: boolean;
}) {
  if (isCurrent) {
    return (
      <Button size="lg" variant="outline" disabled className="w-full">
        Current plan
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      variant={highlighted ? "default" : "outline"}
      className="w-full"
      onClick={() =>
        toast.info("Payment integration coming soon", {
          description:
            "Plan upgrades aren't live yet. Contact us if you'd like an early upgrade.",
        })
      }
    >
      Upgrade
    </Button>
  );
}
