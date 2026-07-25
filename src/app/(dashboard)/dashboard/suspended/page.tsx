import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOwnBusiness } from "@/features/business/lib/queries";

export const metadata: Metadata = {
  title: "Account suspended",
};

export default async function SuspendedPage() {
  const business = await getOwnBusiness();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <div className="bg-destructive/10 text-destructive mb-2 flex size-12 items-center justify-center rounded-full">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle>Your account is suspended</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p className="text-muted-foreground">
            {business?.name ?? "Your business"} has been suspended and your
            storefront and dashboard are temporarily unavailable.
          </p>
          {business?.suspended_reason && (
            <div className="bg-muted rounded-lg p-3 text-left">
              <p className="text-xs font-medium">Reason provided</p>
              <p className="text-muted-foreground text-sm">
                {business.suspended_reason}
              </p>
            </div>
          )}
          <p className="text-muted-foreground">
            If you believe this is a mistake, contact support to resolve it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
