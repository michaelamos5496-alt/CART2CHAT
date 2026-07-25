import type { SubscriptionPlan } from "@/types/subscription";

// Presentational-only copy. Numbers (price, limits, feature flags) always
// come from the plan_limits table — this is just the tagline text next to
// them, which has nowhere sensible to live in the database.
export const PLAN_META: Record<
  SubscriptionPlan,
  { label: string; description: string }
> = {
  starter: { label: "Starter", description: "For testing the waters." },
  growth: {
    label: "Growth",
    description: "For businesses ready to scale up.",
  },
  pro: { label: "Pro", description: "For established storefronts." },
};
