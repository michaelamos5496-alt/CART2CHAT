"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import type { SubscriptionStatus } from "@/types/subscription";

function CancelSubscriptionAction({ status }: { status: SubscriptionStatus }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  if (status === "cancelled") {
    return (
      <div>
        <p className="text-sm font-medium">Subscription cancelled</p>
        <p className="text-muted-foreground text-sm">
          Your storefront is hidden from customers and you can&apos;t add new
          products. Contact us to resubscribe and turn it back on.
        </p>
      </div>
    );
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      toast.success("Subscription cancelled");
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
          Your storefront is hidden from customers immediately and you
          won&apos;t be able to add new products until you resubscribe.
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
              Your storefront will be hidden from customers immediately, and
              you won&apos;t be able to add new products until you
              resubscribe. Existing products, categories, and orders are kept
              as they are.
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
    // No try/catch: deleteAccount returns { error } for every expected
    // failure and only calls redirect() (which navigates away, unmounting
    // this component) on success — nothing here should ever throw.
    const result = await deleteAccount();
    if (result?.error) {
      toast.error(result.error);
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
  status,
}: {
  businessName: string;
  status: SubscriptionStatus;
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
        <CancelSubscriptionAction status={status} />
        <DeleteAccountAction businessName={businessName} />
      </CardContent>
    </Card>
  );
}
