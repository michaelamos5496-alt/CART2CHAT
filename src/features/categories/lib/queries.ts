import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryWithProductCount } from "@/types/catalog";

// Plain list, no product counts — used where only name/id is needed (e.g.
// the product form's category picker).
export async function getCategories(businessId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true });

  return (data as Category[] | null) ?? [];
}

export async function getCategoriesWithProductCount(
  businessId: string,
  search?: string,
): Promise<CategoryWithProductCount[]> {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*, products(count)")
    .eq("business_id", businessId);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data } = await query.order("sort_order", { ascending: true });

  const rows =
    (data as (Category & { products: { count: number }[] })[] | null) ?? [];

  return rows.map(({ products, ...category }) => ({
    ...category,
    productCount: products?.[0]?.count ?? 0,
  }));
}

export async function getCategory(
  businessId: string,
  categoryId: string,
): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .eq("business_id", businessId)
    .maybeSingle();

  return data as Category | null;
}
