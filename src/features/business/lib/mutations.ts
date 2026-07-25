import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "logos";

// Mirrors the UI-level gating (branding fields disabled for plans without
// has_custom_branding), but re-checked here so calling the mutation
// directly can't bypass it — same principle as the DB-level product/
// category limit triggers, just enforced in the app layer since storage
// uploads don't go through a single insertable table a trigger could sit on.
async function assertCanCustomizeBranding(businessId: string) {
  const supabase = createClient();

  const { data: subscription } = await supabase
    .from("business_subscriptions")
    .select("plan")
    .eq("business_id", businessId)
    .maybeSingle();

  const plan = subscription?.plan ?? "starter";

  const { data: limits } = await supabase
    .from("plan_limits")
    .select("has_custom_branding")
    .eq("plan", plan)
    .maybeSingle();

  if (!limits?.has_custom_branding) {
    throw new Error(
      "Custom branding isn't available on your current plan. Upgrade to add a logo or banner.",
    );
  }
}

async function uploadBusinessImage(
  businessId: string,
  column: "logo_path" | "banner_path",
  file: File,
  previousPath: string | null,
): Promise<string> {
  await assertCanCustomizeBranding(businessId);

  const supabase = createClient();
  const compressed = await compressImage(file);
  const prefix = column === "logo_path" ? "logo" : "banner";
  const path = `${businessId}/${prefix}-${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, compressed, { contentType: "image/webp" });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error } = await supabase
    .from("businesses")
    .update(
      column === "logo_path" ? { logo_path: path } : { banner_path: path },
    )
    .eq("id", businessId);

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    throw new Error(error.message);
  }

  if (previousPath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([previousPath]);
  }

  return path;
}

async function removeBusinessImage(
  businessId: string,
  column: "logo_path" | "banner_path",
  path: string,
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("businesses")
    .update(
      column === "logo_path" ? { logo_path: null } : { banner_path: null },
    )
    .eq("id", businessId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

export const uploadBusinessLogo = (
  businessId: string,
  file: File,
  previousPath: string | null,
) => uploadBusinessImage(businessId, "logo_path", file, previousPath);

export const uploadBusinessBanner = (
  businessId: string,
  file: File,
  previousPath: string | null,
) => uploadBusinessImage(businessId, "banner_path", file, previousPath);

export const removeBusinessLogo = (businessId: string, path: string) =>
  removeBusinessImage(businessId, "logo_path", path);

export const removeBusinessBanner = (businessId: string, path: string) =>
  removeBusinessImage(businessId, "banner_path", path);

export function getBusinessImageUrl(storagePath: string) {
  const supabase = createClient();
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data
    .publicUrl;
}
