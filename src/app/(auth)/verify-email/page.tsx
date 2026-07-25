import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Check your inbox</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense>
          <VerifyEmailPanel />
        </Suspense>
      </CardContent>
    </Card>
  );
}
