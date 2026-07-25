import Link from "next/link";

import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrdersStatusFilter({
  activeStatus,
  searchQuery,
}: {
  activeStatus?: OrderStatus;
  searchQuery?: string;
}) {
  function hrefFor(status?: OrderStatus) {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (status) params.set("status", status);
    const qs = params.toString();
    return qs ? `/dashboard/orders?${qs}` : "/dashboard/orders";
  }

  function tabClassName(isActive: boolean) {
    return cn(
      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground border-transparent"
        : "border-border hover:bg-muted",
    );
  }

  return (
    <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link href={hrefFor()} className={tabClassName(!activeStatus)}>
        All
      </Link>
      {ORDER_STATUSES.map((status) => (
        <Link
          key={status}
          href={hrefFor(status)}
          className={tabClassName(activeStatus === status)}
        >
          {STATUS_LABEL[status]}
        </Link>
      ))}
    </div>
  );
}
