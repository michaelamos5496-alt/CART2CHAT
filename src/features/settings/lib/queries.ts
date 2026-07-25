import { createClient } from "@/lib/supabase/server";
import type { BusinessSettings } from "@/types/business-settings";

export async function getBusinessSettings(
  businessId: string,
): Promise<BusinessSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  return data as BusinessSettings | null;
}
