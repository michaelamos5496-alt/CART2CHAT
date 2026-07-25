export const SUBSCRIPTION_PLANS = ["starter", "growth", "pro"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export type SubscriptionStatus =
  "active" | "trialing" | "past_due" | "cancelled";

// "none" today — every business is provisioned with no payment provider
// attached. "stripe" / "local" are the integration points a future payment
// integration will set, not values anything writes yet.
export type SubscriptionProvider = "none" | "stripe" | "local";

export interface BusinessSubscription {
  business_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: SubscriptionProvider;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
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
}
