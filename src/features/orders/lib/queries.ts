import { PAGE_SIZE, getPageRange } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  Order,
  OrderDetail,
  OrderItem,
  OrderStatus,
  OrderStatusHistoryEntry,
} from "@/types/order";

export async function getRecentOrders(
  businessId: string,
  limit = 5,
): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as Order[] | null) ?? [];
}

// Generic over just the two fluent methods actually used here, rather than
// naming Postgrest's internal builder type or falling back to `any` — `T`
// gets inferred from whatever `.eq(...)`/`.or(...)`-chainable query the
// caller passes in, and the same concrete type comes back out.
function applyOrderFilters<
  T extends {
    or: (conditions: string) => T;
    eq: (column: string, value: string) => T;
  },
>(query: T, { search, status }: { search?: string; status?: OrderStatus }): T {
  let filtered = query;

  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    const conditions = [
      `customer_name.ilike.%${escaped}%`,
      `customer_phone.ilike.%${escaped}%`,
    ];
    if (/^\d+$/.test(search)) {
      conditions.push(`order_number.eq.${search}`);
    }
    filtered = filtered.or(conditions.join(","));
  }

  if (status) {
    filtered = filtered.eq("status", status);
  }

  return filtered;
}

export interface OrdersPage {
  orders: Order[];
  totalCount: number;
  pageSize: number;
}

export async function getOrdersPage(
  businessId: string,
  {
    search,
    status,
    page,
  }: { search?: string; status?: OrderStatus; page?: number },
): Promise<OrdersPage> {
  const supabase = await createClient();
  const { from, to } = getPageRange(page ?? 1);

  const baseQuery = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("business_id", businessId);

  const { data, count } = await applyOrderFilters(baseQuery, {
    search,
    status,
  })
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    orders: (data as Order[] | null) ?? [],
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

// Unpaginated — used for CSV export of the current filtered view. Capped so
// a single export can't run away on a very large order history.
export async function getOrdersForExport(
  businessId: string,
  { search, status }: { search?: string; status?: OrderStatus },
): Promise<Order[]> {
  const supabase = await createClient();

  const baseQuery = supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId);

  const { data } = await applyOrderFilters(baseQuery, { search, status })
    .order("created_at", { ascending: false })
    .limit(5000);

  return (data as Order[] | null) ?? [];
}

export async function getOrderDetail(
  businessId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const [orderResult, itemsResult, historyResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: true }),
  ]);

  if (!orderResult.data) return null;

  return {
    ...(orderResult.data as Order),
    items: (itemsResult.data as OrderItem[] | null) ?? [],
    history: (historyResult.data as OrderStatusHistoryEntry[] | null) ?? [],
  };
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  revenue: number;
}

export async function getOrderStatusBreakdown(
  businessId: string,
): Promise<OrderStatusBreakdown[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("status, total_amount")
    .eq("business_id", businessId);

  const rows =
    (data as { status: string; total_amount: number }[] | null) ?? [];
  const byStatus = new Map<string, OrderStatusBreakdown>();

  for (const row of rows) {
    const existing = byStatus.get(row.status);
    if (existing) {
      existing.count += 1;
      existing.revenue += row.total_amount;
    } else {
      byStatus.set(row.status, {
        status: row.status,
        count: 1,
        revenue: row.total_amount,
      });
    }
  }

  return Array.from(byStatus.values()).sort((a, b) => b.count - a.count);
}
