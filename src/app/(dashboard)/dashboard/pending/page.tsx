import type { Metadata } from "next";
import { Hourglass } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RetryButton } from "@/app/(dashboard)/dashboard/pending/retry-button";

export const metadata: Metadata = {
  title: "Setting up your store",
};

// Reached only when a confirmed, logged-in user has no business row at
// all (see the "no business" branch in src/lib/supabase/middleware.ts).
// Normally auto-provisioning creates one the instant a signup confirms,
// so landing here means that failed or hasn't run yet — not a state a
// healthy account should stay in for more than a few seconds.
export default function PendingProvisioningPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <div className="bg-muted mb-2 flex size-12 items-center justify-center rounded-full">
            <Hourglass className="text-muted-foreground size-6" />
          </div>
          <CardTitle>Setting up your store</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <p className="text-muted-foreground">
            We&apos;re still finishing setup for your account. This usually
            takes a few seconds — try checking again, and contact support if it
            doesn&apos;t resolve.
          </p>
          <RetryButton />
        </CardContent>
      </Card>
    </div>
  );
}
