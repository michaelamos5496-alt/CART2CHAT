"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// The Paystack callback route redirects here with ?checkout=success|failed
// for immediate feedback — the webhook is still what actually activates
// the subscription, so this is purely cosmetic.
export function CheckoutStatusToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  React.useEffect(() => {
    if (checkout === "success") {
      toast.success("Payment received — activating your plan...");
    } else if (checkout === "failed") {
      toast.error("Checkout didn't complete. You haven't been charged.");
    } else {
      return;
    }
    router.replace("/dashboard/billing");
  }, [checkout, router]);

  return null;
}
