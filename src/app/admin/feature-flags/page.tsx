import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureFlagToggle } from "@/features/admin/components/feature-flag-toggle";
import { getFeatureFlags } from "@/features/admin/lib/queries";

export const metadata: Metadata = {
  title: "Feature flags",
};

export default async function AdminFeatureFlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feature flags</h1>
        <p className="text-muted-foreground text-sm">
          Platform-wide switches. Changes apply immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {flags.length} flag{flags.length === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {flags.map((flag) => (
            <FeatureFlagToggle key={flag.key} flag={flag} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
