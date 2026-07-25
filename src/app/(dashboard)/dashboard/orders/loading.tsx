import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function OrdersLoading() {
  return <TableSkeleton rows={8} />;
}
