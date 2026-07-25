import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
}

export async function getDashboardStats(
  businessId: string,
): Promise<DashboardStats> {
  const supabase = await createClient();

  const [ordersResult, pendingResult, productsResult, revenueResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "pending"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("orders")
        .select("total_amount")
        .eq("business_id", businessId)
        .eq("status", "completed"),
    ]);

  const totalRevenue = (
    (revenueResult.data as { total_amount: number }[] | null) ?? []
  ).reduce((sum, row) => sum + row.total_amount, 0);

  return {
    totalRevenue,
    totalOrders: ordersResult.count ?? 0,
    pendingOrders: pendingResult.count ?? 0,
    totalProducts: productsResult.count ?? 0,
  };
}
