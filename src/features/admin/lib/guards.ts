import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const checkIsSuperAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase.rpc("is_super_admin");
  return data === true;
});

// Silently redirects rather than showing a 403 — an authenticated
// non-admin gets sent back to their own dashboard as if /admin simply
// isn't part of their app, rather than a page that confirms an admin
// panel exists and that they're denied access to it.
export async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await checkIsSuperAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }
}
