import { NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";
import type { BillingInterval, SubscriptionPlan } from "@/types/subscription";

interface PaystackEvent {
  event: string;
  data: {
    metadata?: {
      business_id?: string;
      plan?: SubscriptionPlan;
      interval?: BillingInterval;
    };
    customer?: { customer_code?: string };
    subscription_code?: string;
    email_token?: string;
    next_payment_date?: string;
    subscription?: { subscription_code?: string };
  };
}

// Paystack retries on any non-2xx response, so unmatched/unknown events
// are logged and swallowed (200) rather than erroring — a business we
// can't match isn't worth an infinite retry loop.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PaystackEvent;
  const supabase = createServiceClient();

  switch (event.event) {
    case "charge.success": {
      const businessId = event.data.metadata?.business_id;
      const plan = event.data.metadata?.plan;
      // Older in-flight checkouts (before yearly billing existed) won't
      // carry an interval in their metadata — default to monthly.
      const interval = event.data.metadata?.interval ?? "monthly";
      const customerCode = event.data.customer?.customer_code;

      if (!businessId || !plan || !customerCode) {
        console.error("paystack webhook: charge.success missing metadata", {
          businessId,
          plan,
          customerCode,
        });
        break;
      }

      await supabase
        .from("business_subscriptions")
        .update({
          plan,
          status: "active",
          provider: "paystack",
          provider_customer_id: customerCode,
          billing_interval: interval,
        })
        .eq("business_id", businessId);

      await supabase
        .from("businesses")
        .update({ is_active: true })
        .eq("id", businessId);

      break;
    }

    case "subscription.create": {
      const customerCode = event.data.customer?.customer_code;
      const subscriptionCode = event.data.subscription_code;
      const emailToken = event.data.email_token;
      const nextPaymentDate = event.data.next_payment_date;

      if (!customerCode || !subscriptionCode) {
        console.error(
          "paystack webhook: subscription.create missing identifiers",
          { customerCode, subscriptionCode },
        );
        break;
      }

      await supabase
        .from("business_subscriptions")
        .update({
          provider_subscription_id: subscriptionCode,
          paystack_email_token: emailToken ?? null,
          current_period_end: nextPaymentDate ?? null,
        })
        .eq("provider_customer_id", customerCode);

      break;
    }

    case "invoice.payment_failed": {
      const subscriptionCode =
        event.data.subscription?.subscription_code ??
        event.data.subscription_code;

      if (!subscriptionCode) {
        console.error(
          "paystack webhook: invoice.payment_failed missing subscription code",
        );
        break;
      }

      await supabase
        .from("business_subscriptions")
        .update({ status: "past_due" })
        .eq("provider_subscription_id", subscriptionCode);

      break;
    }

    case "subscription.disable": {
      const subscriptionCode = event.data.subscription_code;

      if (!subscriptionCode) {
        console.error(
          "paystack webhook: subscription.disable missing subscription code",
        );
        break;
      }

      const { data: subscription } = await supabase
        .from("business_subscriptions")
        .update({ status: "cancelled" })
        .eq("provider_subscription_id", subscriptionCode)
        .select("business_id")
        .maybeSingle();

      if (subscription) {
        await supabase
          .from("businesses")
          .update({ is_active: false })
          .eq("id", subscription.business_id);
      }

      break;
    }

    default:
      console.info(`paystack webhook: unhandled event ${event.event}`);
  }

  return NextResponse.json({ received: true });
}
