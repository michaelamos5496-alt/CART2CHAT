import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Order } from "@/types/order";

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No orders found"
        description="Try a different search or filter."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden sm:table-cell">Phone</TableHead>
            <TableHead className="hidden md:table-cell">Placed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="hover:underline"
                >
                  #{order.order_number}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="hover:underline"
                >
                  {order.customer_name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground hidden sm:table-cell">
                {order.customer_phone}
              </TableCell>
              <TableCell className="text-muted-foreground hidden md:table-cell">
                {formatDate(order.created_at)}
              </TableCell>
              <TableCell>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.total_amount, order.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
