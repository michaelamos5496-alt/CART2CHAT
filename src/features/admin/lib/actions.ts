"use server";

import { redirect } from "next/navigation";

import { createPlan, updatePlan } from "@/lib/paystack";
import { createClient } from "@/lib/supabase/server";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import type { SubscriptionPlan } from "@/types/subscription";

// Creates (or updates, if already synced) the Paystack Plans backing a
// tier's recurring billing — one per interval, since Paystack Plans are
// interval-locked and can't be reused across monthly/yearly. Paystack has
// no "get or create" endpoint, so we track each code ourselves in
// plan_limits.paystack_plan_code / paystack_yearly_plan_code to decide
// create vs. update.
export async function syncPaystackPlan(
  plan: SubscriptionPlan,
): Promise<
  { error: string } | { planCode: string; yearlyPlanCode: string }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: planLimits } = await supabase
    .from("plan_limits")
    .select("*")
    .eq("plan", plan)
    .maybeSingle();

  if (!planLimits) {
    return { error: "Plan not found." };
  }

  const label = PLAN_META[plan].label;

  try {
    let planCode = planLimits.paystack_plan_code;
    const monthlyName = `Cart2Chat ${label} (Monthly)`;
    const monthlyAmountKobo = Math.round(planLimits.monthly_price * 100);

    if (planCode) {
      await updatePlan(planCode, {
        name: monthlyName,
        amountKobo: monthlyAmountKobo,
      });
    } else {
      const created = await createPlan({
        name: monthlyName,
        amountKobo: monthlyAmountKobo,
        interval: "monthly",
      });
      planCode = created.plan_code;
    }

    let yearlyPlanCode = planLimits.paystack_yearly_plan_code;
    const yearlyName = `Cart2Chat ${label} (Yearly)`;
    const yearlyAmountKobo = Math.round(planLimits.yearly_price * 100);

    if (yearlyPlanCode) {
      await updatePlan(yearlyPlanCode, {
        name: yearlyName,
        amountKobo: yearlyAmountKobo,
      });
    } else {
      const created = await createPlan({
        name: yearlyName,
        amountKobo: yearlyAmountKobo,
        interval: "annually",
      });
      yearlyPlanCode = created.plan_code;
    }

    const { error } = await supabase
      .from("plan_limits")
      .update({
        paystack_plan_code: planCode,
        paystack_yearly_plan_code: yearlyPlanCode,
      })
      .eq("plan", plan);

    if (error) {
      return { error: error.message };
    }

    return { planCode, yearlyPlanCode };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to sync plan.",
    };
  }
}
