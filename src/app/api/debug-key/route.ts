import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

// Temporary diagnostic route — reveals only the key's mode prefix (never
// the secret), what Paystack's live API currently reports for Plans, and
// what plan codes are stored in the DB right now. Delete once the
// live/test mismatch is found.
export async function GET() {
  const secretKeyPrefix = env.PAYSTACK_SECRET_KEY?.slice(0, 8) ?? "unset";
  const publicKeyPrefix =
    env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.slice(0, 8) ?? "unset";

  let paystackPlans: unknown = null;
  let paystackError: string | null = null;

  try {
    const response = await fetch("https://api.paystack.co/plan", {
      headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
    });
    const body = await response.json();
    const plans = (body.data ?? []) as Array<{
      name: string;
      plan_code: string;
      interval: string;
      amount: number;
    }>;
    paystackPlans = plans.map((p) => ({
      name: p.name,
      plan_code: p.plan_code,
      interval: p.interval,
      amount: p.amount,
    }));
  } catch (error) {
    paystackError = error instanceof Error ? error.message : String(error);
  }

  const supabase = createServiceClient();
  const { data: dbPlans } = await supabase
    .from("plan_limits")
    .select("plan, paystack_plan_code, paystack_yearly_plan_code");

  return NextResponse.json({
    secretKeyPrefix,
    publicKeyPrefix,
    paystackPlansFromLiveApi: paystackPlans,
    paystackError,
    dbPlanCodes: dbPlans,
  });
}
