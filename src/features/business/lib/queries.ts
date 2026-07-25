import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types/business";

// Wrapped in React's cache() so the layout and page can both call this in
// the same request without issuing the query twice.
export const getOwnBusiness = cache(async (): Promise<Business | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return data as Business | null;
});
