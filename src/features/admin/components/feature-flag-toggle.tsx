"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { toggleFeatureFlag } from "@/features/admin/lib/mutations";
import type { PlatformFeatureFlag } from "@/types/admin";

export function FeatureFlagToggle({ flag }: { flag: PlatformFeatureFlag }) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(flag.is_enabled);
  const [isUpdating, setIsUpdating] = React.useState(false);

  async function handleChange(next: boolean) {
    setChecked(next);
    setIsUpdating(true);

    try {
      await toggleFeatureFlag(flag.key, next);
      toast.success(`${flag.label} ${next ? "enabled" : "disabled"}`);
      router.refresh();
    } catch (error) {
      setChecked(!next);
      toast.error(
        error instanceof Error ? error.message : "Failed to update flag",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">{flag.label}</p>
        {flag.description && (
          <p className="text-muted-foreground text-sm">{flag.description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isUpdating}
      />
    </div>
  );
}
