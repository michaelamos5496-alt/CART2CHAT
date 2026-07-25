import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { StoreSettingsForm } from "@/features/settings/components/store-settings-form";
import { StorefrontVisibilityToggle } from "@/features/settings/components/storefront-visibility-toggle";
import { getBusinessSettings } from "@/features/settings/lib/queries";
import { planHasFeature } from "@/features/subscription/lib/flags";
import { getBillingOverview } from "@/features/subscription/lib/queries";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const business = await getOwnBusiness();
  if (!business) return null;

  const [settings, billing] = await Promise.all([
    getBusinessSettings(business.id),
    getBillingOverview(business.id),
  ]);

  const hasCustomBranding = billing
    ? planHasFeature(billing.limits, "custom_branding")
    : false;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your storefront profile. Changes preview live on the right.
        </p>
      </div>

      <StoreSettingsForm
        business={business}
        settings={settings}
        hasCustomBranding={hasCustomBranding}
      />

      <Card className="lg:max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <StorefrontVisibilityToggle
            businessId={business.id}
            isActive={business.is_active}
          />
        </CardContent>
      </Card>
    </div>
  );
}
