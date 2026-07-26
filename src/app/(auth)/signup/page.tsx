import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "@/features/auth/components/signup-form";
import { redirectIfAuthenticated } from "@/features/auth/lib/guards";
import { isFeatureFlagEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  await redirectIfAuthenticated();

  const signupsEnabled = await isFeatureFlagEnabled("new_signups_enabled");

  if (!signupsEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Signups are paused</CardTitle>
          <CardDescription>
            Cart-2-Chat isn&apos;t accepting new businesses right now. Please
            check back soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Set up your business storefront on Cart-2-Chat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
