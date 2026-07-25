import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Used on login/signup/forgot-password pages so an already-authenticated
// visitor is bounced straight to their dashboard instead of seeing the form.
export async function redirectIfAuthenticated(destination = "/dashboard") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(destination);
  }
}
