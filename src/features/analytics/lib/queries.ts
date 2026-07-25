import { formatDayLabel, formatMonthLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export interface AnalyticsOverview {
  totalOrders: number;
  estimatedRevenue: number;
  totalCustomers: number;
  returningCustomers: number;
}

// "Estimated" because it includes pending + confirmed orders alongside
// completed ones (money reasonably expected, not yet realized) — only
// cancelled orders are excluded.
export async function getAnalyticsOverview(
  businessId: string,
): Promise<AnalyticsOverview> {
  const supabase = await createClient();

  const [ordersResult, revenueResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("orders")
      .select("total_amount, customer_phone")
      .eq("business_id", businessId)
      .neq("status", "cancelled"),
  ]);

  const revenueRows =
    (revenueResult.data as
      { total_amount: number; customer_phone: string }[] | null) ?? [];

  const estimatedRevenue = revenueRows.reduce(
    (sum, row) => sum + row.total_amount,
    0,
  );

  const ordersPerCustomer = new Map<string, number>();
  for (const row of revenueRows) {
    ordersPerCustomer.set(
      row.customer_phone,
      (ordersPerCustomer.get(row.customer_phone) ?? 0) + 1,
    );
  }
  const returningCustomers = Array.from(ordersPerCustomer.values()).filter(
    (count) => count > 1,
  ).length;

  return {
    totalOrders: ordersResult.count ?? 0,
    estimatedRevenue,
    totalCustomers: ordersPerCustomer.size,
    returningCustomers,
  };
}

export interface DayCount {
  label: string;
  date: string;
  count: number;
}

export async function getOrdersByDay(
  businessId: string,
  days = 14,
): Promise<DayCount[]> {
  const supabase = await createClient();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const { data } = await supabase
    .from("orders")
    .select("created_at")
    .eq("business_id", businessId)
    .gte("created_at", since.toISOString());

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setDate(day.getDate() + i);
    counts.set(day.toISOString().slice(0, 10), 0);
  }

  for (const row of (data as { created_at: string }[] | null) ?? []) {
    const key = row.created_at.slice(0, 10);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({
    date,
    label: formatDayLabel(date),
    count,
  }));
}

export interface MonthCount {
  label: string;
  month: string;
  count: number;
}

export async function getOrdersByMonth(
  businessId: string,
  months = 6,
): Promise<MonthCount[]> {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (months - 1));

  const { data } = await supabase
    .from("orders")
    .select("created_at")
    .eq("business_id", businessId)
    .gte("created_at", since.toISOString());

  const counts = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const month = new Date(since);
    month.setMonth(month.getMonth() + i);
    counts.set(month.toISOString().slice(0, 7), 0);
  }

  for (const row of (data as { created_at: string }[] | null) ?? []) {
    const key = row.created_at.slice(0, 7);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([month, count]) => ({
    month,
    label: formatMonthLabel(month),
    count,
  }));
}

export interface RankedProduct {
  productId: string;
  name: string;
  value: number;
}

export async function getMostViewedProducts(
  businessId: string,
  limit = 5,
): Promise<RankedProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, view_count")
    .eq("business_id", businessId)
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(limit);

  return (
    (data as { id: string; name: string; view_count: number }[] | null) ?? []
  ).map((row) => ({
    productId: row.id,
    name: row.name,
    value: row.view_count,
  }));
}
