import { CheckCircle2, CircleDot, PackageCheck, XCircle } from "lucide-react";

import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderStatusHistoryEntry } from "@/types/order";

const STATUS_META: Record<
  OrderStatus,
  { label: string; icon: typeof CircleDot; className: string }
> = {
  pending: {
    label: "Order placed",
    icon: CircleDot,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    icon: PackageCheck,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-muted text-muted-foreground",
  },
};

export function OrderTimeline({
  history,
}: {
  history: OrderStatusHistoryEntry[];
}) {
  if (history.length === 0) {
    return <p className="text-muted-foreground text-sm">No history yet.</p>;
  }

  return (
    <ol className="grid gap-4">
      {history.map((entry, index) => {
        const meta = STATUS_META[entry.status];
        const Icon = meta.icon;
        const isLast = index === history.length - 1;

        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  meta.className,
                )}
              >
                <Icon className="size-4" />
              </span>
              {!isLast && <span className="bg-border mt-1 w-px flex-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="text-muted-foreground text-xs">
                {formatDate(entry.changed_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
