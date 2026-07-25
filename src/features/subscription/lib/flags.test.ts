import { describe, expect, it } from "vitest";

import { planHasFeature } from "@/features/subscription/lib/flags";

describe("planHasFeature", () => {
  it("reads has_custom_branding for the custom_branding flag", () => {
    expect(
      planHasFeature(
        { has_custom_branding: true, has_full_analytics: false },
        "custom_branding",
      ),
    ).toBe(true);
    expect(
      planHasFeature(
        { has_custom_branding: false, has_full_analytics: true },
        "custom_branding",
      ),
    ).toBe(false);
  });

  it("reads has_full_analytics for the full_analytics flag", () => {
    expect(
      planHasFeature(
        { has_custom_branding: false, has_full_analytics: true },
        "full_analytics",
      ),
    ).toBe(true);
    expect(
      planHasFeature(
        { has_custom_branding: true, has_full_analytics: false },
        "full_analytics",
      ),
    ).toBe(false);
  });
});
