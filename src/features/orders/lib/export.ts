import { downloadCsv, toCsv, type CsvColumn } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types/order";

// Runs client-side against the browser Supabase client (same RLS as
// everywhere else) rather than reusing the server-only query module, since
// this is triggered by a button click, not a page render.
async function fetchOrdersForExport(
  businessId: string,
  { search, status }: { search?: string; status?: OrderStatus },
): Promise<Order[]> {
  const supabase = createClient();

  let query = supabase.from("orders").select("*").eq("business_id", businessId);

  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    const conditions = [
      `customer_name.ilike.%${escaped}%`,
      `customer_phone.ilike.%${escaped}%`,
    ];
    if (/^\d+$/.test(search)) {
      conditions.push(`order_number.eq.${search}`);
    }
    query = query.or(conditions.join(","));
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    throw new Error(error.message);
  }

  return (data as Order[] | null) ?? [];
}

const COLUMNS: CsvColumn<Order>[] = [
  { key: "order_number", label: "Order #", value: (o) => o.order_number },
  { key: "status", label: "Status", value: (o) => o.status },
  { key: "created_at", label: "Placed at", value: (o) => o.created_at },
  {
    key: "customer_name",
    label: "Customer name",
    value: (o) => o.customer_name,
  },
  { key: "customer_phone", label: "Phone", value: (o) => o.customer_phone },
  {
    key: "customer_address",
    label: "Address",
    value: (o) => o.customer_address ?? "",
  },
  {
    key: "subtotal",
    label: "Subtotal",
    value: (o) => formatCurrency(o.total_amount - o.delivery_fee, o.currency),
  },
  {
    key: "delivery_fee",
    label: "Delivery fee",
    value: (o) => formatCurrency(o.delivery_fee, o.currency),
  },
  {
    key: "total_amount",
    label: "Total",
    value: (o) => formatCurrency(o.total_amount, o.currency),
  },
  { key: "notes", label: "Notes", value: (o) => o.notes ?? "" },
];

export async function exportOrdersCsv(
  businessId: string,
  filters: { search?: string; status?: OrderStatus },
) {
  const orders = await fetchOrdersForExport(businessId, filters);
  const csv = toCsv(orders, COLUMNS);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`orders-${date}.csv`, csv);
  return orders.length;
}
