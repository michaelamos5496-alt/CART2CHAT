"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteBusinessDialog } from "@/features/admin/components/delete-business-dialog";
import { SuspendBusinessDialog } from "@/features/admin/components/suspend-business-dialog";
import { unsuspendBusiness } from "@/features/admin/lib/mutations";

export function BusinessDetailActions({
  businessId,
  businessName,
  isSuspended,
}: {
  businessId: string;
  businessName: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [suspendOpen, setSuspendOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isUnsuspending, setIsUnsuspending] = React.useState(false);

  async function handleUnsuspend() {
    setIsUnsuspending(true);
    try {
      await unsuspendBusiness(businessId);
      toast.success(`${businessName} unsuspended`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unsuspend",
      );
    } finally {
      setIsUnsuspending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isSuspended ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isUnsuspending}
          onClick={handleUnsuspend}
        >
          {isUnsuspending ? "Unsuspending..." : "Unsuspend"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuspendOpen(true)}
        >
          Suspend
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteOpen(true)}
      >
        Delete
      </Button>

      <SuspendBusinessDialog
        businessId={businessId}
        businessName={businessName}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />
      <DeleteBusinessDialog
        businessId={businessId}
        businessName={businessName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/admin/businesses")}
      />
    </div>
  );
}
