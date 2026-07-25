import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UpgradeBanner({
  message,
  ctaLabel = "View plans",
}: {
  message: string;
  ctaLabel?: string;
}) {
  return (
    <div className="border-primary/20 bg-primary/5 flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
      <Button
        size="sm"
        className="w-full shrink-0 sm:w-auto"
        render={<Link href="/dashboard/billing" />}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
