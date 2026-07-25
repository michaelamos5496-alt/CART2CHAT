import type { PlanLimits } from "@/types/subscription";

// The small, typed vocabulary of gated capabilities. Adding a new gated
// capability later means adding one case here and one column on
// plan_limits — call sites never touch plan names directly.
export type FeatureFlag = "custom_branding" | "full_analytics";

export function planHasFeature(
  limits: Pick<PlanLimits, "has_custom_branding" | "has_full_analytics">,
  flag: FeatureFlag,
): boolean {
  switch (flag) {
    case "custom_branding":
      return limits.has_custom_branding;
    case "full_analytics":
      return limits.has_full_analytics;
  }
}
