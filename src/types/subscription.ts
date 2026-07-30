export const SUBSCRIPTION_PLANS = ["starter", "growth", "pro"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export type SubscriptionStatus =
  "active" | "trialing" | "past_due" | "cancelled";

// "none" is the default every business is provisioned with. "paystack" is
// set once a checkout completes; "stripe" / "local" remain unused
// integration points.
export type SubscriptionProvider = "none" | "stripe" | "local" | "paystack";

export type BillingInterval = "monthly" | "yearly";

export interface BusinessSubscription {
  business_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: SubscriptionProvider;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  // Paystack's disable/enable-subscription endpoints require both the
  // subscription code and its email token — captured off the
  // subscription.create webhook payload.
  paystack_email_token: string | null;
  billing_interval: BillingInterval;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  plan: SubscriptionPlan;
  monthly_price: number;
  yearly_price: number;
  max_products: number | null;
  max_categories: number | null;
  has_full_analytics: boolean;
  has_custom_branding: boolean;
  paystack_plan_code: string | null;
  paystack_yearly_plan_code: string | null;
}
