"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RetryButton() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = React.useState(false);

  function handleRetry() {
    setIsRetrying(true);
    router.refresh();
    // router.refresh() doesn't resolve when the refresh completes, so
    // this is a short, deliberately generous window before re-enabling
    // the button rather than a real completion signal.
    setTimeout(() => setIsRetrying(false), 2000);
  }

  return (
    <Button variant="outline" onClick={handleRetry} disabled={isRetrying}>
      {isRetrying ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
      {isRetrying ? "Checking..." : "Check again"}
    </Button>
  );
}
