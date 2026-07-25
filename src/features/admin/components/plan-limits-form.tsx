"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updatePlanLimits } from "@/features/admin/lib/mutations";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import type { PlanLimits } from "@/types/subscription";

function toInputValue(value: number | null) {
  return value === null ? "" : value.toString();
}

function toLimit(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PlanLimitsForm({ planLimits }: { planLimits: PlanLimits }) {
  const router = useRouter();
  const [monthlyPrice, setMonthlyPrice] = React.useState(
    planLimits.monthly_price.toString(),
  );
  const [yearlyPrice, setYearlyPrice] = React.useState(
    planLimits.yearly_price.toString(),
  );
  const [maxProducts, setMaxProducts] = React.useState(
    toInputValue(planLimits.max_products),
  );
  const [maxCategories, setMaxCategories] = React.useState(
    toInputValue(planLimits.max_categories),
  );
  const [hasFullAnalytics, setHasFullAnalytics] = React.useState(
    planLimits.has_full_analytics,
  );
  const [hasCustomBranding, setHasCustomBranding] = React.useState(
    planLimits.has_custom_branding,
  );
  const [isSaving, setIsSaving] = React.useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updatePlanLimits(planLimits.plan, {
        monthlyPrice: Number(monthlyPrice) || 0,
        yearlyPrice: Number(yearlyPrice) || 0,
        maxProducts: toLimit(maxProducts),
        maxCategories: toLimit(maxCategories),
        hasFullAnalytics,
        hasCustomBranding,
      });
      toast.success(`${PLAN_META[planLimits.plan].label} plan updated`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update plan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {PLAN_META[planLimits.plan].label}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {PLAN_META[planLimits.plan].description}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Monthly price</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Yearly price</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={yearlyPrice}
              onChange={(e) => setYearlyPrice(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Max products</Label>
            <Input
              type="number"
              min={0}
              placeholder="Unlimited"
              value={maxProducts}
              onChange={(e) => setMaxProducts(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Max categories</Label>
            <Input
              type="number"
              min={0}
              placeholder="Unlimited"
              value={maxCategories}
              onChange={(e) => setMaxCategories(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label>Full analytics</Label>
          <Switch
            checked={hasFullAnalytics}
            onCheckedChange={setHasFullAnalytics}
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Custom branding</Label>
          <Switch
            checked={hasCustomBranding}
            onCheckedChange={setHasCustomBranding}
            disabled={isSaving}
          />
        </div>
        <Button
          size="sm"
          className="justify-self-start"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
