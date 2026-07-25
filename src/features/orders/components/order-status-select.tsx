"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/features/orders/lib/mutations";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderStatusSelect({
  orderId,
  status,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(status);
  const [isUpdating, setIsUpdating] = React.useState(false);

  async function handleChange(next: string | null) {
    if (!next) return;
    const nextStatus = next as OrderStatus;
    const previous = value;
    setValue(nextStatus);
    setIsUpdating(true);

    try {
      await updateOrderStatus(orderId, nextStatus);
      toast.success(`Order marked ${STATUS_LABEL[nextStatus].toLowerCase()}`);
      router.refresh();
    } catch (error) {
      setValue(previous);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className={className} size="sm">
        {isUpdating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((option) => (
          <SelectItem key={option} value={option}>
            {STATUS_LABEL[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
