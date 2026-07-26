"use client";

import * as React from "react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/features/auth/actions";
import { cancelSubscription } from "@/features/settings/lib/mutations";
import type { SubscriptionPlan } from "@/types/subscription";

function CancelSubscriptionAction({ plan }: { plan: SubscriptionPlan }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  if (plan === "starter") {
    return null;
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      toast.success("Subscription cancelled — you're back on the Starter plan");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Cancel subscription</p>
        <p className="text-muted-foreground text-sm">
          Move back to the free Starter plan. You&apos;ll keep your store, but
          lose access to paid features and higher limits.
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          Cancel subscription
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll move to the free Starter plan immediately. Any
              products or categories over the Starter limit will stay, but
              you won&apos;t be able to add more until you&apos;re back under
              it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep subscription
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isCancelling}
              onClick={handleCancel}
            >
              {isCancelling ? <Loader2 className="animate-spin" /> : null}
              {isCancelling ? "Cancelling..." : "Yes, cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeleteAccountAction({ businessName }: { businessName: string }) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const canConfirm = confirmText.trim() === businessName;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      // deleteAccount redirects on success, which Next.js implements by
      // throwing — let that propagate instead of treating it as failure.
      unstable_rethrow(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Delete account</p>
        <p className="text-muted-foreground text-sm">
          Permanently deletes your store, products, orders, and login. This
          can&apos;t be undone.
        </p>
      </div>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmText("");
        }}
      >
        <AlertDialogTrigger render={<Button variant="destructive" />}>
          Delete account
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your storefront, products, categories,
              orders, and your login itself. There&apos;s no way to recover
              this. Type{" "}
              <span className="text-foreground font-medium">
                {businessName}
              </span>{" "}
              to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={businessName}
            disabled={isDeleting}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting || !canConfirm}
              onClick={handleDelete}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function DangerZone({
  businessName,
  plan,
}: {
  businessName: string;
  plan: SubscriptionPlan;
}) {
  return (
    <Card className="border-destructive/30 lg:max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Danger zone</CardTitle>
        <CardDescription>
          These actions are irreversible or change your billing immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CancelSubscriptionAction plan={plan} />
        <DeleteAccountAction businessName={businessName} />
      </CardContent>
    </Card>
  );
}
