import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";
import type {
  Category,
  Product,
  ProductImage,
  StorefrontProduct,
  StorefrontProductDetail,
} from "@/types/catalog";
import type { Business } from "@/types/business";
import type { BusinessSettings } from "@/types/business-settings";

// All reads here go through RLS as the anon role — the same access a real
// customer gets. Inactive businesses, unavailable/draft/archived products,
// and inactive categories are filtered out by the database policies
// themselves, not by query conditions, so there's a single source of truth
// for "is this publicly visible."

// cache()'d so the layout and page can both resolve the business for a
// request without issuing the query twice.
export const getStorefrontBusiness = cache(async function getStorefrontBusiness(
  slug: string,
): Promise<Business | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data as Business | null;
});

export async function getStorefrontCategories(
  businessId: string,
): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true });

  return (data as Category[] | null) ?? [];
}

type ProductRow = Product & {
  product_images: Pick<ProductImage, "storage_path" | "sort_order">[] | null;
};

function primaryImagePath(
  images: Pick<ProductImage, "storage_path" | "sort_order">[] | null,
): string | null {
  if (!images || images.length === 0) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]
    .storage_path;
}

function toStorefrontProducts(rows: ProductRow[] | null): StorefrontProduct[] {
  return (rows ?? []).map(({ product_images, ...product }) => ({
    ...product,
    primaryImagePath: primaryImagePath(product_images),
  }));
}

export async function getStorefrontProducts(
  businessId: string,
  { search, categoryId }: { search?: string; categoryId?: string },
): Promise<StorefrontProduct[]> {
  const supabase = createPublicClient();

  let query = supabase
    .from("products")
    .select("*, product_images(storage_path, sort_order)")
    .eq("business_id", businessId);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query.order("sort_order", { ascending: true });

  return toStorefrontProducts(data as ProductRow[] | null);
}

export async function getFeaturedProducts(
  businessId: string,
  limit = 8,
): Promise<StorefrontProduct[]> {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("products")
    .select("*, product_images(storage_path, sort_order)")
    .eq("business_id", businessId)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  return toStorefrontProducts(data as ProductRow[] | null);
}

export async function getStorefrontProduct(
  businessId: string,
  productSlug: string,
): Promise<StorefrontProductDetail | null> {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("products")
    .select("*, category:categories(name, slug), images:product_images(*)")
    .eq("business_id", businessId)
    .eq("slug", productSlug)
    .maybeSingle();

  if (!data) return null;

  const { images, ...product } = data as Product & {
    category: Pick<Category, "name" | "slug"> | null;
    images: ProductImage[];
  };

  return {
    ...product,
    images: [...images].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getStorefrontSettings(
  businessId: string,
): Promise<
  Pick<BusinessSettings, "delivery_fee" | "whatsapp_message_template">
> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("business_settings")
    .select("delivery_fee, whatsapp_message_template")
    .eq("business_id", businessId)
    .maybeSingle();

  return {
    delivery_fee: data?.delivery_fee ?? 0,
    whatsapp_message_template: data?.whatsapp_message_template ?? "",
  };
}
