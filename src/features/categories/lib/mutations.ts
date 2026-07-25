import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { CategoryInput } from "@/lib/validations/category";
import type { Category } from "@/types/catalog";

const STORAGE_BUCKET = "category-images";

export async function createCategory(
  businessId: string,
  values: CategoryInput,
) {
  const supabase = createClient();

  const { data: slug, error: slugError } = await supabase.rpc(
    "generate_unique_category_slug",
    { p_business_id: businessId, p_base: values.name },
  );

  if (slugError || !slug) {
    throw new Error(slugError?.message ?? "Failed to generate category slug");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      business_id: businessId,
      name: values.name,
      slug,
      is_active: values.isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create category");
  }

  return data as { id: string };
}

export async function updateCategory(
  categoryId: string,
  values: CategoryInput,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: values.name, is_active: values.isActive })
    .eq("id", categoryId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCategory(category: Category) {
  const supabase = createClient();

  if (category.image_path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([category.image_path]);
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", category.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function reorderCategories(
  updates: { id: string; sortOrder: number }[],
) {
  const supabase = createClient();

  const results = await Promise.all(
    updates.map(({ id, sortOrder }) =>
      supabase
        .from("categories")
        .update({ sort_order: sortOrder })
        .eq("id", id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }
}

export async function uploadCategoryImage(
  businessId: string,
  categoryId: string,
  file: File,
  previousPath: string | null,
): Promise<string> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const path = `${businessId}/${categoryId}/${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, compressed, { contentType: "image/webp" });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error } = await supabase
    .from("categories")
    .update({ image_path: path })
    .eq("id", categoryId);

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    throw new Error(error.message);
  }

  if (previousPath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([previousPath]);
  }

  return path;
}

export async function removeCategoryImage(categoryId: string, path: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("categories")
    .update({ image_path: null })
    .eq("id", categoryId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

export function getCategoryImageUrl(storagePath: string) {
  const supabase = createClient();
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data
    .publicUrl;
}
