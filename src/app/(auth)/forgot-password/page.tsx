import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { redirectIfAuthenticated } from "@/features/auth/lib/guards";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remembered it?{" "}
          <Link href="/login" className="text-foreground underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
