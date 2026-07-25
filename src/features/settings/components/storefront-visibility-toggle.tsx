"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";

export function StorefrontVisibilityToggle({
  businessId,
  isActive,
}: {
  businessId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(isActive);
  const [isUpdating, setIsUpdating] = React.useState(false);

  async function handleChange(next: boolean) {
    setChecked(next);
    setIsUpdating(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("businesses")
      .update({ is_active: next })
      .eq("id", businessId);

    setIsUpdating(false);

    if (error) {
      setChecked(!next);
      toast.error(error.message);
      return;
    }

    toast.success(next ? "Storefront is now live" : "Storefront is hidden");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">
          {checked ? "Storefront is live" : "Storefront is hidden"}
        </p>
        <p className="text-muted-foreground text-sm">
          {checked
            ? "Customers can view your products and place orders."
            : "Your storefront is hidden from customers."}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isUpdating}
      />
    </div>
  );
}
