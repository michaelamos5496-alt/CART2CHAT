import type { BusinessSubscription } from "@/types/subscription";

// Only businesses created after this ship date are paywalled — anyone
// already using the dashboard unpaid before this shipped keeps access,
// so launching this doesn't lock out existing users.
export const REQUIRE_SUBSCRIPTION_SINCE = new Date("2026-07-30T21:00:00.000Z");

export function requiresSubscription(
  subscription: Pick<BusinessSubscription, "provider" | "created_at">,
): boolean {
  return (
    subscription.provider === "none" &&
    new Date(subscription.created_at) >= REQUIRE_SUBSCRIPTION_SINCE
  );
}
