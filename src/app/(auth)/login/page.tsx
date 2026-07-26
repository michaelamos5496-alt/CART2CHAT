import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { redirectIfAuthenticated } from "@/features/auth/lib/guards";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log in to Cart-2-Chat</CardTitle>
        <CardDescription>
          Enter your email and password to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
