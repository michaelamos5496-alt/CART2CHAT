import { createClient } from "@/lib/supabase/client";
import type { StoreSettingsInput } from "@/lib/validations/store-settings";

export async function updateStoreSettings(
  businessId: string,
  values: StoreSettingsInput,
) {
  const supabase = createClient();

  const [businessResult, settingsResult] = await Promise.all([
    supabase
      .from("businesses")
      .update({
        name: values.name,
        description: values.description || null,
        whatsapp_number: values.whatsappNumber,
        theme_color: values.themeColor,
        currency: values.currency,
        category: values.category,
      })
      .eq("id", businessId),
    supabase
      .from("business_settings")
      .update({
        delivery_fee: values.deliveryFee,
        business_hours: values.businessHours,
        social_links: values.socialLinks,
      })
      .eq("business_id", businessId),
  ]);

  if (businessResult.error) {
    throw new Error(businessResult.error.message);
  }
  if (settingsResult.error) {
    throw new Error(settingsResult.error.message);
  }
}

export async function cancelSubscription() {
  const supabase = createClient();
  const { error } = await supabase.rpc("cancel_subscription");

  if (error) {
    throw new Error(error.message);
  }
}

export async function resumeSubscription() {
  const supabase = createClient();
  const { error } = await supabase.rpc("resume_subscription");

  if (error) {
    throw new Error(error.message);
  }
}
