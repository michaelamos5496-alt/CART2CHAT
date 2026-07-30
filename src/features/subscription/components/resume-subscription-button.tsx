"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resumeSubscriptionAction } from "@/features/subscription/lib/actions";

export function ResumeSubscriptionButton() {
  const router = useRouter();
  const [isResuming, setIsResuming] = React.useState(false);

  async function handleResume() {
    setIsResuming(true);
    const result = await resumeSubscriptionAction();
    if (result?.error) {
      toast.error(result.error);
      setIsResuming(false);
      return;
    }
    toast.success("Subscription resumed — your storefront is back online");
    router.refresh();
  }

  return (
    <Button onClick={handleResume} disabled={isResuming}>
      {isResuming ? <Loader2 className="animate-spin" /> : null}
      {isResuming ? "Resuming..." : "Resume subscription"}
    </Button>
  );
}
