import { NextResponse } from "next/server";

import { verifyTransaction } from "@/lib/paystack";

// Best-effort UX only — the webhook (src/app/api/webhooks/paystack) is
// the source of truth for actually activating a subscription. This just
// gives the user an immediate success/failure signal after Paystack
// redirects them back.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference");

  let status: "success" | "failed" = "failed";

  if (reference) {
    try {
      const transaction = await verifyTransaction(reference);
      if (transaction.status === "success") {
        status = "success";
      }
    } catch (error) {
      console.error("paystack callback: verify failed", error);
    }
  }

  return NextResponse.redirect(
    `${origin}/dashboard/billing?checkout=${status}`,
  );
}
