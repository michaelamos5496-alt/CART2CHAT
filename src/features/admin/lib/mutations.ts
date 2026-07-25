import { createClient } from "@/lib/supabase/client";
import type { SubscriptionPlan } from "@/types/subscription";

export async function suspendBusiness(businessId: string, reason: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_reason: reason || null,
    })
    .eq("id", businessId);

  if (error) throw new Error(error.message);
}

export async function unsuspendBusiness(businessId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      is_suspended: false,
      suspended_at: null,
      suspended_reason: null,
    })
    .eq("id", businessId);

  if (error) throw new Error(error.message);
}

export async function deleteBusiness(businessId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", businessId);

  if (error) throw new Error(error.message);
}

export async function updateBusinessPlan(
  businessId: string,
  plan: SubscriptionPlan,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("business_subscriptions")
    .update({ plan })
    .eq("business_id", businessId);

  if (error) throw new Error(error.message);
}

export async function updatePlanLimits(
  plan: SubscriptionPlan,
  values: {
    monthlyPrice: number;
    yearlyPrice: number;
    maxProducts: number | null;
    maxCategories: number | null;
    hasFullAnalytics: boolean;
    hasCustomBranding: boolean;
  },
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("plan_limits")
    .update({
      monthly_price: values.monthlyPrice,
      yearly_price: values.yearlyPrice,
      max_products: values.maxProducts,
      max_categories: values.maxCategories,
      has_full_analytics: values.hasFullAnalytics,
      has_custom_branding: values.hasCustomBranding,
    })
    .eq("plan", plan);

  if (error) throw new Error(error.message);
}

export async function toggleFeatureFlag(key: string, isEnabled: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("feature_flags")
    .update({ is_enabled: isEnabled })
    .eq("key", key);

  if (error) throw new Error(error.message);
}
