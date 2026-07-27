"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resumeSubscription } from "@/features/settings/lib/mutations";

export function ResumeSubscriptionButton() {
  const router = useRouter();
  const [isResuming, setIsResuming] = React.useState(false);

  async function handleResume() {
    setIsResuming(true);
    try {
      await resumeSubscription();
      toast.success("Subscription resumed — your storefront is back online");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resume subscription",
      );
      setIsResuming(false);
    }
  }

  return (
    <Button onClick={handleResume} disabled={isResuming}>
      {isResuming ? <Loader2 className="animate-spin" /> : null}
      {isResuming ? "Resuming..." : "Resume subscription"}
    </Button>
  );
}
