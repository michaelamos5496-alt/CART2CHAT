import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, StickyNote, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { getOrderDetail } from "@/features/orders/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getOwnBusiness();
  if (!business) return null;

  const order = await getOrderDetail(business.id, id);
  if (!order) {
    notFound();
  }

  const subtotal = order.total_amount - order.delivery_fee;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Link
          href="/dashboard/orders"
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Order #{order.order_number}
            </h1>
            <p className="text-muted-foreground text-sm">
              Placed {formatDate(order.created_at)}
            </p>
          </div>
          <OrderStatusSelect orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground size-4 shrink-0" />
                {order.customer_name}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground size-4 shrink-0" />
                {order.customer_phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground size-4 shrink-0" />
                {order.customer_address ?? (
                  <span className="text-muted-foreground">
                    No address provided (pickup)
                  </span>
                )}
              </div>
              {order.notes && (
                <div className="flex items-start gap-2">
                  <StickyNote className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <span>{order.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price, order.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.subtotal, order.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 grid gap-1.5 border-t pt-4 text-sm">
                <div className="text-muted-foreground flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, order.currency)}</span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {order.delivery_fee > 0
                      ? formatCurrency(order.delivery_fee, order.currency)
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline history={order.history} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
