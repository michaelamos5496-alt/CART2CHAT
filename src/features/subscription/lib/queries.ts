import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type {
  BusinessSubscription,
  PlanLimits,
  SubscriptionPlan,
} from "@/types/subscription";

export const getBusinessSubscription = cache(
  async (businessId: string): Promise<BusinessSubscription | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("business_subscriptions")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle();

    return data as BusinessSubscription | null;
  },
);

export async function getAllPlanLimits(): Promise<PlanLimits[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plan_limits")
    .select("*")
    .order("max_products", { ascending: true, nullsFirst: false });

  return (data as PlanLimits[] | null) ?? [];
}

export async function getPlanLimits(
  plan: SubscriptionPlan,
): Promise<PlanLimits | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plan_limits")
    .select("*")
    .eq("plan", plan)
    .maybeSingle();

  return data as PlanLimits | null;
}

export interface BillingOverview {
  subscription: BusinessSubscription;
  limits: PlanLimits;
  allPlans: PlanLimits[];
  productCount: number;
  categoryCount: number;
}

export async function getBillingOverview(
  businessId: string,
): Promise<BillingOverview | null> {
  const supabase = await createClient();

  const subscription = await getBusinessSubscription(businessId);
  if (!subscription) return null;

  const [limits, allPlans, productCountResult, categoryCountResult] =
    await Promise.all([
      getPlanLimits(subscription.plan),
      getAllPlanLimits(),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId),
    ]);

  if (!limits) return null;

  return {
    subscription,
    limits,
    allPlans,
    productCount: productCountResult.count ?? 0,
    categoryCount: categoryCountResult.count ?? 0,
  };
}
