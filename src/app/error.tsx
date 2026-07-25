"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logError(error, { digest: error.digest, boundary: "root" });
  }, [error]);

  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          <RefreshCcw />
          Try again
        </Button>
        <Button render={<Link href="/" />}>Go home</Button>
      </div>
    </div>
  );
}
