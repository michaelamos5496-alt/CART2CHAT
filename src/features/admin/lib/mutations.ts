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

// Assigning a plan doubles as the (currently manual, since there's no
// payment processor) reactivation path: it always clears a cancelled
// status, so support can bring a business back after they've paid
// outside the app. Storefront visibility is only restored if this
// business was actually cancelled — an unrelated plan correction
// shouldn't override an owner's own independent visibility choice.
export async function updateBusinessPlan(
  businessId: string,
  plan: SubscriptionPlan,
) {
  const supabase = createClient();

  const { data: current } = await supabase
    .from("business_subscriptions")
    .select("status")
    .eq("business_id", businessId)
    .maybeSingle();

  const wasCancelled = current?.status === "cancelled";

  const { error: subscriptionError } = await supabase
    .from("business_subscriptions")
    .update({ plan, status: "active" })
    .eq("business_id", businessId);

  if (subscriptionError) throw new Error(subscriptionError.message);

  if (wasCancelled) {
    const { error: businessError } = await supabase
      .from("businesses")
      .update({ is_active: true })
      .eq("id", businessId);

    if (businessError) throw new Error(businessError.message);
  }
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
