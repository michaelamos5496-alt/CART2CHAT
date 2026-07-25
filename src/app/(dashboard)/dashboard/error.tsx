"use client";

import * as React from "react";
import { RefreshCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logError(error, { digest: error.digest, boundary: "dashboard" });
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        This page hit an unexpected error. The rest of your dashboard is
        unaffected — try again, or use the sidebar to go elsewhere.
      </p>
      <Button variant="outline" onClick={reset}>
        <RefreshCcw />
        Try again
      </Button>
    </div>
  );
}
