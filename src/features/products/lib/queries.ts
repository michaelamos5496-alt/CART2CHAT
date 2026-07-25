import { PAGE_SIZE, getPageRange } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductImage,
  ProductWithCategory,
} from "@/types/catalog";

export interface ProductsPage {
  products: ProductWithCategory[];
  totalCount: number;
  pageSize: number;
}

export async function getProductsPage(
  businessId: string,
  { search, page }: { search?: string; page?: number },
): Promise<ProductsPage> {
  const supabase = await createClient();
  const { from, to } = getPageRange(page ?? 1);

  let query = supabase
    .from("products")
    .select("*, category:categories(name)", { count: "exact" })
    .eq("business_id", businessId);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    products: (data as ProductWithCategory[] | null) ?? [],
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export async function getProductWithImages(
  businessId: string,
  productId: string,
): Promise<{ product: Product; images: ProductImage[] } | null> {
  const supabase = await createClient();

  const [productResult, imagesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
  ]);

  if (!productResult.data) return null;

  return {
    product: productResult.data as Product,
    images: (imagesResult.data as ProductImage[] | null) ?? [],
  };
}

export interface PopularProduct {
  productId: string;
  name: string;
  quantitySold: number;
}

// Aggregates order_items client-side rather than via a DB view — bounded to
// the last 500 line items, which comfortably covers a small storefront's
// dashboard summary without needing a dedicated aggregation RPC yet.
export async function getPopularProducts(
  businessId: string,
  limit = 5,
): Promise<PopularProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(500);

  const rows =
    (data as
      | { product_id: string | null; product_name: string; quantity: number }[]
      | null) ?? [];

  const byProduct = new Map<string, PopularProduct>();

  for (const row of rows) {
    if (!row.product_id) continue;
    const existing = byProduct.get(row.product_id);
    if (existing) {
      existing.quantitySold += row.quantity;
    } else {
      byProduct.set(row.product_id, {
        productId: row.product_id,
        name: row.product_name,
        quantitySold: row.quantity,
      });
    }
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}
