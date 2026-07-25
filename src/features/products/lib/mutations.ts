import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { ProductInput } from "@/lib/validations/product";
import type { ProductImage } from "@/types/catalog";

const STORAGE_BUCKET = "product-images";

export async function createProduct(businessId: string, values: ProductInput) {
  const supabase = createClient();

  const { data: slug, error: slugError } = await supabase.rpc(
    "generate_unique_product_slug",
    { p_business_id: businessId, p_base: values.name },
  );

  if (slugError || !slug) {
    throw new Error(slugError?.message ?? "Failed to generate product slug");
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      business_id: businessId,
      category_id: values.categoryId,
      name: values.name,
      slug,
      description: values.description || null,
      price: values.price,
      is_available: values.isAvailable,
      is_featured: values.isFeatured,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create product");
  }

  return data as { id: string };
}

export async function updateProduct(productId: string, values: ProductInput) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({
      category_id: values.categoryId,
      name: values.name,
      description: values.description || null,
      price: values.price,
      is_available: values.isAvailable,
      is_featured: values.isFeatured,
      status: values.status,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(businessId: string, productId: string) {
  const supabase = createClient();

  // DB row first, storage cleanup second: if the delete fails (RLS,
  // network, FK constraint) the product survives with its images intact
  // rather than surviving with its images already gone. A leaked storage
  // folder after a successful delete is a much smaller problem than an
  // undeletable product missing all its photos.
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  const folder = `${businessId}/${productId}`;
  const { data: files } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder);

  if (files && files.length > 0) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(files.map((file) => `${folder}/${file.name}`));
  }
}

export async function uploadProductImage(
  businessId: string,
  productId: string,
  file: File,
  sortOrder: number,
): Promise<ProductImage> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const path = `${businessId}/${productId}/${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, compressed, { contentType: "image/webp" });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      business_id: businessId,
      storage_path: path,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error || !data) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    throw new Error(error?.message ?? "Failed to save image");
  }

  return data as ProductImage;
}

export async function deleteProductImage(image: ProductImage) {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([image.storage_path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image.id);

  if (error) {
    throw new Error(error.message);
  }
}

export function getProductImageUrl(storagePath: string) {
  const supabase = createClient();
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data
    .publicUrl;
}
