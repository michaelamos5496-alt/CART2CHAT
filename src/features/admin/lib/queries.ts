import { PAGE_SIZE, getPageRange } from "@/lib/constants";
import { formatMonthLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminBusinessDetail,
  AdminBusinessRow,
  PlatformFeatureFlag,
  PlatformOverview,
  RevenueByCurrency,
} from "@/types/admin";
import type { Business } from "@/types/business";
import type { Order } from "@/types/order";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const supabase = await createClient();

  const [
    totalResult,
    activeResult,
    suspendedResult,
    ordersResult,
    productsResult,
    revenueResult,
    plansResult,
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("is_suspended", false),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("is_suspended", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("currency, total_amount")
      .neq("status", "cancelled"),
    supabase.from("business_subscriptions").select("plan"),
  ]);

  const revenueRows =
    (revenueResult.data as
      { currency: string; total_amount: number }[] | null) ?? [];
  const byCurrency = new Map<string, number>();
  for (const row of revenueRows) {
    byCurrency.set(
      row.currency,
      (byCurrency.get(row.currency) ?? 0) + row.total_amount,
    );
  }
  const revenueByCurrency: RevenueByCurrency[] = Array.from(
    byCurrency.entries(),
  )
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => b.total - a.total);

  const planRows =
    (plansResult.data as { plan: SubscriptionPlan }[] | null) ?? [];
  const byPlan = new Map<SubscriptionPlan, number>();
  for (const row of planRows) {
    byPlan.set(row.plan, (byPlan.get(row.plan) ?? 0) + 1);
  }
  const planDistribution = Array.from(byPlan.entries()).map(
    ([plan, count]) => ({ plan, count }),
  );

  return {
    totalBusinesses: totalResult.count ?? 0,
    activeBusinesses: activeResult.count ?? 0,
    suspendedBusinesses: suspendedResult.count ?? 0,
    totalOrders: ordersResult.count ?? 0,
    totalProducts: productsResult.count ?? 0,
    revenueByCurrency,
    planDistribution,
  };
}

export interface MonthCount {
  label: string;
  month: string;
  count: number;
}

export async function getBusinessGrowthByMonth(
  months = 6,
): Promise<MonthCount[]> {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (months - 1));

  const { data } = await supabase
    .from("businesses")
    .select("created_at")
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

export interface BusinessesPage {
  businesses: AdminBusinessRow[];
  totalCount: number;
  pageSize: number;
}

export async function getBusinessesPage({
  search,
  page,
}: { search?: string; page?: number } = {}): Promise<BusinessesPage> {
  const supabase = await createClient();
  const { from, to } = getPageRange(page ?? 1);

  let query = supabase
    .from("businesses")
    .select("*, products(count), orders(count)", { count: "exact" });

  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    query = query.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows =
    (data as
      | (Business & {
          products: { count: number }[];
          orders: { count: number }[];
        })[]
      | null) ?? [];

  if (rows.length === 0) {
    return { businesses: [], totalCount: count ?? 0, pageSize: PAGE_SIZE };
  }

  const ownerIds = rows.map((r) => r.owner_id);
  const businessIds = rows.map((r) => r.id);

  const [profilesResult, subscriptionsResult] = await Promise.all([
    supabase.from("profiles").select("id, email").in("id", ownerIds),
    supabase
      .from("business_subscriptions")
      .select("business_id, plan, status")
      .in("business_id", businessIds),
  ]);

  const emailById = new Map(
    ((profilesResult.data as { id: string; email: string }[] | null) ?? []).map(
      (p) => [p.id, p.email],
    ),
  );
  const subscriptionByBusinessId = new Map(
    (
      (subscriptionsResult.data as
        | {
            business_id: string;
            plan: SubscriptionPlan;
            status: SubscriptionStatus;
          }[]
        | null) ?? []
    ).map((s) => [s.business_id, s]),
  );

  const businesses: AdminBusinessRow[] = rows.map((row) => {
    const subscription = subscriptionByBusinessId.get(row.id);
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      is_active: row.is_active,
      is_suspended: row.is_suspended,
      created_at: row.created_at,
      owner_email: emailById.get(row.owner_id) ?? "Unknown",
      plan: subscription?.plan ?? "starter",
      subscription_status: subscription?.status ?? "active",
      product_count: row.products?.[0]?.count ?? 0,
      order_count: row.orders?.[0]?.count ?? 0,
    };
  });

  return { businesses, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}

export async function getBusinessDetail(
  businessId: string,
): Promise<AdminBusinessDetail | null> {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) return null;

  const [
    profileResult,
    subscriptionResult,
    productCountResult,
    orderCountResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("email")
      .eq("id", (business as Business).owner_id)
      .maybeSingle(),
    supabase
      .from("business_subscriptions")
      .select("plan, status")
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("orders")
      .select("id, order_number, status, total_amount, currency, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    business: business as Business,
    ownerEmail:
      (profileResult.data as { email: string } | null)?.email ?? "Unknown",
    plan:
      (subscriptionResult.data as { plan: SubscriptionPlan } | null)?.plan ??
      "starter",
    subscriptionStatus:
      (subscriptionResult.data as { status: SubscriptionStatus } | null)
        ?.status ?? "active",
    productCount: productCountResult.count ?? 0,
    orderCount: orderCountResult.count ?? 0,
    recentOrders:
      (recentOrdersResult.data as AdminBusinessDetail["recentOrders"] | null) ??
      [],
  };
}

export interface AdminOrdersPage {
  orders: (Order & { business_name: string; business_slug: string })[];
  totalCount: number;
  pageSize: number;
}

export async function getAllOrdersPage({
  page,
}: { page?: number } = {}): Promise<AdminOrdersPage> {
  const supabase = await createClient();
  const { from, to } = getPageRange(page ?? 1);

  const { data, count } = await supabase
    .from("orders")
    .select("*, business:businesses(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows =
    (data as
      | (Order & {
          business: { name: string; slug: string } | null;
        })[]
      | null) ?? [];

  return {
    orders: rows.map(({ business, ...order }) => ({
      ...order,
      business_name: business?.name ?? "Unknown",
      business_slug: business?.slug ?? "",
    })),
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export async function getFeatureFlags(): Promise<PlatformFeatureFlag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("*")
    .order("key", { ascending: true });

  return (data as PlatformFeatureFlag[] | null) ?? [];
}
