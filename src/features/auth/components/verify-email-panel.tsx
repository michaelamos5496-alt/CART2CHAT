"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthErrorAlert } from "@/features/auth/components/auth-error-alert";
import { getAuthErrorMessage } from "@/features/auth/lib/errors";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email) return;

    setError(null);
    setIsResending(true);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setIsResending(false);

    if (resendError) {
      setError(getAuthErrorMessage(resendError.message));
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="grid gap-4 text-center">
      <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
        <MailCheck className="size-6" />
      </div>
      <div className="grid gap-1">
        <p className="text-sm">
          We sent a verification link to{" "}
          <span className="font-medium">{email ?? "your email address"}</span>.
        </p>
        <p className="text-muted-foreground text-sm">
          Click the link to activate your account. You can close this tab.
        </p>
      </div>
      <AuthErrorAlert message={error} />
      <Button
        variant="outline"
        disabled={!email || isResending || cooldown > 0}
        onClick={handleResend}
      >
        {isResending && <Loader2 className="animate-spin" />}
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
      </Button>
    </div>
  );
}
