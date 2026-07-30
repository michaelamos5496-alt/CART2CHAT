"use server";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import {
  disableSubscription,
  enableSubscription,
  initializeTransaction,
} from "@/lib/paystack";
import { createClient } from "@/lib/supabase/server";
import type {
  BillingInterval,
  BillingMode,
  SubscriptionPlan,
} from "@/types/subscription";

// Same shape as src/features/auth/actions.ts: return { error } instead of
// throwing, so the client can `if (result?.error)` without a try/catch.
export async function initiateCheckout(
  plan: SubscriptionPlan,
  interval: BillingInterval,
  mode: BillingMode = "recurring",
): Promise<{ error: string } | { url: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: business }, { data: planLimits }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase.from("plan_limits").select("*").eq("plan", plan).maybeSingle(),
  ]);

  if (!business) {
    return { error: "No business found for your account." };
  }

  if (!planLimits) {
    return { error: "Plan not found." };
  }

  const amount =
    interval === "yearly" ? planLimits.yearly_price : planLimits.monthly_price;

  // "manual" (Mobile Money) is a plan-less one-time charge — it doesn't
  // need a Paystack Plan code at all, so it works even for plans that
  // were never synced via /admin/plans.
  let planCode: string | undefined;

  if (mode === "recurring") {
    planCode =
      (interval === "yearly"
        ? planLimits.paystack_yearly_plan_code
        : planLimits.paystack_plan_code) ?? undefined;

    if (!planCode) {
      return {
        error:
          interval === "yearly"
            ? "Yearly billing for this plan isn't set up yet — contact support."
            : "This plan isn't set up for checkout yet — contact support.",
      };
    }
  }

  try {
    const transaction = await initializeTransaction({
      email: user.email ?? "",
      amountKobo: Math.round(amount * 100),
      planCode,
      // "manual" checkout is the Mobile Money path — pin the channel list
      // so device-level auto-detection (e.g. Apple Pay being configured)
      // can't push Mobile Money out of the way.
      channels: mode === "manual" ? ["mobile_money", "card"] : undefined,
      callbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/dashboard/billing/callback`,
      metadata: { business_id: business.id, plan, interval, mode },
    });

    return { url: transaction.authorization_url };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to start checkout.",
    };
  }
}

async function getOwnSubscription(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (!business) return null;

  const { data: subscription } = await supabase
    .from("business_subscriptions")
    .select("*")
    .eq("business_id", business.id)
    .maybeSingle();

  return subscription;
}

export async function cancelSubscriptionAction(): Promise<
  { error: string } | undefined
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const subscription = await getOwnSubscription(supabase, user.id);

    if (
      subscription?.provider === "paystack" &&
      subscription.provider_subscription_id &&
      subscription.paystack_email_token
    ) {
      await disableSubscription({
        code: subscription.provider_subscription_id,
        token: subscription.paystack_email_token,
      });
    }

    const { error } = await supabase.rpc("cancel_subscription");
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription.",
    };
  }
}

export async function resumeSubscriptionAction(): Promise<
  { error: string } | undefined
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const subscription = await getOwnSubscription(supabase, user.id);

    if (
      subscription?.provider === "paystack" &&
      subscription.provider_subscription_id &&
      subscription.paystack_email_token
    ) {
      await enableSubscription({
        code: subscription.provider_subscription_id,
        token: subscription.paystack_email_token,
      });
    }

    const { error } = await supabase.rpc("resume_subscription");
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to resume subscription.",
    };
  }
}
